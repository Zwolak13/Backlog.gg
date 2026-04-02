"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, ApiResponse, User } from "@/lib/api";
import FullscreenLoader from "@/components/dashboard/FullscreenLoader";
import AuthBackground from "./AuthBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const data: ApiResponse<User> = await getMe();

      if (data.user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    };

    check();
  }, [router]);

  if (checking) return <FullscreenLoader />;

  return <AuthBackground>{children}</AuthBackground>;
}
