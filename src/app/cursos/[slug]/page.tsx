import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getMyCourse } from "@/lib/courses";
import { ProgressBar } from "@/app/ui/progress-bar";
import styles from "@/app/ui/course.module.css";

export default async function CursoPage(props: PageProps<"/cursos/[slug]">) {
  const { slug } = await props.params;
  const { userId } = await verifySession();
  const course = await getMyCourse(userId, slug);
  if (!course) notFound();

  return (
    <main className={styles.page}>
      <Link href="/cuenta" className={styles.back}>
        ← Mi cuenta
      </Link>
      <div>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <p className={styles.meta}>Avance: {course.percent}%</p>
        <ProgressBar percent={course.percent} />
      </div>

      <ol className={styles.list}>
        {course.lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/cursos/${course.slug}/clases/${lesson.position}`}
              className={`${styles.card} ${styles.lesson}`}
            >
              <span>
                {lesson.position}. {lesson.title}
              </span>
              <span className={styles.meta}>
                {lesson.watched ? "Vista" : "No vista"}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
