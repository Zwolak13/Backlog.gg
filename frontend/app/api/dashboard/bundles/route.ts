import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type BundlesPayload = {
  bundles?: unknown[];
  detail?: string;
  error?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "8";

  try {
    const res = await fetch(backendApiUrl(`/games/bundles/?limit=${encodeURIComponent(limit)}`), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<BundlesPayload>(res, { bundles: [] });

    if (!res.ok || error || data.error || data.detail) {
      return NextResponse.json({
        bundles: [],
        error: error ?? data.detail ?? data.error ?? "Unable to load bundles",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bundles";
    return NextResponse.json({ bundles: [], error: message });
  }
}
