import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Aprendé a construir productos digitales con IA</h1>
        <p>
          Cursos prácticos sobre inteligencia artificial aplicada a productos
          digitales: cómo implementar IA dentro de un producto y cómo crear
          productos digitales usando IA.
        </p>
        <div className={styles.cta}>
          <Link href="/registro" className={styles.primary}>
            Crear mi cuenta
          </Link>
          <Link href="/login" className={styles.secondary}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        <article>
          <h2>Qué vas a aprender</h2>
          <p>
            A integrar IA en un producto existente y a crear productos
            digitales nuevos apoyándote en ella, con ejemplos aplicados.
          </p>
        </article>
        <article>
          <h2>Para quién es</h2>
          <p>
            Para personas que construyen o quieren construir productos
            digitales y necesitan incorporar IA a su trabajo.
          </p>
        </article>
        <article>
          <h2>Por qué comprarlo</h2>
          <p>
            Contenido propio y siempre actualizado, con tu progreso y tus
            certificados en una cuenta tuya, sin depender de una plataforma
            ajena.
          </p>
        </article>
      </section>
    </main>
  );
}
