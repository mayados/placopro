// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { createCsrfMiddleware } from '@edge-csrf/nextjs';
// import { hasRole } from '@/lib/clerk_utils';
// import { NextRequest, NextResponse } from "next/server";
// import jwt from 'jsonwebtoken';


// // ----- Matchers -----
// const isAuthRoute = createRouteMatcher([
//   '/api/auth/(.*)',
//   '/api/clerk/(.*)',
//   '/sign-in',
//   '/sign-up',
//   '/sso-callback',
//   '/v1/(.*)',             
//   '/oauth/(.*)',         
//   '/.clerk/(.*)',         
//   '/favicon.ico',
//   '/_next/(.*)',
//   'director/quotes',
//   '/.clerk/(.*)'
// ]);

// const isForConnectedUsersPage = createRouteMatcher([
//   '/manager(.*)',
//   '/director(.*)',
//   '/employee(.*)',
// ]);

// const isEmployeePage = createRouteMatcher(['/employee(.*)']);
// const isDirectorPage = createRouteMatcher(['/director(.*)']);
// const isSecretaryOrDirectorPage = createRouteMatcher(['/manager(.*)']);

// const isForConnectedUsersApiRoute = createRouteMatcher([
//   '/api/bills(.*)',
//   '/api/quote(.*)',
//   '/api/creditNotes(.*)',
//   '/api/clients(.*)',
//   '/api/service(.*)',
//   '/api/units(.*)',
//   '/api/vatRates(.*)',
//   '/api/workSites(.*)',
//   '/api/plannings(.*)',
//   '/api/users(.*)',
// ]);

// const isDirectorApiRoute = createRouteMatcher([
//   '/api/plannings(.*)',
//   '/api/users(.*)',
// ]);

// const isSecretaryOrDirectorApiRoute = createRouteMatcher([
//   '/api/bills(.*)',
//   '/api/quote(.*)',
//   '/api/creditNotes(.*)',
//   '/api/clients(.*)',
//   '/api/service(.*)',
//   '/api/units(.*)',
//   '/api/vatRates(.*)',
//   '/api/workSites(.*)',
// ]);
// // ----- CSRF -----
// // Instanciation du middleware CSRF
// const csrfMiddleware = createCsrfMiddleware({
//   cookie: {
//     // name: '_csrfSecret',
//     secure: process.env.NODE_ENV === 'production',
//   },
// });


// // ----- CSRF -----
// // export const csrfMiddleware = createCsrfMiddleware({
// //   cookie: {
// //     secure: process.env.NODE_ENV === 'production',
// //   },
// // });

// // ----- Middleware unifié -----
// export const middleware = clerkMiddleware(async (auth, req) => {

//   const url = new URL(req.url);
//   const { userId, sessionClaims, redirectToSignIn, getToken } = await auth();

//   if (!userId) {
//     return redirectToSignIn();
//   }

//   const token = await getToken({ template: "user_public_metadata_role" })

//     // Décoder le token JWT pour accéder aux informations
//     const decodedToken = jwt.decode(token, { complete: true });
//     const payload = decodedToken?.payload;  

//     const role = payload?.role
 
//   console.log("role : "+role)
//   // ROUTES PUBLICS : skip auth + csrf
//   if (isAuthRoute(req)) return NextResponse.next();

//   // AUTHORIZATION LOGIC
//   if (isForConnectedUsersPage(req) && !userId) {
//     return redirectToSignIn();
//   }

//   if (isForConnectedUsersApiRoute(req) && !userId) {
//     return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
//   }

//   if (isDirectorApiRoute(req) && role !== 'directeur') {
//     return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
//   }

//   if (isSecretaryOrDirectorApiRoute(req) && !hasRole(payload, ['directeur', 'secretaire'])) {
//     return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
//   }

//   if (isSecretaryOrDirectorPage(req) && !hasRole(payload, ['directeur', 'secretaire'])) {
//     return NextResponse.redirect(new URL('/403', req.url));
//   }

//   if (isDirectorPage(req) && role !== 'directeur') {
//     return NextResponse.redirect(new URL('/403', req.url));
//   }

//   if (isEmployeePage(req) && role !== 'employe') {
//     return NextResponse.redirect(new URL('/403', req.url));
//   }

//     // --- CSRF Cookie --- (Ajout)
//   // Si c'est une requête HTML sur une page spécifique, ajouter le cookie CSRF
//   // Vérifier si la route est une API qui nécessite une protection CSRF
//   const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/') && 
//                               !request.nextUrl.pathname.startsWith('/api/auth/');
  
//   try {
//     // Pour les routes API protégées, appliquer la validation complète
//     // Pour les autres routes, cela génère uniquement le cookie sans valider
//     await csrfProtect(request, response);
//   } catch (err) {
//     if (err instanceof CsrfError && isProtectedApiRoute) {
//       // Renvoyer une erreur 403 uniquement pour les routes API protégées
//       return new NextResponse('Invalid CSRF token', { status: 403 });
//     }
//     // Pour les autres routes, ignorer l'erreur CSRF
//     if (!(err instanceof CsrfError)) {
//       throw err;
//     }
//   }
//   // protected and allowed route
//   // on applique CSRF si nécessaire
//   // if (!isAuthRoute(req)) {
//   //   const csrfResult = await csrfMiddleware(req);
//   //   if (csrfResult) return csrfResult;
//   // }

//   return NextResponse.next();
// });

// export const config = {
//   // matcher: [
//   //   '/((?!_next|.*\\.(?:ico|jpg|png|svg|css|js|woff2?|ttf|map)).*)',
//   //   '/(api|trpc)(.*)',
//   // ],
//     matcher: ['/((?!api/csrf|.clerk|_next|favicon.ico).*)'], 
// };











import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CsrfError, createCsrfProtect } from '@edge-csrf/nextjs';
import { hasRole } from '@/lib/clerk_utils';
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
// import { csrfMiddleware } from "./lib/csrf";

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
  'director/quotes',
  '/.clerk/(.*)'
]);

const isForConnectedUsersPage = createRouteMatcher([
  '/manager(.*)',
  '/director(.*)',
  '/employee(.*)',
]);

const isEmployeePage = createRouteMatcher(['/employee(.*)']);
const isDirectorPage = createRouteMatcher(['/director(.*)']);
const isSecretaryOrDirectorPage = createRouteMatcher(['/manager(.*)']);

const isForConnectedUsersApiRoute = createRouteMatcher([
  '/api/bills(.*)',
  '/api/quote(.*)',
  '/api/creditNotes(.*)',
  '/api/clients(.*)',
  '/api/service(.*)',
  '/api/units(.*)',
  '/api/vatRates(.*)',
  '/api/workSites(.*)',
  '/api/plannings(.*)',
  '/api/users(.*)',
]);

const isDirectorApiRoute = createRouteMatcher([
  '/api/plannings(.*)',
  '/api/users(.*)',
]);

const isSecretaryOrDirectorApiRoute = createRouteMatcher([
  '/api/bills(.*)',
  '/api/quote(.*)',
  '/api/creditNotes(.*)',
  '/api/clients(.*)',
  '/api/service(.*)',
  '/api/units(.*)',
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
  
  const url = new URL(req.url);
  const { userId, sessionClaims, redirectToSignIn, getToken } = await auth();

  // ROUTES PUBLICS : skip auth (mais on génère quand même un token CSRF)
   // Vérifier si c'est une route API qui nécessite une protection CSRF
   const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/') && 
   !req.nextUrl.pathname.startsWith('/api/auth/') &&
   !req.nextUrl.pathname.startsWith('/api/clerk/');

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

  // Vérifier l'authentification
  if (!userId) {
    return redirectToSignIn();
  }

  // Récupérer et décoder le token pour les rôles
  const token = await getToken({ template: "user_public_metadata_role" });
  const decodedToken = jwt.decode(token, { complete: true });
  const payload = decodedToken?.payload;  
  const role = payload?.role;
 
  // AUTHORIZATION LOGIC
  if (isForConnectedUsersPage(req) && !userId) {
    return redirectToSignIn();
  }

  if (isForConnectedUsersApiRoute(req) && !userId) {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }

  if (isDirectorApiRoute(req) && role !== 'directeur') {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }

  if (isSecretaryOrDirectorApiRoute(req) && !hasRole(payload, ['directeur', 'secretaire'])) {
    return new NextResponse(JSON.stringify({ error: "Access Forbidden" }), { status: 403 });
  }

  if (isSecretaryOrDirectorPage(req) && !hasRole(payload, ['directeur', 'secretaire'])) {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  if (isDirectorPage(req) && role !== 'directeur') {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  if (isEmployeePage(req) && role !== 'employe') {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  // --- CSRF Protection ---
  // Vérifier si c'est une route API qui nécessite une protection CSRF
  try {
    // Appliquer CSRF pour toutes les routes après autorisation
    await csrfProtect(req, response);
  } catch (err) {
    if (err instanceof CsrfError && isProtectedApiRoute) {
      // Renvoyer une erreur 403 uniquement pour les routes API protégées
      return new NextResponse(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403 });
    }
    // Pour les autres routes, ignorer l'erreur CSRF
    if (!(err instanceof CsrfError)) {
      throw err;
    }
  }
  
  // Tout est OK, continuer
  return response;
});

export const config = {
  matcher: ['/((?!.clerk|_next/static|_next/image|favicon.ico).*)'],
};


// export const config = {
//   // matcher: [
//   //   '/((?!_next|.*\\.(?:ico|jpg|png|svg|css|js|woff2?|ttf|map)).*)',
//   //   '/(api|trpc)(.*)',
//   // ],
//     matcher: ['/((?!api/csrf|.clerk|_next|favicon.ico).*)'], 
// };









// ///////////////////////////////////////////////////////////////
