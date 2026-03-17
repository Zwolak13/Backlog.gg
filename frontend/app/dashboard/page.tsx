"use client";

import { useEffect, useState } from "react";
import { getMe, ApiResponse, User } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data: ApiResponse<User> = await getMe();
      if (data.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.username ?? "User"}!
      </h1>
    </div>
  );
}
