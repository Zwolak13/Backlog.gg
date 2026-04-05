"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";

export default function GameTile({ game }: { game: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const target = useRef({ rotateX: 0, rotateY: 0 });
  const current = useRef({ rotateX: 0, rotateY: 0 });
  const glowIntensity = useRef(0);
  const targetGlow = useRef(0);

  const MAX_TILT = 10;
  const RINGS = 8;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    let raf: number;

    const animate = () => {
      const isReturning =
        target.current.rotateX === 0 && target.current.rotateY === 0;
      const speed = isReturning ? 0.08 : 0.12;

      current.current.rotateX = lerp(current.current.rotateX, target.current.rotateX, speed);
      current.current.rotateY = lerp(current.current.rotateY, target.current.rotateY, speed);
      glowIntensity.current = lerp(glowIntensity.current, targetGlow.current, 0.08);

      if (Math.abs(current.current.rotateX) < 0.01) current.current.rotateX = 0;
      if (Math.abs(current.current.rotateY) < 0.01) current.current.rotateY = 0;
      if (Math.abs(glowIntensity.current) < 0.005) glowIntensity.current = 0;

      const rx = `${current.current.rotateX}deg`;
      const ry = `${current.current.rotateY}deg`;
      const gi = glowIntensity.current.toFixed(3);

      if (ref.current) {
        ref.current.style.setProperty("--rotateX", rx);
        ref.current.style.setProperty("--rotateY", ry);
      }
      if (ringsRef.current) {
        ringsRef.current.style.setProperty("--rotateX", rx);
        ringsRef.current.style.setProperty("--rotateY", ry);
        ringsRef.current.style.setProperty("--gi", gi);
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleEnter = (e: React.MouseEvent) => {
    if (!ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
    targetGlow.current = 1;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = rectRef.current;
    if (!rect) return;

    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    target.current.rotateY = nx * MAX_TILT;
    target.current.rotateX = -ny * MAX_TILT;

    if (shimmerRef.current) {
      const mx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const my = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      shimmerRef.current.style.setProperty("--mx", `${mx}%`);
      shimmerRef.current.style.setProperty("--my", `${my}%`);
    }
  };

  const handleLeave = () => {
    target.current.rotateX = 0;
    target.current.rotateY = 0;
    targetGlow.current = 0;
  };

  return (
    <Link href={`/dashboard/games/${game.slug}`} className="block">
      <div
        className="relative"
        style={{ overflow: "visible", perspective: "900px" }}
        onMouseEnter={handleEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
      >
        {/* ── RINGS + OCCLUDER ── all in one preserve-3d group */}
        <div
          ref={ringsRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            transform: `
              rotateX(var(--rotateX, 0deg))
              rotateY(var(--rotateY, 0deg))
            `,
          }}
        >
          {/* Rings: i=0 is closest (least depth), i=RINGS-1 is furthest back.
              Further back = more negative Z = smaller due to perspective
              = needs larger scale to still visually extend outside the card. */}
          {Array.from({ length: RINGS }).map((_, i) => {
            const offset = (i + 1) * 7;           // expands outward in screen space
            const depth = (i + 1) * 14;           // goes further behind
            // Counteract perspective shrink: at depth D with perspective P,
            // apparent scale = P/(P+D). We invert it: scale = (P+D)/P
            const P = 900;
            const scale = (P + depth) / P * 0.8;
            const opacity = (1 - i / RINGS) * 0.85;
            const hue = 255 + i * 10;
            const borderRadius = 12 + offset * 0.5;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  inset: `-${offset}px`,
                  borderRadius: `${borderRadius}px`,
                  transform: `translateZ(-${depth}px) scale(${scale.toFixed(4)})`,
                  border: `1.5px solid hsla(${hue}, 85%, 68%, calc(${opacity.toFixed(2)} * var(--gi, 0)))`,
                  boxShadow: `
                    0 0 ${3 + i * 3}px 0 hsla(${hue}, 100%, 70%, calc(${(opacity * 0.5).toFixed(2)} * var(--gi, 0))),
                    inset 0 0 ${2 + i * 2}px 0 hsla(${hue}, 100%, 70%, calc(${(opacity * 0.3).toFixed(2)} * var(--gi, 0)))
                  `,
                }}
              />
            );
          })}

          {/*
            Occluder: sits at Z = -1px (just behind card surface, in front of
            ALL rings which are at -14px, -28px … -112px).
            - Exactly covers the card footprint (inset: 0)
            - Opaque only on hover via --gi; transparent at rest so other tiles
              are never affected
            - backgroundColor must match your page background
          */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "12px",
              // Opacity driven by --gi so it only activates on the hovered tile
              backgroundColor: `rgb(15, 15, 20)`, // ← match your page bg here
              opacity: `calc(0.1 + 0.9 * var(--gi, 0))`,
              transform: "translateZ(-1px)",
            }}
          />
        </div>

        {/* ── CARD ── its own perspective context, renders on top of rings */}
        <div
          ref={ref}
          className="group rounded-xl overflow-hidden [transform-style:preserve-3d]"
          style={{
            transform: `
              rotateX(var(--rotateX, 0deg))
              rotateY(var(--rotateY, 0deg))
            `,
            willChange: "transform",
            // Card sits at Z=0 in its own stacking context — above the rings wrapper
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Shimmer */}
          <div
            ref={shimmerRef}
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            style={{
              background: `radial-gradient(
                circle at var(--mx, 50%) var(--my, 50%),
                rgba(180,140,255,0.13) 0%,
                rgba(100,80,255,0.05) 40%,
                transparent 70%
              )`,
            }}
          />

          <div className="relative w-full h-60 overflow-hidden">
            <Image
              src={game.background_image || "/placeholder.jpg"}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex flex-col justify-end">
              <div
                className="
                  bg-gradient-to-t from-black/95 via-black/70 to-transparent
                  px-4 pb-4 transition-all duration-500
                  group-hover:pt-50
                "
              >
                <h3
                  className="
                    text-lg font-semibold text-white
                    translate-y-8 group-hover:translate-y-[-70px]
                    transition-all duration-500
                  "
                  style={{ transform: "translateZ(40px)" }}
                >
                  {game.name}
                </h3>
                <div
                  className="
                    opacity-0 translate-y-4
                    group-hover:opacity-100 group-hover:translate-y-0
                    transition-all duration-500 delay-100
                  "
                  style={{ transform: "translateZ(60px)" }}
                >
                  {game.metacritic && (
                    <p className="text-sm text-white/70 mt-1">
                      ⭐ {game.metacritic}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}