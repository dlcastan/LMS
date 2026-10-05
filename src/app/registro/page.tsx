import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/app/ui/auth-form";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <AuthForm
      title="Crear cuenta"
      submitLabel="Registrarme"
      action={signup}
      autoComplete="new-password"
      alt={{ text: "¿Ya tenés cuenta?", href: "/login", label: "Ingresá" }}
    />
  );
}
