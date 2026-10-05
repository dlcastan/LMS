import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/cuenta"];
const guestOnlyRoutes = ["/login", "/registro"];

// Chequeo optimista: solo lee la cookie, sin consultar la base. La autorización
// real vive en el DAL (src/lib/dal.ts).
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get("session")?.value);

  if (protectedRoutes.includes(path) && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (guestOnlyRoutes.includes(path) && session) {
    return NextResponse.redirect(new URL("/cuenta", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta", "/login", "/registro"],
};
