"use server";

import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type FormState = { error?: string; email?: string } | undefined;

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = "23505";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { email, password } = readCredentials(formData);

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Ingresá un email válido.", email };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      email,
    };
  }

  let userId: string;
  try {
    const { rows } = await pool.query<{ id: string }>(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, await hashPassword(password)],
    );
    userId = rows[0].id;
  } catch (err) {
    if ((err as { code?: string }).code === UNIQUE_VIOLATION) {
      return { error: "Ya existe una cuenta con ese email.", email };
    }
    throw err;
  }

  await createSession(userId);
  redirect("/cuenta");
}

export async function login(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { email, password } = readCredentials(formData);
  const invalid = { error: "Email o contraseña incorrectos.", email };

  const { rows } = await pool.query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return invalid;
  }

  await createSession(user.id);
  redirect("/cuenta");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
