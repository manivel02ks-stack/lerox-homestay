import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    // ── Guest login via email OTP ──────────────────────────────────────
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const email = credentials.email.toLowerCase().trim();
        const hashedOtp = crypto
          .createHash("sha256")
          .update(credentials.otp.trim())
          .digest("hex");

        // Find the verification token
        const record = await prisma.verificationToken.findFirst({
          where: { identifier: email, token: hashedOtp },
        });

        if (!record) return null; // Wrong OTP
        if (record.expires < new Date()) return null; // Expired

        // Delete used token
        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier: email, token: hashedOtp } },
        });

        // Find or create user
        const user = await prisma.user.upsert({
          where: { email },
          update: { emailVerified: new Date() },
          create: {
            email,
            name: email.split("@")[0],
            role: Role.CUSTOMER,
            emailVerified: new Date(),
          },
        });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),

    // ── Guest login via email + password (returning users) ────────────
    CredentialsProvider({
      id: "guest-password",
      name: "guest-password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const user  = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== Role.CUSTOMER || !user.passwordHash) return null;
        const bcrypt = await import("bcryptjs").catch(() => null);
        if (!bcrypt) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),

    // ── Admin login via email + password ──────────────────────────────
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        // Find admin user in DB
        const adminUser = await prisma.user.findUnique({ where: { email } });
        if (!adminUser || adminUser.role !== Role.ADMIN) return null;

        // Compare password (stored as bcrypt hash or plain for seeded admin)
        const bcrypt = await import("bcryptjs").catch(() => null);
        let passwordValid = false;

        if (adminUser.passwordHash) {
          if (bcrypt) {
            passwordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);
          } else {
            passwordValid = adminUser.passwordHash === credentials.password;
          }
        } else {
          // Fallback: env-based admin for initial setup
          const envAdminEmail = process.env.ADMIN_EMAIL || "admin@guesthouse.com";
          const envAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
          passwordValid =
            email === envAdminEmail && credentials.password === envAdminPassword;
        }

        if (!passwordValid) return null;

        return { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? Role.CUSTOMER;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
