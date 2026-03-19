"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import FullscreenLoader from "@/components/dashboard/FullscreenLoader";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getMe();
      if (!data.user) router.push("/login");
      else setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <FullscreenLoader />;

  return (
    <div className="min-h-screen bg-background text-foreground md:pl-20">
      <Sidebar />
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
