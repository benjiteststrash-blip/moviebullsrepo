import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "This player URL has retired. Reload the title page." }, { status: 410 });
}
