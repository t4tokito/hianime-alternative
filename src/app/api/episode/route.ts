import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ episode: null }, { status: 400 });
    const res = await fetch(`${API_BASE}/episode/${slug}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ episode: null }, { status: 500 });
  }
}
