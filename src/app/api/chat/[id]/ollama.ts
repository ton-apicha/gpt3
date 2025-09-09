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
	let visibleText = "";
	let thinkingText = "";
	let pending = "";
	let inThink = false;
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
								pending += String(evt.response);
								while (true) {
									if (!inThink) {
										const startIdx = pending.indexOf("<think>");
										if (startIdx === -1) {
											const keep = "<think>".length - 1;
											const outLen = Math.max(0, pending.length - keep);
											const vis = pending.slice(0, outLen);
											if (vis) {
												visibleText += vis;
												await writeEvent({ type: "delta", data: vis });
											}
											pending = pending.slice(outLen);
											break;
										} else {
											const vis = pending.slice(0, startIdx);
											if (vis) {
												visibleText += vis;
												await writeEvent({ type: "delta", data: vis });
											}
											pending = pending.slice(startIdx + "<think>".length);
											inThink = true;
										}
									} else {
										const endIdx = pending.indexOf("</think>");
										if (endIdx === -1) {
											const keep = "</think>".length - 1;
											const outLen = Math.max(0, pending.length - keep);
											const th = pending.slice(0, outLen);
											if (th) {
												thinkingText += th;
												await writeEvent({ type: "thinking", data: th });
											}
											pending = pending.slice(outLen);
											break;
										} else {
											const th = pending.slice(0, endIdx);
											if (th) {
												thinkingText += th;
												await writeEvent({ type: "thinking", data: th });
											}
											pending = pending.slice(endIdx + "</think>".length);
											inThink = false;
										}
									}
								}
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
			// flush any remaining outside-think content
			if (!inThink && pending) {
				visibleText += pending;
				await (async () => {
					const encoder = new TextEncoder();
					await writer.write(encoder.encode(JSON.stringify({ type: "delta", data: pending }) + "\n"));
				})();
				pending = "";
			}
			const assistant = await prisma.message.create({ data: { chatId, role: "assistant", content: visibleText } as any });
			await writeEvent({ type: "done", id: assistant.id, tokens });
		},
		output: () => visibleText,
		get tokens() { return tokens; },
	};
}
