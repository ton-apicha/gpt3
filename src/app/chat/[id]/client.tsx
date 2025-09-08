"use client";

import React from "react";

export function ChatComposer({ chatId }: { chatId: string }) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const [streaming, setStreaming] = React.useState(false);
	const [buffer, setBuffer] = React.useState("");
	const [tokenCount, setTokenCount] = React.useState<{ prompt: number; completion: number; total: number } | null>(null);

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

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setStreaming(true);
		setBuffer("");
		setTokenCount(null);
		const fd = new FormData(e.currentTarget);
		const res = await fetch(`/api/chat/${chatId}/message`, { method: "POST", body: fd });
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
		(e.currentTarget.elements.namedItem("content") as HTMLTextAreaElement).value = "";
		textareaRef.current?.focus();
	}

	return (
		<form ref={formRef} onSubmit={onSubmit} className="space-y-2">
			<textarea ref={textareaRef} name="content" className="w-full rounded-md border p-3 min-h-24" placeholder="พิมพ์ข้อความ... Ctrl/Cmd+Enter เพื่อส่ง" />
			<div className="flex items-center gap-3">
				<button disabled={streaming} className="rounded-md bg-zinc-900 text-white px-4 py-2 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900" type="submit">ส่ง</button>
				{tokenCount && (
					<span className="text-xs text-zinc-500">tokens: {tokenCount.total} (p:{tokenCount.prompt} c:{tokenCount.completion})</span>
				)}
			</div>
			{buffer && (
				<div className="rounded-md border p-3 text-sm bg-white dark:bg-zinc-800">
					{buffer}
				</div>
			)}
		</form>
	);
}
