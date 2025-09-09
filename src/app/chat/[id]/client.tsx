"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

type Model = { id: string; label: string | null };

export function ChatComposer({ chatId }: { chatId: string }) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const [streaming, setStreaming] = React.useState(false);
	const [buffer, setBuffer] = React.useState("");
	const [tokenCount, setTokenCount] = React.useState<{ prompt: number; completion: number; total: number } | null>(null);
	const [models, setModels] = React.useState<Model[]>([]);
	const [currentModel, setCurrentModel] = React.useState<string | null>(null);
	const [controller, setController] = React.useState<AbortController | null>(null);
	const endRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				formRef.current?.requestSubmit();
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	React.useEffect(() => {
		(async () => {
			const res = await fetch("/api/integrations/ollama/models");
			if (res.ok) {
				const list = (await res.json()) as Model[];
				setModels(list.filter((m) => !!m.id));
			}
		})();
	}, []);

	React.useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [buffer, streaming]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formElement = e.currentTarget;
		setStreaming(true);
		setBuffer("");
		setTokenCount(null);
		const fd = new FormData(formElement);
		if (currentModel) {
			await fetch(`/api/chat/${chatId}/model`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ modelId: currentModel }),
			});
		}
		const aborter = new AbortController();
		setController(aborter);
		const res = await fetch(`/api/chat/${chatId}/message`, { method: "POST", body: fd, signal: aborter.signal });
		if (!res.ok || !res.body) {
			setStreaming(false);
			return;
		}
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let done = false;
		while (!done) {
			const { value, done: d } = await reader.read();
			done = d;
			if (value) {
				const text = decoder.decode(value, { stream: true });
				for (const line of text.split("\n").filter(Boolean)) {
					try {
						const evt = JSON.parse(line);
						if (evt.type === "delta") setBuffer((b) => b + evt.data);
						if (evt.type === "done") setTokenCount(evt.tokens ?? null);
					} catch {}
				}
			}
		}
		setStreaming(false);
		const contentEl = formElement.elements.namedItem("content") as HTMLTextAreaElement | null;
		if (contentEl) contentEl.value = "";
		textareaRef.current?.focus();
	}

	function onStop() {
		controller?.abort();
		setStreaming(false);
		setController(null);
	}

	return (
		<form ref={formRef} onSubmit={onSubmit} className="space-y-2">
			<div className="flex items-center gap-3">
				<select value={currentModel ?? ""} onChange={(e) => setCurrentModel(e.target.value || null)} className="rounded-md border p-2">
					<option value="">เลือกโมเดล (ถ้าไม่เลือกจะใช้ข้อความตัวอย่าง)</option>
					{models.map((m) => (
						<option key={m.id} value={m.id}>{m.label ?? m.id}</option>
					))}
				</select>
			</div>
			<textarea ref={textareaRef} name="content" className="w-full rounded-2xl border p-4 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-zinc-800" placeholder="พิมพ์ข้อความ... Ctrl/Cmd+Enter เพื่อส่ง" />
			<div className="flex items-center gap-3">
				<button disabled={streaming} className="rounded-full bg-blue-600 text-white px-5 py-2 disabled:opacity-50 hover:bg-blue-700 transition-colors" type="submit">ส่ง</button>
				{streaming && (
					<button type="button" onClick={onStop} className="rounded-md border px-3 py-2">หยุด</button>
				)}
				{tokenCount && (
					<span className="text-xs text-zinc-500">tokens: {tokenCount.total} (p:{tokenCount.prompt} c:{tokenCount.completion})</span>
				)}
			</div>
			{streaming && <div className="text-xs text-zinc-500">กำลังตอบ...</div>}
			{buffer && (
				<div className="rounded-md border p-3 text-sm bg-white dark:bg-zinc-800">
					<div className="prose prose-zinc dark:prose-invert max-w-none">
						<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
							{buffer}
						</ReactMarkdown>
					</div>
				</div>
			)}
			<div ref={endRef} />
		</form>
	);
}
