import pg from "pg";

// Solo desarrollo: da acceso a un usuario a un curso sin pasar por la compra.
// Uso: npm run db:enroll -- <email> <slug-del-curso>
const [email, slug] = process.argv.slice(2);
if (!email || !slug) {
  console.error("Uso: npm run db:enroll -- <email> <slug-del-curso>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rowCount } = await client.query(
    `INSERT INTO enrollments (user_id, course_id)
     SELECT u.id, c.id FROM users u, courses c
      WHERE u.email = lower($1) AND c.slug = $2
     ON CONFLICT DO NOTHING`,
    [email, slug],
  );
  console.log(rowCount ? "acceso otorgado" : "sin cambios (ya tenía acceso, o no existe el usuario o el curso)");
} finally {
  await client.end();
}
