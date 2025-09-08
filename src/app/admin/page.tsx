import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
	const [users, chats, messages] = await Promise.all([
		prisma.user.count(),
		prisma.chat.count(),
		prisma.message.count(),
	]);
	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">System Overview</h1>
			<div className="grid grid-cols-3 gap-4">
				<div className="rounded-md border p-4"><div className="text-sm text-zinc-500">Users</div><div className="text-2xl font-bold">{users}</div></div>
				<div className="rounded-md border p-4"><div className="text-sm text-zinc-500">Chats</div><div className="text-2xl font-bold">{chats}</div></div>
				<div className="rounded-md border p-4"><div className="text-sm text-zinc-500">Messages</div><div className="text-2xl font-bold">{messages}</div></div>
			</div>
		</div>
	);
}
