import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type DealsPayload = {
  deals?: unknown[];
  detail?: string;
  error?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "8";
  const currency = searchParams.get("currency") ?? "USD";

  try {
    const res = await fetch(backendApiUrl(`/games/deals/?${new URLSearchParams({ limit, currency })}`), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<DealsPayload>(res, { deals: [] });

    if (!res.ok || error || data.error || data.detail) {
      return NextResponse.json({
        deals: [],
        error: error ?? data.detail ?? data.error ?? "Unable to load deals",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load deals";
    return NextResponse.json({ deals: [], error: message });
  }
}
