import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { streamFromOllama } from "../ollama";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
	const form = await req.formData();
	const content = String(form.get("content") ?? "").trim();
	if (!content) return new Response("Missing content", { status: 400 });
	const chatId = params.id;
	const chat = await prisma.chat.findUnique({ where: { id: chatId } });
	if (!chat || chat.userId !== session.user.id) return new Response("Forbidden", { status: 403 });

	// Create user message
	await prisma.message.create({ data: { chatId, role: "user", content } as any });

	// If chat has no title, set it from the first user message (trimmed)
	if (!chat.title) {
		const title = content.slice(0, 60).trim();
		await prisma.chat.update({ where: { id: chatId }, data: { title: title.length ? title : chat.id } });
	}

	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();
	async function writeEvent(obj: unknown) {
		await writer.write(encoder.encode(JSON.stringify(obj) + "\n"));
	}

	queueMicrotask(async () => {
		try {
			if (chat?.modelId) {
				const startedAt = Date.now();
				const s = await streamFromOllama(chatId, chat.modelId, content);
				await s.pump(writer);
				const durationMs = Date.now() - startedAt;
				const out = s.output();
				await prisma.requestLog.create({ data: { chatId, modelId: chat.modelId, durationMs, totalTokens: (s as any).tokens?.total ?? null, promptTokens: (s as any).tokens?.prompt ?? null, completionTokens: (s as any).tokens?.completion ?? null, success: true } });
				// Touch chat updatedAt when a response is completed
				await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
			} else {
				await writeEvent({ type: "start" });
				await writeEvent({ type: "delta", data: "ยังไม่ได้เลือกโมเดล ใช้ข้อความตัวอย่างแทน." });
				const assistant = await prisma.message.create({ data: { chatId, role: "assistant", content: "ยังไม่ได้เลือกโมเดล ใช้ข้อความตัวอย่างแทน." } as any });
				await writeEvent({ type: "done", id: assistant.id, tokens: { prompt: 0, completion: 0, total: 0 } });
				await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
			}
		} catch (e) {
			await writeEvent({ type: "error", error: (e as Error).message });
			await prisma.errorLog.create({ data: { level: "error", message: (e as Error).message, stack: (e as Error).stack ?? null, context: { chatId } as any } });
		} finally {
			await writer.close();
		}
	});

	return new Response(readable, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
