"use client";

import React from "react";
import { ChevronDown, Zap, Database } from "lucide-react";

type ModelItem = { id: string; label: string | null; provider?: string; enabled?: boolean };

export function ModelDropdown({ chatId, initialModelId }: { chatId: string; initialModelId?: string }) {
  const [open, setOpen] = React.useState(false);
  const [models, setModels] = React.useState<ModelItem[]>([]);
  const [current, setCurrent] = React.useState<string>("Select model");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/integrations/ollama/models", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as ModelItem[];
          setModels(data);
          if (initialModelId) {
            const found = data.find(d => d.id === initialModelId);
            if (found) setCurrent(found.label ?? found.id);
            else if (data[0]) setCurrent(data[0].label ?? data[0].id);
          } else {
            const first = data[0];
            if (first) setCurrent(first.label ?? first.id);
          }
        }
      } catch {}
    })();
  }, [initialModelId]);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function selectModel(m: ModelItem) {
    setOpen(false);
    setCurrent(m.label ?? m.id);
    try {
      await fetch(`/api/chat/${chatId}/model`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: m.id }),
      });
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-500">
        <span>{current}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="py-1 max-h-80 overflow-auto">
            {models.map((m) => (
              <button key={m.id} onClick={() => selectModel(m)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                {m.provider === "ollama" ? (
                  <Zap className="w-4 h-4 mr-2 text-blue-500" />
                ) : (
                  <Database className="w-4 h-4 mr-2 text-green-500" />
                )}
                {m.label ?? m.id}
              </button>
            ))}
            {!models.length && (
              <div className="px-4 py-2 text-sm text-gray-500">No models</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


