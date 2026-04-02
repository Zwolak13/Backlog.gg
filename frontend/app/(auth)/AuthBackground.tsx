"use client";

import { useState, useEffect } from "react";

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [t, setT] = useState(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

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
        bg-[#0d0d16]/100
        relative overflow-hidden
        text-white px-4
      "
    >

      {/* GRID */}
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

      {/* MASKS */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            transform: `translate(${Math.sin(t * 0.55) * 36}px, ${Math.cos(t * 0.45) * 28}px)`,
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
            transform: `translate(${Math.sin(t * 0.45) * 44}px, ${Math.cos(t * 0.6) * 32}px)`,
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
            transform: `translate(${Math.sin(t * 0.35) * 52}px, ${Math.cos(t * 0.5) * 40}px)`,
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

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#0d0d16]/60 pointer-events-none" />

      {/* ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            transform: `translate(${Math.sin(t * 0.55) * 36}px, ${Math.cos(t * 0.45) * 28}px) scale(${1 + Math.sin(t * 0.8) * 0.07})`,
            background: `
              radial-gradient(circle,
                rgba(255,105,180,0.32) 0%,
                rgba(255,105,180,0.18) 40%,
                rgba(255,105,180,0.08) 70%,
                rgba(255,105,180,0) 100%
              )
            `
          }}
          className="absolute -top-40 -left-20 w-[420px] h-[420px] blur-[95px] rounded-full"
        />

        <div
          style={{
            transform: `translate(${Math.sin(t * 0.45) * 44}px, ${Math.cos(t * 0.6) * 32}px) scale(${1 + Math.sin(t * 1.0) * 0.08})`,
            background: `
              radial-gradient(circle,
                rgba(106,168,255,0.30) 0%,
                rgba(106,168,255,0.16) 40%,
                rgba(106,168,255,0.07) 70%,
                rgba(106,168,255,0) 100%
              )
            `
          }}
          className="absolute top-1/3 -right-32 w-[360px] h-[360px] blur-[85px] rounded-full"
        />

        <div
          style={{
            transform: `translate(${Math.sin(t * 0.35) * 52}px, ${Math.cos(t * 0.5) * 40}px) scale(${1 + Math.sin(t * 0.7) * 0.075})`,
            background: `
              radial-gradient(circle,
                rgba(77,240,217,0.28) 0%,
                rgba(77,240,217,0.15) 40%,
                rgba(77,240,217,0.06) 70%,
                rgba(77,240,217,0) 100%
              )
            `
          }}
          className="absolute bottom-0 left-1/4 w-[480px] h-[480px] blur-[100px] rounded-full"
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
