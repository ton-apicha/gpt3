export default function AdminDashboardDemo() {
	return (
		<div className="max-w-7xl mx-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
				<p className="text-gray-600 dark:text-gray-300">Monitor and manage your Enterprise AI platform</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
							<p className="text-2xl font-semibold text-gray-800 dark:text-white">1,248</p>
						</div>
						<div className="p-3 rounded-full bg-blue-50 dark:bg-gray-700 text-blue-500">👥</div>
					</div>
					<div className="mt-4"><span className="text-sm text-green-500">12% from last week</span></div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Queries</p>
							<p className="text-2xl font-semibold text-gray-800 dark:text-white">3,456</p>
						</div>
						<div className="p-3 rounded-full bg-green-50 dark:bg-gray-700 text-green-500">💬</div>
					</div>
					<div className="mt-4"><span className="text-sm text-green-500">5% from yesterday</span></div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Accuracy</p>
							<p className="text-2xl font-semibold text-gray-800 dark:text-white">92.4%</p>
						</div>
						<div className="p-3 rounded-full bg-purple-50 dark:bg-gray-700 text-purple-500">✅</div>
					</div>
					<div className="mt-4"><span className="text-sm text-red-500">0.8% from last month</span></div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
							<p className="text-2xl font-semibold text-gray-800 dark:text-white">1.2s</p>
						</div>
						<div className="p-3 rounded-full bg-yellow-50 dark:bg-gray-700 text-yellow-500">⏱️</div>
					</div>
					<div className="mt-4"><span className="text-sm text-green-500">15% improvement</span></div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-medium text-gray-800 dark:text-white">Recent Activity</h3></div>
						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{[1,2,3].map((i) => (
								<div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 rounded-full bg-gray-300 grid place-items-center">👤</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-800 dark:text-white truncate">User {i}</p>
											<p className="text-sm text-gray-500 dark:text-gray-400 truncate">Performed an important action</p>
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{i * 5} min ago</div>
									</div>
								</div>
							))}
						</div>
						<div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
							<a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">View all activity</a>
						</div>
					</div>
				</div>
				<div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"><h3 className="text-lg font-medium text-gray-800 dark:text-white">Quick Actions</h3></div>
						<div className="p-4 space-y-3">
							{[
								{ icon: "➕", label: "Add New User" },
								{ icon: "🔄", label: "Update Model" },
								{ icon: "⚙️", label: "System Settings" },
								{ icon: "⚠️", label: "View Alerts" },
							].map((a) => (
								<button key={a.label} className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
									<div className="p-2 rounded-full bg-blue-50 dark:bg-gray-700 text-blue-500">{a.icon}</div>
									<span className="text-sm font-medium text-gray-800 dark:text-white">{a.label}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
