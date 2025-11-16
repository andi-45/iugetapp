// src/app/api/auth/session/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
// This route is no longer necessary in a static export setup.
// However, it can be kept for potential future use if the app ever moves back to a server model,
// or for local development where a server is running.
// For a true static build, this file and its logic would be unused.

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: "Session endpoint not active in static mode." });
}

export async function DELETE() {
   cookies().delete('session');
  return NextResponse.json({ success: true, message: "Session endpoint not active in static mode." });
}
