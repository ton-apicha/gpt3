import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });
  const perms = await prisma.permission.findMany({ orderBy: { key: "asc" } });
  return Response.json(perms.map(p => p.key));
}

const createSchema = z.object({ key: z.string().min(1), description: z.string().optional() });
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });
  const perm = await prisma.permission.create({ data: { key: parsed.data.key, description: parsed.data.description } });
  return Response.json(perm, { status: 201 });
}


