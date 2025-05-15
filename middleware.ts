import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const middleware = clerkMiddleware((auth, req) => {
  console.log("middleware ok"); // test prod
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
 