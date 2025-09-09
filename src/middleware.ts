import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
	callbacks: {
		authorized: ({ token, req }) => {
			const pathname = req.nextUrl.pathname;
			if (!token) return false;
			if (pathname.startsWith("/admin")) {
				const roles = (token as any).roleKeys ?? [];
				return Array.isArray(roles) && roles.includes("admin");
			}
			return true;
		},
	},
	pages: {
		signIn: "/login",
	},
});

export function middleware(req: Request) {
	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/chat/:path*"],
};
