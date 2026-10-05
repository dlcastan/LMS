import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { decrypt } from "@/lib/session";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  if (!session) redirect("/login");
  return session;
});

export const getUser = cache(async () => {
  const { userId } = await verifySession();
  const { rows } = await pool.query<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = $1",
    [userId],
  );
  // Sesión válida pero usuario inexistente: se trata como no autenticado.
  if (!rows[0]) redirect("/login");
  return rows[0];
});
