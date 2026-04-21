import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Esta línea protege TODO el CRM excepto el login, la API de auth y los archivos estáticos
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
