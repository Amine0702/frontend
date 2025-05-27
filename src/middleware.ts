// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define protected routes (matcher expects NextRequest)
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/notes(.*)",
  "/projects(.*)",
  "/home(.*)",
  "/meeting(.*)",
  "/teams(.*)",
  "/rapport(.*)",
  "/profile(.*)",
]);

// Clerk middleware: handler receives (auth, req)
export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Invoke auth() to get user data and redirect helper
  const { userId, redirectToSignIn } = await auth();

  // If user is not authenticated and path is protected, redirect
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // Otherwise, continue processing
  return NextResponse.next();
});

// Apply middleware to specific paths (protected routes, API, excluding static)
export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
