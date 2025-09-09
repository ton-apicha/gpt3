import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const chat = await prisma.chat.findUnique({ where: { id: params.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!chat || chat.userId !== session.user.id) return new Response("Forbidden", { status: 403 });
  return Response.json({ id: chat.id, modelId: chat.modelId, title: chat.title, messages: chat.messages });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => ({} as any));
  const chat = await prisma.chat.findUnique({ where: { id: params.id } });
  if (!chat || chat.userId !== session.user.id) return new Response("Forbidden", { status: 403 });
  const updated = await prisma.chat.update({ where: { id: params.id }, data: { title: body.title ?? null } });
  await prisma.activityLog.create({ data: { userId: session.user.id, action: "chat.rename", target: updated.id, metadata: { title: updated.title } as any } });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const chat = await prisma.chat.findUnique({ where: { id: params.id } });
  if (!chat || chat.userId !== session.user.id) return new Response("Forbidden", { status: 403 });
  await prisma.chat.delete({ where: { id: params.id } });
  await prisma.activityLog.create({ data: { userId: session.user.id, action: "chat.delete", target: params.id } });
  return new Response(null, { status: 204 });
}


