import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });
  return Response.json(chats);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const json = await req.json().catch(() => ({} as any));
  const chat = await prisma.chat.create({ data: { userId: session.user.id, title: json.title ?? null } });
  await prisma.activityLog.create({ data: { userId: session.user.id, action: "chat.create", target: chat.id } });
  return Response.json(chat, { status: 201 });
}


