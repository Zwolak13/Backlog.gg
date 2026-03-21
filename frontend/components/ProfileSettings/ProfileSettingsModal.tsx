"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ProfileSettingsModal({ onClose }: { onClose: () => void }) {
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Load current profile data
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/user/me");
      const data = await res.json();

      setBio(data.bio || "");
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
    };
    load();
  }, []);

  const handleSave = async () => {
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        username,
        avatar_url: avatarUrl,
      }),
    });

    onClose();
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    alert("Password updated.");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This action is permanent.")) return;

    await fetch("/api/user/delete", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/60 backdrop-blur-xl
        flex items-center justify-center
        p-6
      "
      onClick={onClose}
    >
      <div
        className="
          bg-[rgba(20,20,35,0.92)]
          border border-white/10
          rounded-2xl shadow-2xl
          p-8 w-full max-w-2xl
          text-white relative
          overflow-y-auto max-h-[90vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            p-2 rounded-lg
            bg-white/5 hover:bg-white/10
            border border-white/10
            transition-all
          "
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-bold mb-8">Profile Settings</h2>

        {/* SECTION: Avatar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
          <input
            type="text"
            placeholder="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="
              w-full p-3 bg-white/10 border border-white/20 rounded-lg
            "
          />
        </div>

        {/* SECTION: Username */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Username</h3>
          <input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="
              w-full p-3 bg-white/10 border border-white/20 rounded-lg
            "
          />
        </div>

        {/* SECTION: Bio */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="
              w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg resize-none
            "
          />
        </div>

        {/* SECTION: Password */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>

          <input
            type="password"
            placeholder="Old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-3 mb-3 bg-white/10 border border-white/20 rounded-lg"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 mb-3 bg-white/10 border border-white/20 rounded-lg"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-3 bg-white/10 border border-white/20 rounded-lg"
          />

          <Button className="w-full" onClick={handlePasswordChange}>
            Update Password
          </Button>
        </div>

        {/* Save */}
        <Button className="w-full mb-3" onClick={handleSave}>
          Save Profile Changes
        </Button>

        {/* Delete account */}
        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
