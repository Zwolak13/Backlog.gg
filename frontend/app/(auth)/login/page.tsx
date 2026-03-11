"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, LoginData, ApiResponse, User } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LOGO from "../../../public/backlog-logo.png";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginData>({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: ApiResponse<User> = await login(form);

      if (data.error) {
        toastError(data.error);
        return;
      }

      toastSuccess("Logged in!");
      router.push("/dashboard");
    } catch {
      toastError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div
        className="
          w-full max-w-md p-10 rounded-3xl backdrop-blur-2xl
          bg-[radial-gradient(circle_at_top_left,rgba(135,86,241,0.45),rgba(20,20,35,0.6))]
          border border-[rgba(135,86,241,0.35)]
          shadow-[0_0_60px_-10px_rgba(135,86,241,0.45)]
          animate-fade-in relative overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--backlog-purple)]/25 to-[var(--backlog-indigo)]/30 pointer-events-none" />

        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[var(--backlog-purple)]/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[var(--backlog-pink)]/20 rounded-full blur-3xl" />

        <div className="relative">
          <Image
            src={LOGO}
            alt="Backlog.gg Logo"
            width={500}
            className="mx-auto drop-shadow-[0_0_25px_rgba(135,86,241,0.5)]"
          />

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="h-14 text-lg bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-5"
            />

            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-14 text-2xl bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-5"
            />

            <Button
              type="submit"
              className="
                mt-2 h-11 text-lg font-medium
                bg-gradient-to-r from-[var(--backlog-purple)] to-[var(--backlog-pink)]
                text-white shadow-lg
                hover:shadow-[0_0_20px_rgba(135,86,241,0.5)]
                transition-all duration-300
                cursor-pointer
              "
            >
              Login
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--backlog-pink)] hover:underline transition cursor-pointer"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
