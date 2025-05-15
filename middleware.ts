import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedPage = createRouteMatcher([
  "/intranet(.*)",
  "/director(.*)",
  "/employee(.*)",
]);

export const middleware = clerkMiddleware(async (auth, req) => {
  const { userId, getToken, redirectToSignIn } = await auth();

  if (isProtectedPage(req) && !userId) {
    return redirectToSignIn();
  }

  try {
    const token = await getToken({ template: "user_public_metadata_role" });
    const payload = JSON.parse(atob(token!.split(".")[1]));
    const role = payload?.role;

    console.log("🎫 rôle :", role);

    // Protection selon rôle
    if (req.nextUrl.pathname.startsWith("/director") && role !== "DIRECTOR") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

  } catch (err) {
    console.error("❌ Erreur décodage JWT :", err);
    return new NextResponse("Erreur middleware", { status: 500 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};