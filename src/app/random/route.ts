import { NextResponse } from "next/server";
import { fetchPopular } from "@/lib/tmdb";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const page = Math.floor(Math.random() * 20) + 1;
  const data = await fetchPopular("movie", page);
  const candidates = data.results.filter((movie) => movie.poster_path);
  const pick = candidates[Math.floor(Math.random() * candidates.length)] || data.results[0];

  if (!pick) {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.redirect(new URL(`/movie/${pick.id}`, origin));
}
