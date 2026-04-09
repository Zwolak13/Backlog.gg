"use client";

import ProfileGameCard from "@/app/dashboard/profile/ProfileGameCard";

export default function ProfileCarousel({ items }: { items: any[] }) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-3"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(135,86,241,0.3) transparent" }}
    >
      {items.map((game, i) => (
        <div key={i} className="flex-shrink-0">
          <ProfileGameCard game={game} />
        </div>
      ))}
    </div>
  );
}
