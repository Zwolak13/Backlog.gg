"use client";

import { useState } from "react";
import { toastSuccess, toastError } from "@/lib/toast";

export default function ProfileAvatar() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      toastSuccess("Avatar updated!");
    } catch {
      toastError("Failed to upload avatar");
    }
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>

      <div className="flex items-center gap-6">
        <img
          src={preview ?? "/default-avatar.png"}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border border-white/20"
        />

        <label className="cursor-pointer bg-[var(--backlog-purple)] px-4 py-2 rounded-lg text-white hover:opacity-80 transition">
          Upload new
          <input type="file" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}
