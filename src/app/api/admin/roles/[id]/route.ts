import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = Array.isArray((session as any)?.roleKeys) && (session as any).roleKeys.includes("admin");
  if (!session?.user?.id || !isAdmin) return new Response("Forbidden", { status: 403 });
  await prisma.role.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}


