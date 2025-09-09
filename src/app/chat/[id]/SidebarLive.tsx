"use client";

import React from "react";
import { Cpu, MessageSquare, Settings, User, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type ChatLite = { id: string; title: string | null; updatedAt?: string };

export function SidebarLive() {
  const [chats, setChats] = React.useState<ChatLite[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (res.ok) setChats(await res.json());
  }
  React.useEffect(() => { refresh(); }, []);

  async function onNewChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        const chat = await res.json();
        router.push(`/chat/${chat.id}`);
      }
    } finally { setLoading(false); }
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
          <button onClick={onNewChat} disabled={loading} className="w-full flex items-center space-x-2 p-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
            <MessageSquare size={16} />
            <span>New Chat</span>
          </button>
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {chats.map((c) => (
                <button key={c.id} onClick={() => router.push(`/chat/${c.id}`)} className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <MessageSquare size={16} />
                  <span className="truncate">{c.title ?? c.id}</span>
                </button>
              ))}
              {!chats.length && <div className="text-sm text-gray-500 dark:text-gray-400">No chats</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><User size={16} /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-white">Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in</p>
          </div>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Recent">
            <Clock size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


