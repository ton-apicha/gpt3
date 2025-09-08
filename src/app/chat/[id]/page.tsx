import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ChatComposer } from "./client";

export default async function ChatThread({ params }: { params: { id: string } }) {
	const chat = await prisma.chat.findUnique({ where: { id: params.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
	if (!chat) return notFound();
	return (
		<div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
			<div className="text-sm text-zinc-500">Chat ID: {chat.id}</div>
			<div className="space-y-6">
				{chat.messages.map((m) => (
					<div key={m.id} className="rounded-md border p-3 bg-white dark:bg-zinc-800">
						<div className="text-xs mb-1 uppercase tracking-wide text-zinc-500">{m.role}</div>
						<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} className="prose prose-zinc dark:prose-invert max-w-none">
							{m.content}
						</ReactMarkdown>
					</div>
				))}
			</div>
			<ChatComposer chatId={chat.id} />
		</div>
	);
}
