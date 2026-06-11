"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileView from "../ProfileView";

function normalizeUsername(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

export default function VisitorProfileClient({ username }: { username: string }) {
  const router = useRouter();
  const [selfCheckResolved, setSelfCheckResolved] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((response) => response.json())
      .then((data) => {
        const currentUsername =
          typeof data?.username === "string"
            ? data.username
            : typeof data?.user?.username === "string"
              ? data.user.username
              : null;

        if (currentUsername && normalizeUsername(currentUsername) === normalizeUsername(username)) {
          router.replace("/dashboard/profile");
          return;
        }

        setSelfCheckResolved(true);
      })
      .catch(() => setSelfCheckResolved(true));
  }, [router, username]);

  if (!selfCheckResolved) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-white/40"
        style={{ background: "rgb(10,11,17)" }}
      >
        Loading...
      </div>
    );
  }

  return <ProfileView username={username} />;
}
