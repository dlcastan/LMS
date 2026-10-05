import { logout } from "@/app/actions/auth";
import { getUser } from "@/lib/dal";
import styles from "@/app/ui/auth-form.module.css";

export const metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const user = await getUser();

  return (
    <main className={styles.wrapper}>
      <div className={styles.form}>
        <h1>Mi cuenta</h1>
        <p>
          Sesión iniciada como <strong>{user.email}</strong>.
        </p>
        <form action={logout}>
          <button type="submit">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}
