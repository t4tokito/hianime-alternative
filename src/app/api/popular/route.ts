import { NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/anime/popular`, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ animes: [] }, { status: 500 });
  }
}
