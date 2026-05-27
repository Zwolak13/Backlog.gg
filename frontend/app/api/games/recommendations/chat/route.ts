import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type ChatPayload = {
  reply?: string;
  error?: string;
};

export async function POST(req: Request) {
  const body = await req.json() as { message?: string; history?: unknown[] };

  try {
    const headers = await forwardedAuthHeaders(true);
    const res = await fetch(backendApiUrl("/games/recommendations/chat/"), {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<ChatPayload>(res, {});

    if (!res.ok || error) {
      return NextResponse.json(
        { error: error ?? data.error ?? "Chat failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
