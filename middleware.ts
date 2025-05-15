import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const middleware = clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    console.log("✅ auth() ok :", userId);
  } catch (err) {
    console.error("❌ auth() failed", err);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};