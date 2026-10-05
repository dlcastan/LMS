import { getPayment, verifyWebhookSignature } from "@/lib/mercadopago";
import { applyPayment } from "@/lib/purchases";

// Notificaciones de Mercado Pago. Códigos de respuesta:
//   401 firma inválida (no reintentar), 200 procesada o sin nada que hacer,
//   500 error transitorio: Mercado Pago reintenta la notificación.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => null);

  const type = url.searchParams.get("type") ?? body?.type;
  const dataId = String(url.searchParams.get("data.id") ?? body?.data?.id ?? "");

  const validSignature = verifyWebhookSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
  });
  if (!validSignature) {
    return new Response("firma inválida", { status: 401 });
  }

  // Solo interesan los pagos; otros tipos de aviso se reconocen sin procesar.
  if (type !== "payment" || !dataId) {
    return new Response("ignorado", { status: 200 });
  }

  try {
    const payment = await getPayment(dataId);
    const result = await applyPayment(payment);
    return Response.json({ result });
  } catch (err) {
    console.error("webhook de Mercado Pago falló", err);
    return new Response("error", { status: 500 });
  }
}
