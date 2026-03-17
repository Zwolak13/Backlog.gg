"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProfileDetails() {
  const [bio, setBio] = useState("");

  const handleSave = async () => {
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

      <textarea
        placeholder="Your bio..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg"
      />

      <Button onClick={handleSave} className="mt-4">
        Save changes
      </Button>
    </div>
  );
}
