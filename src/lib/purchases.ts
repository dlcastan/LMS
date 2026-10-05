import "server-only";
import { pool } from "@/lib/db";
import type { MpPayment } from "@/lib/mercadopago";

export type ApplyResult =
  | "approved" // se habilitó el curso en esta llamada
  | "already_processed" // notificación repetida: no hubo cambios
  | "updated" // cambió el estado, sin habilitar
  | "ignored"; // pago sin compra asociada o con datos que no coinciden

export async function createPendingPurchase(input: {
  userId: string;
  courseId: string;
  amountCents: number;
  currency: string;
}) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO purchases (user_id, course_id, amount_cents, currency)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.userId, input.courseId, input.amountCents, input.currency],
  );
  return rows[0].id;
}

export async function setPreferenceId(purchaseId: string, preferenceId: string) {
  await pool.query(
    "UPDATE purchases SET mp_preference_id = $2, updated_at = now() WHERE id = $1",
    [purchaseId, preferenceId],
  );
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapStatus(mpStatus: string): "pending" | "approved" | "rejected" {
  if (mpStatus === "approved") return "approved";
  if (mpStatus === "rejected" || mpStatus === "cancelled") return "rejected";
  return "pending";
}

// Aplica el estado de un pago de Mercado Pago. Es idempotente: procesar el
// mismo pago varias veces deja el mismo resultado que procesarlo una vez. El
// bloqueo de fila (FOR UPDATE) cubre notificaciones concurrentes del mismo pago.
export async function applyPayment(payment: MpPayment): Promise<ApplyResult> {
  const reference = payment.external_reference;
  if (!reference || !UUID.test(reference)) return "ignored";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{
      id: string;
      user_id: string;
      course_id: string;
      status: string;
      amount_cents: number;
      currency: string;
      mp_payment_id: string | null;
    }>("SELECT * FROM purchases WHERE id = $1 FOR UPDATE", [reference]);
    const purchase = rows[0];
    if (!purchase) {
      await client.query("ROLLBACK");
      return "ignored";
    }

    const paymentId = String(payment.id);
    const next = mapStatus(payment.status);

    // Una compra ya aprobada no se modifica con notificaciones posteriores.
    // Las reversiones (RF-17) se tratan en una etapa posterior.
    if (purchase.status === "approved") {
      await client.query("ROLLBACK");
      return "already_processed";
    }

    // El pago debe coincidir con lo que se cobró en esta compra.
    const expectedAmount = purchase.amount_cents / 100;
    if (
      next === "approved" &&
      (payment.transaction_amount !== expectedAmount ||
        payment.currency_id !== purchase.currency)
    ) {
      await client.query("ROLLBACK");
      return "ignored";
    }

    await client.query(
      `UPDATE purchases
          SET status = $2, mp_payment_id = $3, updated_at = now()
        WHERE id = $1`,
      [purchase.id, next, paymentId],
    );

    if (next === "approved") {
      await client.query(
        `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [purchase.user_id, purchase.course_id],
      );
    }

    await client.query("COMMIT");
    return next === "approved" ? "approved" : "updated";
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
