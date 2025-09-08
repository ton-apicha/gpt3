import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatIndex() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");
	const chat = await prisma.chat.create({ data: { userId: session.user.id } });
	redirect(`/chat/${chat.id}`);
}
