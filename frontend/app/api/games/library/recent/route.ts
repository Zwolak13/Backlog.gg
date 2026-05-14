import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

export async function GET() {
  try {
    const res = await fetch(backendApiUrl("/games/library/recent/"), {
      headers: await forwardedAuthHeaders(),
    });
    const { data, error } = await readBackendJson<Record<string, unknown>>(res, {});

    if (!res.ok || error) {
      return NextResponse.json(
        { games: [], error: error ?? data.error ?? data.detail ?? "Unable to load recent games" },
        { status: res.status || 502 },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unreachable";
    return NextResponse.json({ games: [], error: message }, { status: 503 });
  }
}
