import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const models = await prisma.model.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(models);
}

const createSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  label: z.string().optional(),
  contextLength: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  enabled: z.boolean().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Invalid body", { status: 400 });
  }
  const data = parsed.data;
  try {
    const model = await prisma.model.create({
      data: {
        id: data.id,
        provider: data.provider,
        label: data.label,
        contextLength: data.contextLength,
        temperature: data.temperature,
        enabled: data.enabled ?? true,
      },
    });
    return Response.json(model, { status: 201 });
  } catch (e) {
    return new Response("Create failed", { status: 400 });
  }
}


