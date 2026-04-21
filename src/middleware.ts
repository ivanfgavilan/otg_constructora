export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    /*
     * Proteger todas las rutas EXCEPTO:
     * - /login
     * - /api/auth (callbacks de NextAuth)
     * - archivos estáticos (_next/static, _next/image, favicon, etc.)
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
