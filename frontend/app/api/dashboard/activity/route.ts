import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type ActivityPayload = {
  activity?: unknown[];
  detail?: string;
  error?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "20";

  try {
    const res = await fetch(backendApiUrl(`/games/activity/friends/?limit=${encodeURIComponent(limit)}`), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<ActivityPayload>(res, { activity: [] });

    if (!res.ok || error || data.error || data.detail) {
      return NextResponse.json({
        activity: [],
        error: error ?? data.detail ?? data.error ?? "Unable to load activity",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load activity";
    return NextResponse.json({ activity: [], error: message });
  }
}
