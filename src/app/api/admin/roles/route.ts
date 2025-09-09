import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });

  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, include: { rolePermissions: { include: { permission: true } } } });
  return Response.json(roles.map(r => ({ id: r.id, name: r.name, description: r.description, permissions: r.rolePermissions.map(rp => rp.permission.key) })));
}

const createSchema = z.object({ name: z.string().min(1), description: z.string().optional() });
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });
  const role = await prisma.role.create({ data: { name: parsed.data.name, description: parsed.data.description } });
  return Response.json(role, { status: 201 });
}


