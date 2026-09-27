import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "WorkBridge API",
    version: "1.0.0",
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use specific API routes" }, { status: 404 });
}
