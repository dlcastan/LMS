CREATE TABLE IF NOT EXISTS courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL CHECK (position > 0),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  video_id    TEXT,
  UNIQUE (course_id, position)
);

-- Acceso de un alumno a un curso. La Feature 3 (compra) inserta acá al
-- aprobarse un pago.
CREATE TABLE IF NOT EXISTS enrollments (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
