import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamFromOllama } from "../ollama";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const form = await req.formData();
	const content = String(form.get("content") ?? "").trim();
	if (!content) return new Response("Missing content", { status: 400 });
	const chatId = params.id;
	await prisma.message.create({ data: { chatId, role: "user", content } as any });
	const chat = await prisma.chat.findUnique({ where: { id: chatId } });

	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();
	async function writeEvent(obj: unknown) {
		await writer.write(encoder.encode(JSON.stringify(obj) + "\n"));
	}

	queueMicrotask(async () => {
		try {
			if (chat?.modelId) {
				const s = await streamFromOllama(chatId, chat.modelId, content);
				await s.pump(writer);
			} else {
				await writeEvent({ type: "start" });
				await writeEvent({ type: "delta", data: "ยังไม่ได้เลือกโมเดล ใช้ข้อความตัวอย่างแทน." });
				const assistant = await prisma.message.create({ data: { chatId, role: "assistant", content: "ยังไม่ได้เลือกโมเดล ใช้ข้อความตัวอย่างแทน." } as any });
				await writeEvent({ type: "done", id: assistant.id, tokens: { prompt: 0, completion: 0, total: 0 } });
			}
		} catch (e) {
			await writeEvent({ type: "error", error: (e as Error).message });
		} finally {
			await writer.close();
		}
	});

	return new Response(readable, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
