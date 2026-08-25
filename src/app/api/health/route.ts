import { NextResponse } from "next/server";

import type { HealthResponse } from "@/types/api";

export function GET() {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
