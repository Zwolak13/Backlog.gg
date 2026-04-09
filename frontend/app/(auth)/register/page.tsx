"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, RegisterData, ApiResponse, User } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LOGO from "../../../public/backlog-logo.png";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toast";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");

    try {
      const data: ApiResponse<User> = await register(form);

      if (data.error) {
        toastError(data.error);
        return;
      }

      toastSuccess("Account created!");
      router.push("/dashboard");
    } catch {
      toastError("Something went wrong");
    }
  };

  return (
    <div
      className="
        w-full max-w-md p-10 rounded-3xl backdrop-blur-2xl
        bg-[rgba(25,25,40,0.55)]
        border border-white/10
        relative
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center">
        <Image
          src={LOGO}
          alt="Backlog.gg Logo"
          width={180}
          className="mx-auto mb-4 drop-shadow-[0_0_25px_rgba(255,105,180,0.5)]"
        />

        <p className="text-white/60 mb-8 tracking-wide text-sm">
          Begin your journey
        </p>

        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>

          <div className="text-left">
            <label className="text-xs text-white/60">USERNAME</label>
            <Input
              placeholder="name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="h-12 mt-1 bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-4 text-base"
            />
          </div>

          <div className="text-left">
            <label className="text-xs text-white/60">EMAIL</label>
            <Input
              placeholder="email@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 mt-1 bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-4 text-base"
            />
          </div>

          <div className="text-left">
            <label className="text-xs text-white/60">PASSWORD</label>
            <Input
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12 mt-1 bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-4 text-base"
            />
          </div>

          <div className="text-left">
            <label className="text-xs text-white/60">CONFIRM PASSWORD</label>
            <Input
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-12 mt-1 bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-4 text-base ${
                passwordError ? "border-red-500" : ""
              }`}
            />
            {passwordError && (
              <p className="text-[var(--backlog-pink)] text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="
              mt-2 h-12 text-lg font-medium
              bg-gradient-to-r from-[var(--backlog-purple)] to-[var(--backlog-pink)]
              text-white shadow-lg
              hover:shadow-[0_0_25px_rgba(255,105,180,0.6)]
              transition-all duration-300
              cursor-pointer
            "
          >
            REGISTER
          </Button>
        </form>

        <p className="text-sm text-white/50 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--backlog-pink)] hover:underline transition cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
