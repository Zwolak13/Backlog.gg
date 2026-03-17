"use client";

import { Button } from "@/components/ui/button";

export default function ProfileDangerZone() {
  const deleteAccount = async () => {
    if (!confirm("Are you sure? This action is permanent.")) return;

    await fetch("/api/user/delete", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
      <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>

      <Button variant="destructive" className="w-full" onClick={deleteAccount}>
        Delete Account
      </Button>

      <Button
        className="w-full mt-3 bg-white/10 border border-white/20"
        onClick={() => (window.location.href = "/dashboard/change-password")}
      >
        Change Password
      </Button>
    </div>
  );
}
