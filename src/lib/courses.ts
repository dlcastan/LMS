import "server-only";
import { pool } from "@/lib/db";

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalLessons: number;
  watchedLessons: number;
};

export type LessonItem = {
  id: string;
  position: number;
  title: string;
  watched: boolean;
};

export type LessonDetail = LessonItem & {
  description: string;
  keywords: string[];
  videoId: string | null;
};

export function progressPercent(watched: number, total: number) {
  return total === 0 ? 0 : Math.round((watched / total) * 100);
}

// Todas las consultas filtran por enrollments: un alumno solo ve cursos a los
// que tiene acceso.
export async function getMyCourses(userId: string): Promise<CourseSummary[]> {
  const { rows } = await pool.query(
    `SELECT c.id, c.slug, c.title, c.description,
            (SELECT count(*) FROM lessons l WHERE l.course_id = c.id)::int AS total,
            (SELECT count(*) FROM lessons l
               JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = $1
              WHERE l.course_id = c.id)::int AS watched
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = $1
      ORDER BY e.created_at`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    totalLessons: r.total,
    watchedLessons: r.watched,
  }));
}

export async function getMyCourse(userId: string, slug: string) {
  const { rows: courses } = await pool.query<{
    id: string;
    slug: string;
    title: string;
    description: string;
  }>(
    `SELECT c.id, c.slug, c.title, c.description
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = $1
      WHERE c.slug = $2`,
    [userId, slug],
  );
  const course = courses[0];
  if (!course) return null;

  const { rows } = await pool.query<{
    id: string;
    position: number;
    title: string;
    watched: boolean;
  }>(
    `SELECT l.id, l.position, l.title, (p.user_id IS NOT NULL) AS watched
       FROM lessons l
       LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = $1
      WHERE l.course_id = $2
      ORDER BY l.position`,
    [userId, course.id],
  );
  const lessons: LessonItem[] = rows;
  const watched = lessons.filter((l) => l.watched).length;

  return {
    ...course,
    lessons,
    percent: progressPercent(watched, lessons.length),
  };
}

export async function getMyLesson(
  userId: string,
  slug: string,
  position: number,
): Promise<LessonDetail | null> {
  const { rows } = await pool.query(
    `SELECT l.id, l.position, l.title, l.description, l.keywords, l.video_id,
            (p.user_id IS NOT NULL) AS watched
       FROM lessons l
       JOIN courses c ON c.id = l.course_id
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = $1
       LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = $1
      WHERE c.slug = $2 AND l.position = $3`,
    [userId, slug, position],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    position: r.position,
    title: r.title,
    description: r.description,
    keywords: r.keywords,
    videoId: r.video_id,
    watched: r.watched,
  };
}
