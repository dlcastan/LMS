import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getUser } from "@/lib/dal";
import { getMyCourses, progressPercent } from "@/lib/courses";
import { ProgressBar } from "@/app/ui/progress-bar";
import styles from "@/app/ui/course.module.css";

export const metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const user = await getUser();
  const courses = await getMyCourses(user.id);

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
    </main>
  );
}
