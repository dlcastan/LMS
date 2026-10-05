"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { verifySession } from "@/lib/dal";

// Marca o desmarca una clase como vista. Solo aplica si el alumno tiene acceso
// al curso de la clase (join con enrollments).
export async function setLessonWatched(
  lessonId: string,
  watched: boolean,
  slug: string,
  position: number,
) {
  const { userId } = await verifySession();

  if (watched) {
    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id)
       SELECT $1, l.id
         FROM lessons l
         JOIN enrollments e ON e.course_id = l.course_id AND e.user_id = $1
        WHERE l.id = $2
       ON CONFLICT DO NOTHING`,
      [userId, lessonId],
    );
  } else {
    await pool.query(
      "DELETE FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2",
      [userId, lessonId],
    );
  }

  revalidatePath(`/cursos/${slug}/clases/${position}`);
  revalidatePath(`/cursos/${slug}`);
  revalidatePath("/cuenta");
}
