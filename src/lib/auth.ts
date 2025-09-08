import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: { strategy: "jwt" },
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
				const parsed = schema.safeParse(credentials);
				if (!parsed.success) return null;
				const { email, password } = parsed.data;
				const user = await prisma.user.findUnique({ where: { email }, include: { roles: { include: { role: true } } } });
				if (!user || !user.passwordHash) return null;
				const ok = await bcrypt.compare(password, user.passwordHash);
				if (!ok) return null;
				return {
					id: user.id,
					email: user.email,
					name: user.name ?? undefined,
					image: user.image ?? undefined,
					roleKeys: user.roles.map((r) => r.role.name),
				} as any;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.sub = (user as any).id;
				(token as any).roleKeys = (user as any).roleKeys ?? [];
			}
			return token;
		},
		async session({ session, token }) {
			(session.user as any).id = token.sub;
			(session as any).roleKeys = (token as any).roleKeys ?? [];
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};
