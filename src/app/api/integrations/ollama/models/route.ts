import { prisma } from "@/lib/prisma";

export async function GET() {
  const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  try {
    const res = await fetch(`${base}/api/tags`, { next: { revalidate: 5 } });
    if (!res.ok) return new Response("Upstream error", { status: 502 });
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const names = (data.models ?? []).map((m) => m.name);
    const db = await prisma.model.findMany({ where: { provider: "ollama", id: { in: names } } });
    const merged = names.map((name) => {
      const found = db.find((m) => m.id === name);
      return {
        id: name,
        provider: "ollama",
        label: found?.label ?? name,
        enabled: found?.enabled ?? true,
      };
    });
    return Response.json(merged);
  } catch (e) {
    return Response.json([], { status: 200 });
  }
}


