"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, ApiResponse, User } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data: ApiResponse<User> = await getMe();
      if (data.user) setUser(data.user);
      else router.push("/login");
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}