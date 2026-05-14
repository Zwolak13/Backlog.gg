import { redirect } from "next/navigation";

import VisitorProfileClient from "./VisitorProfileClient";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

type MePayload =
  | {
      id?: number;
      username?: string;
    }
  | {
      user?: {
        id?: number;
        username?: string;
      };
    };

function normalizeUsername(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

function extractCurrentUser(data: MePayload) {
  if ("user" in data && data.user) {
    return data.user;
  }

  const flat = data as { id?: number; username?: string };
  return {
    id: flat.id,
    username: flat.username,
  };
}

export default async function FriendProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const normalizedRouteUsername = normalizeUsername(username);

  try {
    const meResponse = await fetch(backendApiUrl("/user/me/"), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data: meData } = await readBackendJson<MePayload>(meResponse, {});
    const currentUser = extractCurrentUser(meData);

    if (currentUser) {
      const sameByUsername =
        typeof currentUser.username === "string" &&
        normalizeUsername(currentUser.username) === normalizedRouteUsername;

      if (sameByUsername) {
        redirect("/dashboard/profile");
      }
    }
  } catch {
    // If the redirect pre-check fails, the client component still has a backup self-check.
  }

  return <VisitorProfileClient username={username} />;
}
