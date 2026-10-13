import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const version = process.env.NEXT_PUBLIC_BUILD_ID;
  if (!version) {
    return NextResponse.json(
      { error: "Build version unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store" } });
}
