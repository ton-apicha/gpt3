"use client";

import React from "react";

type RoleItem = { id: string; name: string; description: string | null; permissions: string[] };

export default function AdminRolesPage() {
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [perms, setPerms] = React.useState<string[]>([]);
  const [form, setForm] = React.useState({ name: "", description: "" });

  async function load() {
    const [r, p] = await Promise.all([
      fetch("/api/admin/roles"),
      fetch("/api/admin/permissions"),
    ]);
    if (r.ok) setRoles(await r.json());
    if (p.ok) setPerms(await p.json());
  }

  React.useEffect(() => { load(); }, []);

  async function createRole(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", description: "" });
    await load();
  }

  async function deleteRole(id: string) {
    if (!confirm("ลบ role นี้?")) return;
    await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    await load();
  }

  async function togglePermission(role: RoleItem, key: string, on: boolean) {
    const next = on ? [...role.permissions, key] : role.permissions.filter(k => k !== key);
    await fetch(`/api/admin/roles/${role.id}/permissions`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permissions: next }) });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Roles & Permissions</h1>

      <form onSubmit={createRole} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm mb-1">Role name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border p-2" placeholder="manager" />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-md border p-2" placeholder="Team manager" />
        </div>
        <button className="rounded-md bg-zinc-900 text-white px-4 py-2 dark:bg-zinc-200 dark:text-zinc-900">สร้าง Role</button>
      </form>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Permissions</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-zinc-500">{r.description ?? "-"}</div>
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    {perms.map((k) => {
                      const checked = r.permissions.includes(k);
                      return (
                        <label key={k} className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={checked} onChange={(e) => togglePermission(r, k, e.target.checked)} />
                          <span>{k}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2">
                  <button onClick={() => deleteRole(r.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


