"use client";

import React from "react";

type Model = {
  id: string;
  provider: string;
  label: string | null;
  contextLength: number | null;
  temperature: number | null;
  enabled: boolean;
  createdAt?: string;
};

export default function AdminModelsPage() {
  const [models, setModels] = React.useState<Model[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Model>>({ provider: "ollama", enabled: true });

  async function refresh() {
    const res = await fetch("/api/models", { cache: "no-store" });
    const data = await res.json();
    setModels(data);
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          provider: form.provider,
          label: form.label,
          contextLength: form.contextLength ? Number(form.contextLength) : undefined,
          temperature: form.temperature ? Number(form.temperature) : undefined,
          enabled: form.enabled,
        }),
      });
      if (res.ok) {
        setForm({ provider: form.provider ?? "ollama", enabled: true });
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function onToggle(id: string, enabled: boolean) {
    await fetch(`/api/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("ลบโมเดลนี้?")) return;
    await fetch(`/api/models/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Models</h1>
      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Model ID</label>
          <input value={form.id ?? ""} onChange={(e) => setForm({ ...form, id: e.target.value })} className="w-full rounded-md border p-2" placeholder="llama3.1:8b" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Provider</label>
          <input value={form.provider ?? ""} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full rounded-md border p-2" placeholder="ollama" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Label</label>
          <input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-md border p-2" placeholder="Llama 3.1 8B" />
        </div>
        <div>
          <label className="block text-sm mb-1">Context</label>
          <input type="number" value={form.contextLength ?? ""} onChange={(e) => setForm({ ...form, contextLength: e.target.value as unknown as number })} className="w-full rounded-md border p-2" placeholder="8192" />
        </div>
        <div>
          <label className="block text-sm mb-1">Temperature</label>
          <input type="number" step="0.1" value={form.temperature ?? ""} onChange={(e) => setForm({ ...form, temperature: e.target.value as unknown as number })} className="w-full rounded-md border p-2" placeholder="0.7" />
        </div>
        <div className="flex items-center gap-2">
          <input id="enabled" type="checkbox" checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <label htmlFor="enabled">Enabled</label>
        </div>
        <div className="md:col-span-6">
          <button disabled={loading} className="rounded-md bg-zinc-900 text-white px-4 py-2 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900">สร้างโมเดล</button>
        </div>
      </form>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Provider</th>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Context</th>
              <th className="text-left p-2">Temp</th>
              <th className="text-left p-2">Enabled</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2 font-mono">{m.id}</td>
                <td className="p-2">{m.provider}</td>
                <td className="p-2">{m.label}</td>
                <td className="p-2">{m.contextLength ?? "-"}</td>
                <td className="p-2">{m.temperature ?? "-"}</td>
                <td className="p-2">{m.enabled ? "Yes" : "No"}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => onToggle(m.id, !m.enabled)} className="text-blue-600 hover:underline">{m.enabled ? "Disable" : "Enable"}</button>
                  <button onClick={() => onDelete(m.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


