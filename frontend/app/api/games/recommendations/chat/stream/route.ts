import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function POST(req: NextRequest) {
  const body = await req.text();
  try {
    const headers = await forwardedAuthHeaders(true);
    const res = await fetch(backendApiUrl("/games/recommendations/chat/stream/"), {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
