"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { pool } from "@/lib/db";
import { createPreference } from "@/lib/mercadopago";
import { createPendingPurchase, setPreferenceId } from "@/lib/purchases";

// Crea la compra pendiente, la preferencia de pago en Mercado Pago y manda al
// alumno a su checkout. El curso se habilita recién cuando llega el webhook.
export async function startPurchase(slug: string) {
  const { userId } = await verifySession();

  const { rows } = await pool.query<{
    id: string;
    title: string;
    price_cents: number;
    currency: string;
    owned: boolean;
  }>(
    `SELECT c.id, c.title, c.price_cents, c.currency,
            EXISTS (SELECT 1 FROM enrollments e
                     WHERE e.course_id = c.id AND e.user_id = $1) AS owned
       FROM courses c WHERE c.slug = $2`,
    [userId, slug],
  );
  const course = rows[0];
  if (!course || course.price_cents <= 0) redirect("/cuenta");
  if (course.owned) redirect(`/cursos/${slug}`);

  const purchaseId = await createPendingPurchase({
    userId,
    courseId: course.id,
    amountCents: course.price_cents,
    currency: course.currency,
  });

  const { preferenceId, checkoutUrl } = await createPreference({
    purchaseId,
    title: course.title,
    amountCents: course.price_cents,
    currency: course.currency,
  });
  await setPreferenceId(purchaseId, preferenceId);

  redirect(checkoutUrl);
}
