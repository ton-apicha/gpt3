import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.model.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response("Delete failed", { status: 400 });
  }
}

const patchSchema = z.object({
  provider: z.string().min(1).optional(),
  label: z.string().optional(),
  contextLength: z.number().int().positive().nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });
  try {
    const updated = await prisma.model.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return Response.json(updated);
  } catch (e) {
    return new Response("Update failed", { status: 400 });
  }
}


