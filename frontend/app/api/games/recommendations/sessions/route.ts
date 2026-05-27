import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

export async function GET() {
  try {
    const res = await fetch(backendApiUrl("/games/recommendations/sessions/"), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<{ sessions?: unknown[] }>(res, { sessions: [] });
    if (!res.ok || error) return NextResponse.json({ sessions: [], error }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ sessions: [], error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const headers = await forwardedAuthHeaders(true);
    const res = await fetch(backendApiUrl("/games/recommendations/sessions/"), {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<object>(res, {});
    if (!res.ok || error) return NextResponse.json({ error }, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
