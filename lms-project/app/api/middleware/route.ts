import { NextRequest, NextResponse } from "next/server";
import arcjet, { detectBot } from "@arcjet/next";
import { env } from "@/lib/env";

const aj = arcjet({
  key: env.ARCJET_KEY || "",
  rules: [
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CATEGORY:MONITOR", "STRIPE_WEBHOOK"],
    }),
  ],
});

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ denied: true }, { status: 403 });
    }

    return NextResponse.json({ allowed: true }, { status: 200 });
  } catch (error) {
    // Log error but allow request to proceed
    console.error("Arcjet protection error:", error);
    return NextResponse.json({ allowed: true }, { status: 200 });
  }
}
