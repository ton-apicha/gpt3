import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const session = await getServerSession(authOptions);
	if (session?.user) {
		redirect("/chat");
	}
	redirect("/api/auth/signin?callbackUrl=%2Fchat");
}
