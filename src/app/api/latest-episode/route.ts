import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "1";
    const limit = request.nextUrl.searchParams.get("limit") || "24";
    const res = await fetch(`${API_BASE}/latest/episode?page=${page}&limit=${limit}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ episodes: [] }, { status: 500 });
  }
}
