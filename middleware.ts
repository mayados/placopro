import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  console.log("✅ middleware simple fonctionne :", req.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs", // très important
};