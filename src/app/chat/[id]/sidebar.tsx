"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Cpu, User, LogOut, Settings } from "lucide-react";

type ChatItem = { id: string; title: string | null; updatedAt: string };

export function ChatSidebar() {
  const [items, setItems] = React.useState<ChatItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function createChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        const chat = await res.json();
        router.push(`/chat/${chat.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function renameChat(id: string, title: string) {
    await fetch(`/api/chats/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    await refresh();
  }

  async function deleteChat(id: string) {
    if (!confirm("ลบห้องแชทนี้?")) return;
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white grid place-items-center">
            <Cpu size={16} />
          </div>
          <span className="font-semibold text-gray-800 dark:text-white">Enterprise AI</span>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Settings">
          <Settings size={18} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <button disabled={loading} onClick={createChat} className="w-full inline-flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
          <MessageSquare size={16} />
          <span>New Chat</span>
        </button>
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
          <div className="space-y-1">
            {items.map((c) => (
              <div key={c.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link href={`/chat/${c.id}`} className="flex-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 truncate">
                  <MessageSquare size={16} />
                  <span className="truncate">{c.title ?? c.id}</span>
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition text-xs space-x-2">
                  <button onClick={() => {
                    const t = prompt("ตั้งชื่อห้องแชท", c.title ?? "");
                    if (t !== null) renameChat(c.id, t.trim() || null as any);
                  }} className="text-blue-600">Rename</button>
                  <button onClick={() => deleteChat(c.id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
            {!items.length && <div className="text-sm text-zinc-500">ยังไม่มีห้องแชท</div>}
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 grid place-items-center">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
          </div>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


