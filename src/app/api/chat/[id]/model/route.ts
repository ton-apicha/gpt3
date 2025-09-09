import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ modelId: z.string().min(1) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });
  const chat = await prisma.chat.findUnique({ where: { id: params.id } });
  if (!chat || chat.userId !== session.user.id) return new Response("Forbidden", { status: 403 });
  let model = await prisma.model.findUnique({ where: { id: parsed.data.modelId } });
  if (!model) {
    // Auto-register missing model (assume ollama provider) so that UI selection always persists
    model = await prisma.model.create({ data: { id: parsed.data.modelId, provider: "ollama", enabled: true } });
  }
  if (!model.enabled) return new Response("Model not available", { status: 400 });
  const updated = await prisma.chat.update({ where: { id: params.id }, data: { modelId: model.id } });
  return Response.json(updated);
}


