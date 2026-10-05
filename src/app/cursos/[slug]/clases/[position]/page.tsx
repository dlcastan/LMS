import Link from "next/link";
import { notFound } from "next/navigation";
import { setLessonWatched } from "@/app/actions/progress";
import { verifySession } from "@/lib/dal";
import { getMyLesson } from "@/lib/courses";
import styles from "@/app/ui/course.module.css";

export default async function ClasePage(
  props: PageProps<"/cursos/[slug]/clases/[position]">,
) {
  const { slug, position: rawPosition } = await props.params;
  const position = Number(rawPosition);
  if (!Number.isInteger(position)) notFound();

  const { userId } = await verifySession();
  const lesson = await getMyLesson(userId, slug, position);
  if (!lesson) notFound();

  const toggle = setLessonWatched.bind(
    null,
    lesson.id,
    !lesson.watched,
    slug,
    position,
  );

  return (
    <main className={styles.page}>
      <Link href={`/cursos/${slug}`} className={styles.back}>
        ← Volver al curso
      </Link>
      <h1>
        {lesson.position}. {lesson.title}
      </h1>

      <div className={styles.video}>
        <p>El video de esta clase todavía no está disponible.</p>
      </div>

      <p>{lesson.description}</p>

      {lesson.keywords.length > 0 && (
        <ul className={styles.keywords} aria-label="Palabras clave">
          {lesson.keywords.map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <form action={toggle}>
          <button type="submit" className={styles.button}>
            {lesson.watched ? "Marcar como no vista" : "Marcar como vista"}
          </button>
        </form>
      </div>
      <p className={styles.meta}>
        Estado: {lesson.watched ? "Vista" : "No vista"}
      </p>
    </main>
  );
}
