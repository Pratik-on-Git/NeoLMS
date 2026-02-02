import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { env } from './lib/env';

const aj = arcjet({
  key: env.ARCJET_KEY || "",
  rules: [
    detectBot({
      mode: "LIVE", 
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CATEGORY:MONITOR"],
    }),
  ],
});

async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

export default createMiddleware(aj, async (request: NextRequest) => {
  // Only protect /admin routes with auth check
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(request);
  }

  return NextResponse.next();
});