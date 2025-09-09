"use client";

import Link from "next/link";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 grid place-items-center text-white">A</div>
              <span className="ml-2 font-semibold text-gray-800 dark:text-white">Enterprise AI Admin</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/admin" className="px-3 py-1 rounded-md bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">Dashboard</Link>
              <Link href="/admin/users" className="px-3 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Users</Link>
              <Link href="/admin/models" className="px-3 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Models</Link>
              <Link href="/admin/analytics" className="px-3 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Notifications">🔔</button>
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Theme">🌙</button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 grid place-items-center">U</div>
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">Admin</span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Management</h3>
              <nav className="space-y-1">
                <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm rounded-md bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">Users</Link>
                <Link href="/admin/roles" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Permissions</Link>
                <Link href="/admin/models" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Model Configuration</Link>
              </nav>
            </div>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Monitoring</h3>
              <nav className="space-y-1">
                <Link href="/admin/usage" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Usage Analytics</Link>
                <Link href="/admin/logs/error" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Error Logs</Link>
                <Link href="/admin/performance" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Performance Metrics</Link>
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Settings</h3>
              <nav className="space-y-1">
                <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">System Settings</Link>
                <Link href="/admin/security" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Security</Link>
				</nav>
            </div>
          </div>
			</aside>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
		</div>
	);
}


