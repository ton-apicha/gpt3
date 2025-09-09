"use client";

import React from "react";

type UserItem = { id: string; email: string; name: string | null; roleKeys: string[] };

export default function AdminUsersPage() {
  const [q, setQ] = React.useState("");
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [roles, setRoles] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    const [u, r] = await Promise.all([
      fetch(`/api/admin/users?q=${encodeURIComponent(q)}`),
      fetch(`/api/admin/roles`),
    ]);
    if (u.ok) setUsers(await u.json());
    if (r.ok) setRoles(await r.json());
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateRoles(userId: string, roleKeys: string[]) {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/roles`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roles: roleKeys }) });
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาอีเมล/ชื่อ" className="rounded-md border p-2" />
        <button onClick={load} className="rounded-md border px-3 py-2">ค้นหา</button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Roles</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name ?? "-"}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => {
                      const checked = u.roleKeys.includes(r);
                      return (
                        <label key={r} className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={checked} onChange={(e) => {
                            const next = e.target.checked ? [...u.roleKeys, r] : u.roleKeys.filter(x => x !== r);
                            updateRoles(u.id, next);
                          }} />
                          <span>{r}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2">
                  <button disabled={loading} onClick={() => updateRoles(u.id, ["user"]) } className="text-sm text-blue-600 disabled:opacity-50">Set user</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


