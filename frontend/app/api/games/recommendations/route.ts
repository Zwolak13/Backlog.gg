import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type RecommendationsPayload = {
  recommendations?: unknown[];
  message?: string;
  error?: string;
};

export async function GET() {
  try {
    const res = await fetch(backendApiUrl("/games/recommendations/"), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<RecommendationsPayload>(res, { recommendations: [] });

    if (!res.ok || error) {
      return NextResponse.json({
        recommendations: [],
        error: error ?? data.error ?? "Unable to load recommendations",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load recommendations";
    return NextResponse.json({ recommendations: [], error: message });
  }
}
