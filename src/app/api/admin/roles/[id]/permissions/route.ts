import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ permissions: z.array(z.string()) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });

  const roleId = params.id;
  const perms = await prisma.permission.findMany({ where: { key: { in: parsed.data.permissions } } });

  await prisma.rolePermission.deleteMany({ where: { roleId } });
  for (const p of perms) {
    await prisma.rolePermission.create({ data: { roleId, permissionId: p.id } });
  }
  return new Response(null, { status: 204 });
}


