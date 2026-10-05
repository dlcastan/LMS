import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API_URL = process.env.MERCADOPAGO_API_URL ?? "https://api.mercadopago.com";

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function authHeaders() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export type MpPayment = {
  id: number | string;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
};

export async function createPreference(input: {
  purchaseId: string;
  title: string;
  amountCents: number;
  currency: string;
}) {
  const res = await fetch(`${API_URL}/checkout/preferences`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      items: [
        {
          title: input.title,
          quantity: 1,
          unit_price: input.amountCents / 100,
          currency_id: input.currency,
        },
      ],
      external_reference: input.purchaseId,
      notification_url: `${APP_URL}/api/mercadopago/webhook`,
      back_urls: {
        success: `${APP_URL}/cuenta?pago=ok`,
        pending: `${APP_URL}/cuenta?pago=pendiente`,
        failure: `${APP_URL}/cuenta?pago=error`,
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Mercado Pago no creó la preferencia (${res.status})`);
  }
  const data = (await res.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  const useSandbox = process.env.MERCADOPAGO_SANDBOX === "true";
  return {
    preferenceId: data.id,
    checkoutUrl:
      useSandbox && data.sandbox_init_point
        ? data.sandbox_init_point
        : data.init_point,
  };
}

// El webhook solo avisa que hay novedades: el estado real del pago se consulta
// siempre a la API de Mercado Pago, nunca se confía en el cuerpo recibido.
export async function getPayment(paymentId: string): Promise<MpPayment> {
  const res = await fetch(
    `${API_URL}/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: authHeaders(), cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Mercado Pago no devolvió el pago ${paymentId} (${res.status})`);
  }
  return (await res.json()) as MpPayment;
}

// Firma de notificaciones: x-signature = "ts=...,v1=<hmac sha256>" sobre
// "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
export function verifyWebhookSignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !input.signatureHeader) return false;

  const parts = Object.fromEntries(
    input.signatureHeader.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.requestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
