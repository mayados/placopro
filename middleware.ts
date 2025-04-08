import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createCsrfMiddleware } from '@edge-csrf/nextjs';

// createRouteMatcher => allows to restrict access to routes

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

// initalize csrf protection middleware
const csrfMiddleware = createCsrfMiddleware({
  cookie: {
    // Allows to be sure the cookie is only transmitted  by HTTPS
    secure: process.env.NODE_ENV === 'production',
  },
});

export const middleware = csrfMiddleware;
