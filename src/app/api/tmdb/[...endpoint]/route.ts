import { NextRequest, NextResponse } from "next/server";

function getTmdbAuth(token: string): { headers: Record<string, string>; apiKey?: string } {
  const cleanToken = token.trim().replace(/^Bearer\s+/i, "");
  const isReadAccessToken = cleanToken.startsWith("eyJ") || cleanToken.split(".").length === 3;

  return isReadAccessToken
    ? { headers: { Authorization: `Bearer ${cleanToken}`, "Content-Type": "application/json" }, apiKey: undefined }
    : { headers: { "Content-Type": "application/json" }, apiKey: cleanToken };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  const { endpoint } = await params;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 500 });
  }

  const path = endpoint.join("/");
  const auth = getTmdbAuth(apiKey);
  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  if (auth.apiKey) {
    searchParams.set("api_key", auth.apiKey);
  }
  const url = `https://api.themoviedb.org/3/${path}${searchParams ? `?${searchParams}` : ""}`;

  const res = await fetch(url, {
    headers: auth.headers,
    next: { revalidate: 3600 },
  });

  const data = await res.json();

  const response = NextResponse.json(data, { status: res.status });
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");

  return response;
}
