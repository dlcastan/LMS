"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/app/actions/auth";
import styles from "./auth-form.module.css";

type Props = {
  title: string;
  submitLabel: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  autoComplete: "new-password" | "current-password";
  alt: { text: string; href: string; label: string };
};

export function AuthForm({ title, submitLabel, action, autoComplete, alt }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className={styles.wrapper}>
      <form action={formAction} className={styles.form}>
        <h1>{title}</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={autoComplete}
          required
        />

        <p role="alert" aria-live="polite" className={styles.error}>
          {state?.error}
        </p>

        <button type="submit" disabled={pending}>
          {submitLabel}
        </button>

        <p className={styles.alt}>
          {alt.text} <Link href={alt.href}>{alt.label}</Link>
        </p>
      </form>
    </main>
  );
}
