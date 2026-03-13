import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define routes that anyone can see
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 2. If the user is NOT logged in and trying to access a private route (like /profile)
  if (!userId && !isPublicRoute(req)) {
    // Manually redirect them to the home page (where your LOG IN button is)
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Otherwise, let the request continue normally
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Standard Next.js matcher to ignore static files and system folders
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
