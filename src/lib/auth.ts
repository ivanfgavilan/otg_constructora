import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Intento de login para:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Error: Faltan credenciales');
          throw new Error('Email and password required');
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (dbError) {
          console.error('[AUTH] Error de conexión a la base de datos:', dbError);
          throw new Error('Database connection error');
        }

        if (!user || !user.password) {
          console.error('[AUTH] Usuario no encontrado:', credentials.email);
          throw new Error('User not found');
        }

        console.log('[AUTH] Usuario encontrado, verificando contraseña...');

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.error('[AUTH] Contraseña incorrecta para:', credentials.email);
          throw new Error('Invalid password');
        }

        console.log('[AUTH] Login exitoso para:', user.email, '| Rol:', user.role);

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('[AUTH] Generando JWT para:', user.email);
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('[AUTH] Construyendo sesión para token ID:', token.id);
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
