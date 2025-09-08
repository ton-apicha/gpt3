import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
	callbacks: {
		authorized: ({ token }) => !!token,
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
