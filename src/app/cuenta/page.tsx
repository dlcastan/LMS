import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getUser } from "@/lib/dal";
import {
  getAvailableCourses,
  getMyCourses,
  progressPercent,
} from "@/lib/courses";
import { ProgressBar } from "@/app/ui/progress-bar";
import styles from "@/app/ui/course.module.css";

export const metadata = { title: "Mi cuenta" };

const PAYMENT_MESSAGES: Record<string, string> = {
  ok: "Recibimos tu pago. El curso aparece en Mis cursos apenas Mercado Pago lo confirme.",
  pendiente: "Tu pago está pendiente. El curso se habilita cuando Mercado Pago lo apruebe.",
  error: "No se pudo completar el pago. Podés intentarlo de nuevo.",
};

export default async function CuentaPage(props: PageProps<"/cuenta">) {
  const { pago } = await props.searchParams;
  const paymentMessage = typeof pago === "string" ? PAYMENT_MESSAGES[pago] : undefined;

  const user = await getUser();
  const [courses, available] = await Promise.all([
    getMyCourses(user.id),
    getAvailableCourses(user.id),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Mi cuenta</h1>
          <p className={styles.meta}>
            Sesión iniciada como <strong>{user.email}</strong>
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className={styles.buttonSecondary}>
            Cerrar sesión
          </button>
        </form>
      </div>

      {paymentMessage && (
        <p role="status" className={styles.card}>
          {paymentMessage}
        </p>
      )}

      <section>
        <h2>Mis cursos</h2>
        {courses.length === 0 ? (
          <p>Todavía no tenés cursos.</p>
        ) : (
          <ul className={styles.list}>
            {courses.map((course) => {
              const percent = progressPercent(
                course.watchedLessons,
                course.totalLessons,
              );
              return (
                <li key={course.id}>
                  <Link href={`/cursos/${course.slug}`} className={styles.card}>
                    <h3>{course.title}</h3>
                    <p className={styles.meta}>
                      {course.watchedLessons} de {course.totalLessons} clases
                      vistas · {percent}%
                    </p>
                    <ProgressBar percent={percent} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {available.length > 0 && (
        <section>
          <h2>Cursos disponibles</h2>
          <ul className={styles.list}>
            {available.map((course) => (
              <li key={course.id}>
                <Link href={`/comprar/${course.slug}`} className={styles.card}>
                  <h3>{course.title}</h3>
                  <p className={styles.meta}>{course.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
