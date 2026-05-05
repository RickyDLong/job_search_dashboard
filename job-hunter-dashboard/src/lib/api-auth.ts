import { NextResponse } from "next/server";

/**
 * Validate API route requests with a shared secret.
 * Set AUTOPILOT_API_SECRET in your environment.
 * Falls back to allowing all requests if no secret is configured (dev mode).
 */
export function validateApiAuth(request: Request): NextResponse | null {
  const secret = process.env.AUTOPILOT_API_SECRET;

  // In dev mode without a secret configured, allow all requests
  if (!secret) return null;

  const authHeader = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

  if (authHeader !== secret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}
