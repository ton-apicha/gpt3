import Link from "next/link";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen grid grid-cols-12">
			<aside className="col-span-3 md:col-span-2 border-r p-4 space-y-2">
				<nav className="space-y-1 text-sm">
					<div className="font-semibold text-zinc-500">Dashboard</div>
					<Link href="/admin" className="block">System Overview</Link>
					<Link href="/admin/usage" className="block">Usage Statistics</Link>
					<Link href="/admin/performance" className="block">Performance Metrics</Link>
					<div className="font-semibold text-zinc-500 mt-3">User Management</div>
					<Link href="/admin/users" className="block">Users</Link>
					<Link href="/admin/roles" className="block">Roles & Permissions</Link>
					<div className="font-semibold text-zinc-500 mt-3">System Management</div>
					<Link href="/admin/models" className="block">Models</Link>
					<Link href="/admin/settings" className="block">System Settings</Link>
					<Link href="/admin/resources" className="block">Resource Monitoring</Link>
					<div className="font-semibold text-zinc-500 mt-3">Monitoring & Logs</div>
					<Link href="/admin/logs/activity" className="block">Activity Log</Link>
					<Link href="/admin/logs/performance" className="block">Performance Log</Link>
					<Link href="/admin/logs/error" className="block">Error Log</Link>
					<div className="font-semibold text-zinc-500 mt-3">Configuration</div>
					<Link href="/admin/config/app" className="block">Application Settings</Link>
					<Link href="/admin/config/model" className="block">AI Model Parameters</Link>
					<Link href="/admin/config/notify" className="block">Notification Settings</Link>
					<Link href="/admin/config/instructions" className="block">Custom Instructions</Link>
				</nav>
			</aside>
			<main className="col-span-9 md:col-span-10 p-6">{children}</main>
		</div>
	);
}
