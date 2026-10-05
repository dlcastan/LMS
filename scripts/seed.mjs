import pg from "pg";

// Datos de ejemplo para desarrollo. Idempotente: se puede correr varias veces.
const course = {
  slug: "ia-aplicada-a-productos-digitales",
  title: "IA aplicada a productos digitales",
  // Precio de ejemplo (en centavos): ARS 10.000,00.
  priceCents: 1000000,
  currency: "ARS",
  description:
    "Curso de ejemplo: cómo implementar IA dentro de un producto y cómo crear productos digitales usando IA.",
  lessons: [
    {
      title: "Qué es la IA aplicada a productos",
      description: "Panorama general de dónde la IA aporta valor a un producto digital.",
      keywords: ["ia", "producto", "introducción"],
    },
    {
      title: "Casos de uso de IA dentro de un producto",
      description: "Ejemplos concretos de funcionalidades de producto potenciadas por IA.",
      keywords: ["casos de uso", "funcionalidades"],
    },
    {
      title: "Crear un producto digital con ayuda de IA",
      description: "Cómo usar IA como herramienta para diseñar y construir un producto.",
      keywords: ["construcción", "herramientas"],
    },
  ],
};

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    `INSERT INTO courses (slug, title, description, price_cents, currency)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title, description = EXCLUDED.description,
           price_cents = EXCLUDED.price_cents, currency = EXCLUDED.currency
     RETURNING id`,
    [course.slug, course.title, course.description, course.priceCents, course.currency],
  );
  const courseId = rows[0].id;
  for (const [i, lesson] of course.lessons.entries()) {
    await client.query(
      `INSERT INTO lessons (course_id, position, title, description, keywords)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (course_id, position) DO UPDATE
         SET title = EXCLUDED.title, description = EXCLUDED.description, keywords = EXCLUDED.keywords`,
      [courseId, i + 1, lesson.title, lesson.description, lesson.keywords],
    );
  }
  await client.query("COMMIT");
  console.log(`curso "${course.slug}" con ${course.lessons.length} clases listo`);
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  await client.end();
}
