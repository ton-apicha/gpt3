"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, MessageSquare, User, Settings, LogOut, Clock } from "lucide-react";

type ChatItem = { id: string; title: string | null; updatedAt: string };

export function SidebarFull() {
  const [items, setItems] = React.useState<ChatItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
  }
  React.useEffect(() => { refresh(); }, []);

  async function createChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        const chat = await res.json();
        router.push(`/chat/${chat.id}`);
      }
    } finally { setLoading(false); }
  }

  async function renameChat(id: string, title: string | null) {
    await fetch(`/api/chats/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    await refresh();
  }
  async function deleteChat(id: string) {
    if (!confirm("ลบห้องแชทนี้?")) return;
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><Cpu size={16} /></div>
          <span className="font-semibold text-gray-800 dark:text-white">Enterprise AI</span>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Settings">
          <Settings size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <button disabled={loading} onClick={createChat} className="w-full flex items-center space-x-2 p-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
            <MessageSquare size={16} />
            <span>New Chat</span>
          </button>
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {items.map(c => (
                <div key={c.id} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <Link href={`/chat/${c.id}`} className="flex items-center space-x-2 truncate flex-1">
                    <MessageSquare size={16} />
                    <span className="truncate">{c.title ?? c.id}</span>
                  </Link>
                  <div className="text-xs space-x-2 opacity-0 hover:opacity-100">
                    <button onClick={() => { const t = prompt("ตั้งชื่อห้องแชท", c.title ?? ""); if (t !== null) renameChat(c.id, t.trim() || null); }} className="text-blue-600">Rename</button>
                    <button onClick={() => deleteChat(c.id)} className="text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {!items.length && <div className="text-sm text-zinc-500">ยังไม่มีห้องแชท</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><User size={16} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
          </div>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Logout"><LogOut size={18} /></button>
        </div>
      </div>
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
  );
}


