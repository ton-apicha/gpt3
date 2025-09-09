"use client";

import React from "react";
import { Cpu, MessageSquare, User, Settings, Clock, HelpCircle, Moon, ChevronDown, Zap, Database } from "lucide-react";
import { ModelDropdown } from "./ModelDropdown";
import { SidebarLive } from "./SidebarLive";
import { useParams } from "next/navigation";

export default function ChatDemoLike() {
  const params = useParams<{ id: string }>();
  const chatId = String(params.id);
  const [messages, setMessages] = React.useState<Array<{ id?: string; role: "user" | "assistant" | "system" | "tool"; content: string }>>([]);
  const [initialModelId, setInitialModelId] = React.useState<string | undefined>(undefined);
  const [streaming, setStreaming] = React.useState(false);
  const [buffer, setBuffer] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [thinking, setThinking] = React.useState<string>("");
  const [showThinking, setShowThinking] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
        if (data.modelId) setInitialModelId(data.modelId);
      }
    })();
  }, [chatId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStreaming(true);
    setBuffer("");
    setThinking("");
    setShowThinking(false);
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
            if (evt.type === "thinking") {
              setThinking((t) => t + String(evt.data ?? ""));
              setShowThinking(true);
            }
            if (evt.type === "delta") setBuffer((b) => b + evt.data);
            if (evt.type === "done") {
              setBuffer("");
              const r = await fetch(`/api/chats/${chatId}`);
              if (r.ok) {
                const data = await r.json();
                setMessages(data.messages ?? []);
              }
              // keep thinking visible after completion
              setShowThinking(true);
            }
          } catch {}
        }
      }
    }
    setStreaming(false);
    if (textareaRef.current) textareaRef.current.value = "";
  }
	return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop - live) */}
      <SidebarLive />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="md:hidden text-gray-500 dark:text-gray-400" aria-label="Menu">
              <MessageSquare size={18} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Enterprise AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ModelDropdown chatId={chatId} initialModelId={initialModelId} />
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Theme"><Moon size={18} /></button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Help"><HelpCircle size={18} /></button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {showThinking && thinking && (
              <div className="flex space-x-3 opacity-80">
                <div className="flex-shrink-0"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">AI</div></div>
                <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-sm max-w-[80%] border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">ความคิด (ซ่อนจากผู้ใช้ทั่วไป)</div>
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{thinking}</p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id ?? Math.random()} data-testid={`msg-${m.role}`} className={"flex space-x-3 " + (m.role === "assistant" ? "" : "justify-end") }>
                {m.role === "assistant" && (
                  <div className="flex-shrink-0"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">AI</div></div>
                )}
                <div className={(m.role === "assistant" ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" : "bg-blue-500 text-white") + " p-4 rounded-lg shadow-sm max-w-[80%]"}>
                  <p className={m.role === "assistant" ? "" : "text-white"}>{m.content}</p>
                </div>
                {m.role !== "assistant" && (
                  <div className="flex-shrink-0"><div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">U</div></div>
                )}
              </div>
            ))}
            {streaming && (
              <div className="flex space-x-3" data-testid="streaming">
                <div className="flex-shrink-0"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">AI</div></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm max-w-[80%]">
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span className="inline-flex -space-x-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    </span>
                    <span>{buffer || "Thinking..."}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <form onSubmit={onSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea name="content" ref={textareaRef} className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Ask me anything about the company..." rows={1} />
              <button type="submit" className="absolute right-3 bottom-3 text-gray-500 dark:text-gray-400 hover:text-blue-500" aria-label="Send">➤</button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex space-x-2">
                <button className="hover:text-blue-500 inline-flex items-center gap-1" aria-label="Attach">📎 <span>Attach</span></button>
                <button className="hover:text-blue-500 inline-flex items-center gap-1" aria-label="Voice">🎤 <span>Voice</span></button>
              </div>
              <span>Press Shift+Enter for new line</span>
            </div>
          </div>
        </form>

        {/* Mobile bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
          <div className="flex justify-around p-2">
            <button className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Chats"><MessageSquare size={16} /></button>
            <button className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Recent"><Clock size={16} /></button>
            <button className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="User"><User size={16} /></button>
            <button className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Settings"><Settings size={16} /></button>
          </div>
					</div>
			</div>
		</div>
	);
}


