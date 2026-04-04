"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";

export default function GameTile({ game }: { game: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const target = useRef({ rotateX: 0, rotateY: 0 });
  const current = useRef({ rotateX: 0, rotateY: 0 });

  const MAX_TILT = 10;

  const lerp = (start: number, end: number, t: number) =>
    start + (end - start) * t;

  useEffect(() => {
    let raf: number;

    const animate = () => {
      const isReturning =
        target.current.rotateX === 0 && target.current.rotateY === 0;
      const speed = isReturning ? 0.08 : 0.12;

      current.current.rotateX = lerp(current.current.rotateX, target.current.rotateX, speed);
      current.current.rotateY = lerp(current.current.rotateY, target.current.rotateY, speed);

      // Snap to zero when close enough
      if (Math.abs(current.current.rotateX) < 0.01) current.current.rotateX = 0;
      if (Math.abs(current.current.rotateY) < 0.01) current.current.rotateY = 0;

      if (ref.current) {
        ref.current.style.setProperty("--rotateX", `${current.current.rotateX}deg`);
        ref.current.style.setProperty("--rotateY", `${current.current.rotateY}deg`);
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleEnter = (e: React.MouseEvent) => {
    if (!ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = rectRef.current;
    if (!rect) return;

    // Normalize mouse position to [-1, 1] within the card
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;   // -1 = left,  +1 = right
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;   // -1 = top,   +1 = bottom

    // rotateY: positive = right side comes toward you (mouse on right → tilt right)
    // rotateX: positive = bottom comes toward you (mouse on bottom → tilt down)
    target.current.rotateY =  nx * MAX_TILT;
    target.current.rotateX = -ny * MAX_TILT;
  };

  const handleLeave = () => {
    target.current.rotateX = 0;
    target.current.rotateY = 0;
  };

  return (
      /* TILE */
    <Link href={`/dashboard/games/${game.slug}`} className="block">
      <div className="relative" style={{ perspective: "900px" }}>
        <div
          ref={ref}
          onMouseEnter={handleEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          className="
            group rounded-tl-xl overflow-hidden
            [transform-style:preserve-3d]
          "
          style={{
            transform: `
              rotateX(var(--rotateX, 0deg))
              rotateY(var(--rotateY, 0deg))
            `,
            willChange: "transform",
          }}
        >
          <div className="relative w-full h-60 overflow-hidden">
            <Image
              src={game.background_image || "/placeholder.jpg"}
              alt={game.name}
              fill
              className="
                object-cover
                transition-transform duration-500
                group-hover:scale-110
              "
            />

            <div className="absolute inset-0 flex flex-col justify-end">
              <div
                className="
                  bg-gradient-to-t from-black/95 via-black/70 to-transparent
                  px-4 pb-4
                  transition-all duration-500
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

          <div className="absolute inset-0 rounded-xl pointer-events-none group-hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] transition" />
        </div>
      </div>
    </Link>
  );
}