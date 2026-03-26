"use client";

import { useState, useEffect } from "react";
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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const drift = (t: number, speed: number, ampX: number, ampY: number) => ({
    x: Math.sin(t * speed) * ampX,
    y: Math.cos(t * speed * 0.8) * ampY
  });

  const [t, setT] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setT((prev) => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
      <div
      className="
        min-h-screen flex items-center justify-center
        bg-[#0d0d16]
        relative overflow-hidden
        text-white px-4
      "
    >

      {/* 1. GRID  */}
      <div
        style={{
          transform: `translate(${mousePos.x * 0.007}px, ${mousePos.y * -0.019}px)`
        }}
        className="
          absolute inset-0
          bg-[radial-gradient(circle,_rgba(255,255,255,0.25)_1px,_transparent_1px)]
          [background-size:24px_24px]
          opacity-20
          pointer-events-none
        "
      />



      {/* 2. MASKI (wygaszają tylko grid) */}
      <div className="absolute inset-0 pointer-events-none">

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.55) * 36}px,
                ${Math.cos(t * 0.45) * 28}px
              )
            `,
            background: `
              radial-gradient(circle,
                rgba(0,0,0,0.55) 0%,
                rgba(0,0,0,0.32) 40%,
                rgba(0,0,0,0.12) 70%,
                rgba(0,0,0,0) 100%
              )
            `
          }}
          className="absolute -top-40 -left-20 w-[420px] h-[420px] rounded-full"
        />

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.45) * 44}px,
                ${Math.cos(t * 0.6) * 32}px
              )
            `,
            background: `
              radial-gradient(circle,
                rgba(0,0,0,0.50) 0%,
                rgba(0,0,0,0.28) 40%,
                rgba(0,0,0,0.10) 70%,
                rgba(0,0,0,0) 100%
              )
            `
          }}
          className="absolute top-1/3 -right-32 w-[360px] h-[360px] rounded-full"
        />

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.35) * 52}px,
                ${Math.cos(t * 0.5) * 40}px
              )
            `,
            background: `
              radial-gradient(circle,
                rgba(0,0,0,0.48) 0%,
                rgba(0,0,0,0.26) 40%,
                rgba(0,0,0,0.10) 70%,
                rgba(0,0,0,0) 100%
              )
            `
          }}
          className="absolute bottom-0 left-1/4 w-[480px] h-[480px] rounded-full"
        />

      </div>

      {/* 3. TŁO (szary kolor, NIE przyciemniany przez maski) */}
      <div className="absolute inset-0 bg-[#0d0d16]/60 pointer-events-none" />

      {/* 4. ORBY  */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.55) * 36}px,
                ${Math.cos(t * 0.45) * 28}px
              )
              scale(${1 + Math.sin(t * 0.8) * 0.07})
            `,
            background: `
              radial-gradient(circle,
                rgba(135,86,241,0.32) 0%,
                rgba(135,86,241,0.18) 40%,
                rgba(135,86,241,0.08) 70%,
                rgba(135,86,241,0) 100%
              )
            `
          }}
          className="absolute -top-40 -left-20 w-[420px] h-[420px] blur-[95px] rounded-full"
        />

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.45) * 44}px,
                ${Math.cos(t * 0.6) * 32}px
              )
              scale(${1 + Math.sin(t * 1.0) * 0.08})
            `,
            background: `
              radial-gradient(circle,
                rgba(255,105,180,0.30) 0%,
                rgba(255,105,180,0.16) 40%,
                rgba(255,105,180,0.07) 70%,
                rgba(255,105,180,0) 100%
              )
            `
          }}
          className="absolute top-1/3 -right-32 w-[360px] h-[360px] blur-[85px] rounded-full"
        />

        <div
          style={{
            transform: `
              translate(
                ${Math.sin(t * 0.35) * 52}px,
                ${Math.cos(t * 0.5) * 40}px
              )
              scale(${1 + Math.sin(t * 0.7) * 0.075})
            `,
            background: `
              radial-gradient(circle,
                rgba(90,120,255,0.28) 0%,
                rgba(90,120,255,0.15) 40%,
                rgba(90,120,255,0.06) 70%,
                rgba(90,120,255,0) 100%
              )
            `
          }}
          className="absolute bottom-0 left-1/4 w-[480px] h-[480px] blur-[100px] rounded-full"
        />

      </div>

      {/* 5. UI */}
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
            className="mx-auto mb-4 drop-shadow-[0_0_25px_rgba(135,86,241,0.6)]"
          />

          <p className="text-white/60 mb-8 tracking-wide text-sm">
            Enter your gaming realm
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
              <label className="text-xs text-white/60">PASSWORD</label>
              <Input
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-12 mt-1 bg-white/10 border-white/20 focus-visible:ring-[var(--backlog-purple)] px-4 text-base"
              />
              <p className="text-right text-xs text-[var(--backlog-pink)] mt-1 cursor-pointer hover:underline">
                Forgot?
              </p>
            </div>

            <Button
              type="submit"
              className="
                mt-2 h-12 text-lg font-medium
                bg-gradient-to-r from-[var(--backlog-purple)] to-[var(--backlog-pink)]
                text-white shadow-lg
                hover:shadow-[0_0_25px_rgba(135,86,241,0.6)]
                transition-all duration-300
                cursor-pointer
              "
            >
              LOG IN
            </Button>
          </form>

          <p className="text-sm text-white/50 mt-6">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--backlog-pink)] hover:underline transition cursor-pointer"
            >
              Register Now
            </Link>
          </p>

          <div className="flex justify-center gap-6 text-xs text-white/40 mt-8">
            <span className="cursor-pointer hover:text-white/70">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white/70">Terms of Service</span>
            <span className="cursor-pointer hover:text-white/70">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
