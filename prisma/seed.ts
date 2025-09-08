import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	// Roles
	const [adminRole, userRole] = await Promise.all([
		prisma.role.upsert({
			where: { name: "admin" },
			create: { name: "admin", description: "Administrator" },
			update: {},
		}),
		prisma.role.upsert({
			where: { name: "user" },
			create: { name: "user", description: "Standard user" },
			update: {},
		}),
	]);

	// Admin user
	const email = "admin@example.com";
	const passwordHash = await bcrypt.hash("admin123", 10);
	const adminUser = await prisma.user.upsert({
		where: { email },
		create: { email, name: "Admin", passwordHash },
		update: {},
	});
	await prisma.userRole.upsert({
		where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
		create: { userId: adminUser.id, roleId: adminRole.id },
		update: {},
	});

	// Example models (Ollama)
	await Promise.all([
		prisma.model.upsert({
			where: { id: "llama3.1:8b" },
			create: { id: "llama3.1:8b", provider: "ollama", label: "Llama 3.1 8B", contextLength: 8192, temperature: 0.7 },
			update: {},
		}),
		prisma.model.upsert({
			where: { id: "llama3.1:70b" },
			create: { id: "llama3.1:70b", provider: "ollama", label: "Llama 3.1 70B", contextLength: 8192, temperature: 0.7 },
			update: {},
		}),
	]);

	console.log("Seed completed. Admin: admin@example.com / admin123");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
