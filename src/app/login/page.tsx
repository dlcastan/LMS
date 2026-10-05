import { login } from "@/app/actions/auth";
import { AuthForm } from "@/app/ui/auth-form";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Ingresar"
      submitLabel="Ingresar"
      action={login}
      autoComplete="current-password"
      alt={{ text: "¿No tenés cuenta?", href: "/registro", label: "Registrate" }}
    />
  );
}
