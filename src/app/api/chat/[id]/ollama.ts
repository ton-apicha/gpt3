import { prisma } from "@/lib/prisma";

export async function streamFromOllama(chatId: string, modelId: string, prompt: string) {
	const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
	const res = await fetch(`${base}/api/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: modelId,
			prompt,
			stream: true,
		}),
	});
	if (!res.ok || !res.body) throw new Error(`Ollama error: ${res.status}`);
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let text = "";
	let done = false;
	const tokens = { prompt: 0, completion: 0, total: 0 } as { prompt: number; completion: number; total: number };
	return {
		async pump(writer: WritableStreamDefaultWriter<Uint8Array>) {
			const encoder = new TextEncoder();
			async function writeEvent(obj: unknown) {
				await writer.write(encoder.encode(JSON.stringify(obj) + "\n"));
			}
			await writeEvent({ type: "start" });
			while (!done) {
				const { value, done: d } = await reader.read();
				done = d;
				if (value) {
					const chunk = decoder.decode(value, { stream: true });
					for (const line of chunk.split("\n").filter(Boolean)) {
						try {
							const evt = JSON.parse(line);
							if (evt.response) {
								text += evt.response;
								await writeEvent({ type: "delta", data: evt.response });
							}
							if (evt.done) {
								tokens.total = evt.total ?? tokens.total;
								tokens.prompt = evt.prompt_eval_count ?? tokens.prompt;
								tokens.completion = evt.eval_count ?? tokens.completion;
							}
						} catch {}
					}
				}
			}
			const assistant = await prisma.message.create({ data: { chatId, role: "assistant", content: text } as any });
			await writeEvent({ type: "done", id: assistant.id, tokens });
		},
		output: () => text,
	};
}
