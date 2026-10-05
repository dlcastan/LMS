import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startPurchase } from "@/app/actions/purchase";
import { verifySession } from "@/lib/dal";
import { getCourseForSale } from "@/lib/courses";
import styles from "@/app/ui/course.module.css";

export default async function ComprarPage(props: PageProps<"/comprar/[slug]">) {
  const { slug } = await props.params;
  const { userId } = await verifySession();
  const course = await getCourseForSale(userId, slug);
  if (!course) notFound();
  if (course.owned) redirect(`/cursos/${slug}`);

  const price = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: course.currency,
  }).format(course.priceCents / 100);

  return (
    <main className={styles.page}>
      <Link href="/cuenta" className={styles.back}>
        ← Mi cuenta
      </Link>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>
        <strong>{price}</strong>
      </p>
      <form action={startPurchase.bind(null, slug)}>
        <button type="submit" className={styles.button}>
          Comprar con Mercado Pago
        </button>
      </form>
    </main>
  );
}
