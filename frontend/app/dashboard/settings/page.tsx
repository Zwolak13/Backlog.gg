"use client";

import { useState, useEffect } from "react";
import { User, Lock, ShieldAlert, ChevronRight, SlidersHorizontal, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/toast";
import { useRouter } from "next/navigation";

type Section = "profile" | "account" | "preferences" | "danger";

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
    key: "preferences",
    label: "Preferences",
    icon: <SlidersHorizontal size={16} />,
    description: "Content & display",
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

  const [safeMode, setSafeMode] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("backlog_safe_mode");
    if (stored !== null) setSafeMode(stored !== "0");
  }, []);
  const toggleSafe = () => setSafeMode((v) => {
    const next = !v;
    localStorage.setItem("backlog_safe_mode", next ? "1" : "0");
    return next;
  });

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
      <div
        className="relative border-b px-8 py-6 overflow-hidden"
        style={{ background: "rgb(11,12,19)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(to right, transparent 0%, rgba(135,86,241,0.6) 20%, rgba(85,54,218,0.8) 50%, rgba(135,86,241,0.6) 80%, transparent 100%)" }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 50%)", backgroundSize: "18px 18px" }} />
        <div className="relative">
          <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Account Settings</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage your Backlog.gg profile and account</p>
        </div>
      </div>

      <div className="flex flex-1">
        <aside
          className="w-60 shrink-0 border-r p-4"
          style={{ background: "rgb(10,11,17)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/25 text-[10px] uppercase tracking-[0.15em] font-bold px-3 mb-3">
            Settings
          </p>
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-1 group"
              style={active === item.key
                ? { background: "linear-gradient(135deg, rgba(135,86,241,0.15), rgba(85,54,218,0.1))", border: "1px solid rgba(135,86,241,0.25)", color: "white" }
                : { background: "transparent", border: "1px solid transparent", color: "rgba(255,255,255,0.45)" }
              }
            >
              <span style={{ color: active === item.key ? "var(--backlog-purple)" : "rgba(255,255,255,0.3)" }}>
                {item.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none mb-0.5">{item.label}</span>
                <span className="text-xs text-white/25 truncate">{item.description}</span>
              </div>
              {active === item.key && (
                <ChevronRight size={13} className="ml-auto shrink-0" style={{ color: "rgba(135,86,241,0.6)" }} />
              )}
            </button>
          ))}
        </aside>

        <div className="flex-1 p-8 max-w-2xl">

          {active === "profile" && (
            <div>
              <SectionHeader title="Profile" subtitle="Customize how others see you" icon={<User size={15} />} />

              <div
                className="flex items-start gap-5 mb-7 p-5 rounded-xl"
                style={{ background: "rgba(135,86,241,0.05)", border: "1px solid rgba(135,86,241,0.15)" }}
              >
                <div className="relative shrink-0">
                  <div className="p-0.5 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(135,86,241,0.6), rgba(85,54,218,0.4))" }}>
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
                      alt="avatar preview"
                      className="w-20 h-20 rounded-[6px] object-cover block"
                      style={{ background: "rgb(28,30,42)" }}
                    />
                  </div>
                  <div className="absolute -bottom-1.5 left-0 right-0 flex justify-center">
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(135,86,241,0.2)", color: "rgba(167,139,250,0.8)", border: "1px solid rgba(135,86,241,0.2)" }}>Preview</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.12em] font-semibold">
                    Avatar URL
                  </label>
                  <SettingsInput
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-white/25 text-xs">Paste any direct image link. Updates preview above.</p>
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
                    className="w-full p-3 rounded-lg text-sm resize-none text-white/80 placeholder:text-white/20 focus:outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => (e.target.style.borderColor = "rgba(135,86,241,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </SettingsField>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="text-white px-6 font-semibold"
                style={{ background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))", boxShadow: "0 2px 16px rgba(135,86,241,0.3)" }}
              >
                Save Changes
              </Button>
            </div>
          )}

          {active === "account" && (
            <div>
              <SectionHeader title="Account Security" subtitle="Update your login credentials" icon={<Lock size={15} />} />

              <div
                className="p-5 rounded-xl mb-8"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, var(--backlog-purple), var(--backlog-indigo))" }} />
                  <h3 className="text-sm font-semibold text-white/80">Change Password</h3>
                </div>
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
                  className="mt-5 text-white px-6 font-semibold"
                  style={{ background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))", boxShadow: "0 2px 16px rgba(135,86,241,0.3)" }}
                >
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {active === "preferences" && (
            <div>
              <SectionHeader title="Preferences" subtitle="Customize your browsing experience" icon={<SlidersHorizontal size={15} />} />

              <div
                className="p-5 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-white/85 mb-1">Safe Mode</p>
                    <p className="text-xs text-white/35 leading-relaxed">
                      Hide adult and 18+ content from browse and search results.
                    </p>
                  </div>
                  <button
                    onClick={toggleSafe}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0"
                    style={safeMode
                      ? { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", boxShadow: "0 0 12px rgba(52,211,153,0.1)" }
                      : { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", color: "rgba(255,100,100,0.9)" }
                    }
                  >
                    {safeMode ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                    {safeMode ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === "danger" && (
            <div>
              <SectionHeader title="Danger Zone" subtitle="Irreversible actions — proceed with caution" icon={<ShieldAlert size={15} />} />

              <div className="rounded-xl p-6" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg shrink-0" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
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

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-7 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3 mb-1">
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.2)" }}>
            {icon}
          </div>
        )}
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>{title}</h2>
      </div>
      <p className="text-white/38 text-sm" style={{ paddingLeft: icon ? "2.5rem" : "0" }}>{subtitle}</p>
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-white/38 uppercase tracking-[0.12em] font-semibold mb-2 block">
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
      className="w-full p-3 rounded-lg text-sm text-white/85 placeholder:text-white/20 focus:outline-none transition-colors"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
      onFocus={e => (e.target.style.borderColor = "rgba(135,86,241,0.5)")}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
    />
  );
}
