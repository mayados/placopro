// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedPage = createRouteMatcher([
//   "/intranet(.*)",
//   "/director(.*)",
//   "/employee(.*)",
// ]);

// export const middleware = clerkMiddleware(async (auth, req) => {
//   const { userId, getToken, redirectToSignIn } = await auth();

//   if (isProtectedPage(req) && !userId) {
//     return redirectToSignIn();
//   }

//   try {
//     const token = await getToken({ template: "user_public_metadata_role" });
//     const payload = JSON.parse(atob(token!.split(".")[1]));
//     const role = payload?.role;

//     console.log("🎫 rôle :", role);

//     // Protection selon rôle
//     if (req.nextUrl.pathname.startsWith("/director") && role !== "DIRECTOR") {
//       return NextResponse.redirect(new URL("/403", req.url));
//     }

//     if (req.nextUrl.pathname.startsWith("/employee") && role !== "EMPLOYEE") {
//       return NextResponse.redirect(new URL("/403", req.url));
//     }

//   } catch (err) {
//     console.error("❌ Erreur décodage JWT :", err);
//     return new NextResponse("Erreur middleware", { status: 500 });
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };


///////////////////////////////////////////////////////////////////////////////////////////////
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CsrfError, createCsrfProtect } from '@edge-csrf/nextjs';
import { NextResponse } from "next/server";
// import { csrfMiddleware } from "./lib/csrf";
 
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://www.placopro.pro",
];
 
// ----- Matchers -----
const isAuthRoute = createRouteMatcher([
  '/api/auth/(.*)',
  '/api/clerk/(.*)',
  '/sign-in',
  '/sign-up',
  '/sso-callback',
  '/v1/(.*)',
  '/oauth/(.*)',
  '/.clerk/(.*)',
  '/favicon.ico',
  '/_next/(.*)',
  // 'director/quotes',
  '/.clerk/(.*)'
]);
 
const isForConnectedUsersPage = createRouteMatcher([
  '/manager(.*)',
  '/director(.*)',
  '/employee(.*)',
  '/intranet(.*)',
  'public/intranet/post-login(.*)'
]);
 
const isEmployeePage = createRouteMatcher(['/intranet/employee(.*)']);
const isDirectorPage = createRouteMatcher(['/intranet/director(.*)']);
const isSecretaryOrDirectorPage = createRouteMatcher(['/intranet/secretary(.*)']);
 
const isForConnectedUsersApiRoute = createRouteMatcher([
  '/api/bills(.*)',
  '/api/quote(.*)',
  '/api/creditNotes(.*)',
  '/api/clients(.*)',
  '/api/service(.*)',
  // '/api/units(.*)',
  '/api/units/create',
  '/api/vatRates(.*)',
  '/api/workSites(.*)',
  '/api/plannings(.*)',
  // '/api/users(.*)',
]);
 
const isDirectorApiRoute = createRouteMatcher([
  '/api/plannings(.*)',
  // '/api/users(.*)',
]);
 
const isSecretaryOrDirectorApiRoute = createRouteMatcher([
  '/api/bills(.*)',
  '/api/quote(.*)',
  '/api/creditNotes(.*)',
  '/api/clients(.*)',
  '/api/service(.*)',
  // '/api/units(.*)',
  '/api/vatRates(.*)',
  '/api/workSites(.*)',
]);
 
// ----- CSRF Protection -----
const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});
 
// ----- Middleware unifié -----
export const middleware = clerkMiddleware(async (auth, req) => {
  // Créer une réponse par défaut pour pouvoir y ajouter le cookie CSRF
  const response = NextResponse.next();
    const origin = req.headers.get("origin") || "";

 
  // ————— CORS HEADER INJECTION —————
  if (req.nextUrl.pathname.startsWith("/api/") && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    );
    response.headers.set(
  "Access-Control-Allow-Headers",
  [
    "Content-Type",
    "X-CSRF-Token",
    "Authorization",
    "X-Create-Type",
    "X-Update-Type",
    "X-post-type",
    "X-patch-type",
    "X-create-Type",
    "X-get-type"
  ].join(", ")
);
  }
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }
 
  // const url = new URL(req.url);
  const { userId, redirectToSignIn, getToken } = await auth();
  // Déterminer si c'est une requête serveur ou client
  const isServerSideRequest = req.headers.get('x-middleware-prefetch') === '1' ||
    !req.headers.get('sec-fetch-dest');
  // ROUTES PUBLICS : skip auth (mais on génère quand même un token CSRF)
  // Vérifier si c'est une route API qui nécessite une protection CSRF
  const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/') &&
    !req.nextUrl.pathname.startsWith('/api/auth/') &&
    !req.nextUrl.pathname.startsWith('/api/clerk/');
  // Pour les requêtes GET api depuis le serveur, on ignore la validation CSRF
  if (isServerSideRequest && req.method === 'GET' && isProtectedApiRoute) {
    // Ne pas appliquer CSRF pour les requêtes GET côté serveur vers les API
    return response;
  }
  // ROUTES PUBLICS : skip auth + appliquer CSRF de manière sélective
  if (isAuthRoute(req)) {
    // Pour les routes d'authentification, uniquement générer le cookie sans validation
    try {
      await csrfProtect(req, response);
    } catch (err) {
      // Ignorer les erreurs CSRF sur les routes d'authentification
      if (!(err instanceof CsrfError)) throw err;
    }
    return response;
  }
 
 
  const token = await getToken({ template: 'user_public_metadata_role' });
  if (!token) {
    console.warn('Token introuvable pour utilisateur connecté.');
    return NextResponse.next();
  }

  let role: string | undefined;
  try {
    // 2) Découpe et décode la partie payload
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as { role?: string };

    // 3) Lis le rôle
    role = payload.role;
    console.log('role du user :', role);
  } catch (e) {
    console.error('Erreur lors du décodage du JWT :', e);
  }
 
 
  // AUTHORIZATION LOGIC
  if (isForConnectedUsersPage(req) && !userId) {
    return redirectToSignIn();
  }
 
  if (isForConnectedUsersApiRoute(req) && !userId) {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }
 
  if (isDirectorApiRoute(req) && role !== "DIRECTOR") {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }
 
  if (  isSecretaryOrDirectorApiRoute(req) && 
  role !== "DIRECTOR" && 
  role !== "SECRETARY") {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }
 
if (
  isSecretaryOrDirectorPage(req) &&
  role !== "DIRECTOR" &&
  role !== "SECRETARY"
) {
  return NextResponse.redirect(new URL('/403', req.url));
}
 
  if (isDirectorPage(req) && role !== "DIRECTOR") {
    return NextResponse.redirect(new URL('/403', req.url));
  }
 
  if (isEmployeePage(req) && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL('/403', req.url));
  }
 

 
  // --- CSRF Protection ---
  // Apply csrf only for not GET requests or client requests (if we don't add this block of code, SSR won't pass)
  if (req.method !== 'GET' || !isServerSideRequest) {
    try {
      // Apply CSRF for all routes after authorization
      await csrfProtect(req, response);
    } catch (err) {
      if (err instanceof CsrfError && isProtectedApiRoute) {
        // Return 403 error only for protected API routes
        return new NextResponse(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403 });
      }
      // For other routes, ignore csrf error
      if (!(err instanceof CsrfError)) {
        throw err;
      }
    }
  }
 
 
  // evrything is okay, continue
  return response;
});
 
export const config = {
  matcher: ['/((?!.clerk|_next/static|_next/image|favicon.ico).*)'],
};