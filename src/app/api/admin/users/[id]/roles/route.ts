import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ roles: z.array(z.string()) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });

  const targetUserId = params.id;
  const roles = await prisma.role.findMany({ where: { name: { in: parsed.data.roles } } });

  // Remove existing
  await prisma.userRole.deleteMany({ where: { userId: targetUserId } });
  // Add new
  for (const r of roles) {
    await prisma.userRole.create({ data: { userId: targetUserId, roleId: r.id } });
  }

  return new Response(null, { status: 204 });
}


