"use client";

import { useState, useEffect } from "react";
import { User, Lock, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/toast";
import { useRouter } from "next/navigation";

type Section = "profile" | "account" | "danger";

const NAV: { key: Section; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: "profile",
    label: "Profile",
    icon: <User size={16} />,
    description: "Avatar, username, bio",
  },
  {
    key: "account",
    label: "Account",
    icon: <Lock size={16} />,
    description: "Password & security",
  },
  {
    key: "danger",
    label: "Danger Zone",
    icon: <ShieldAlert size={16} />,
    description: "Delete account",
  },
];

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        setUsername(d.username ?? "");
        setBio(d.bio ?? "");
        setAvatarUrl(d.avatar_url ?? "");
      });
  }, []);

  const handleSaveProfile = async () => {
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio, avatar_url: avatarUrl }),
    });
    const data = await res.json();
    if (data.error) toastError(data.error);
    else toastSuccess("Profile updated!");
  };

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) {
      toastError("New passwords do not match.");
      return;
    }
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
    const data = await res.json();
    if (data.error) toastError(data.error);
    else {
      toastSuccess("Password changed!");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This permanently deletes your account.")) return;
    await fetch("/api/user/delete", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      <div className="border-b border-white/10 px-8 py-6 bg-[rgba(14,15,22,0.8)]">
        <h1 className="text-xl font-bold text-white/90 tracking-tight">Account Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your Backlog.gg profile and account</p>
      </div>

      <div className="flex flex-1">
        <aside className="w-60 shrink-0 border-r border-white/10 p-4 bg-[rgba(14,15,22,0.4)]">
          <p className="text-white/30 text-xs uppercase tracking-widest font-semibold px-3 mb-3">
            Settings
          </p>
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all mb-1 group
                ${
                  active === item.key
                    ? "bg-[var(--backlog-purple)]/15 border border-[var(--backlog-purple)]/25 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white/80 border border-transparent"
                }
              `}
            >
              <span className={active === item.key ? "text-[var(--backlog-purple)]" : "text-white/40 group-hover:text-white/60"}>
                {item.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none mb-0.5">{item.label}</span>
                <span className="text-xs text-white/30 truncate">{item.description}</span>
              </div>
              {active === item.key && (
                <ChevronRight size={14} className="ml-auto text-[var(--backlog-purple)]/60 shrink-0" />
              )}
            </button>
          ))}
        </aside>

        <div className="flex-1 p-8 max-w-2xl">

          {active === "profile" && (
            <div>
              <SectionHeader title="Profile" subtitle="Customize how others see you" />

              <div className="flex items-start gap-5 mb-7 p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <img
                  src={
                    avatarUrl ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`
                  }
                  alt="avatar preview"
                  className="w-20 h-20 rounded object-cover bg-white/10 border border-white/10 shrink-0"
                />
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest">
                    Avatar URL
                  </label>
                  <SettingsInput
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-white/25 text-xs">Paste any direct image link.</p>
                </div>
              </div>

              <div className="flex flex-col gap-5 mb-8">
                <SettingsField label="Username">
                  <SettingsInput value={username} onChange={setUsername} />
                </SettingsField>

                <SettingsField label="Bio">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell the world about yourself…"
                    className="
                      w-full p-3 rounded-lg text-sm resize-none
                      bg-white/[0.04] border border-white/10
                      text-white/80 placeholder:text-white/20
                      focus:outline-none focus:border-[var(--backlog-purple)]/50
                      transition-colors
                    "
                  />
                </SettingsField>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="bg-[var(--backlog-purple)] hover:bg-[var(--backlog-indigo)] text-white px-6"
              >
                Save Changes
              </Button>
            </div>
          )}

          {active === "account" && (
            <div>
              <SectionHeader title="Account Security" subtitle="Update your login credentials" />

              <div
                className="p-5 rounded-xl border border-white/10 bg-white/[0.03] mb-8"
              >
                <h3 className="text-sm font-semibold text-white/80 mb-4">Change Password</h3>
                <div className="flex flex-col gap-4">
                  <SettingsField label="Current Password">
                    <SettingsInput
                      type="password"
                      value={oldPass}
                      onChange={setOldPass}
                      placeholder="••••••••"
                    />
                  </SettingsField>
                  <SettingsField label="New Password">
                    <SettingsInput
                      type="password"
                      value={newPass}
                      onChange={setNewPass}
                      placeholder="••••••••"
                    />
                  </SettingsField>
                  <SettingsField label="Confirm New Password">
                    <SettingsInput
                      type="password"
                      value={confirmPass}
                      onChange={setConfirmPass}
                      placeholder="••••••••"
                    />
                  </SettingsField>
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="mt-5 bg-[var(--backlog-purple)] hover:bg-[var(--backlog-indigo)] text-white px-6"
                >
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {active === "danger" && (
            <div>
              <SectionHeader title="Danger Zone" subtitle="Irreversible actions — proceed with caution" />

              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                    <ShieldAlert size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white/90 mb-1">Delete Account</h3>
                    <p className="text-white/45 text-sm leading-relaxed mb-5">
                      This will permanently delete your account, all your game lists, ratings, and
                      any data associated with your profile. There is no going back.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-500 border-0"
                    >
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7 pb-4 border-b border-white/10">
      <h2 className="text-lg font-semibold text-white/90">{title}</h2>
      <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function SettingsInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full p-3 rounded-lg text-sm
        bg-white/[0.04] border border-white/10
        text-white/80 placeholder:text-white/20
        focus:outline-none focus:border-[var(--backlog-purple)]/50
        transition-colors
      "
    />
  );
}
