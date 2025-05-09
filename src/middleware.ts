import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/calendar(.*)",
  "/projects(.*)",
  "/home(.*)",
  "/meeting(.*)",
  "/team(.*)",
  "/priority(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth(); // Await the auth() function

  if (!authData.userId && isProtectedRoute(req)) {
    return authData.redirectToSignIn();
  }
});

export const config: { matcher: string[] } = {
  matcher: [
    "/admin/:path",
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
