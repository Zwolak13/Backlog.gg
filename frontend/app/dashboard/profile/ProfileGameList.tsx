"use client";

import ProfileCarousel from "@/components/ProfileCarousel/ProfileCarousel";
import TEST from "../../../mock/bg3.jpg";

export default function ProfileGameList() {
  const recentGames = [
    { title: "Elden Ring", cover: "/mock/eldenring.jpg", rating: 9 },
    { title: "Cyberpunk 2077", cover: "/mock/cyberpunk.jpg", rating: 8 },
    { title: "Hades", cover: "/mock/hades.jpg", rating: 10 },
    { title: "Baldur's Gate 3", cover: TEST, rating: 10 },
    { title: "Dark Souls III", cover: "/mock/ds3.jpg", rating: 9 },
  ];

  return (
    <div className="flex flex-col gap-12 w-full max-w-screen-xl mx-auto px-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">My Games</h2>
        <ProfileCarousel items={recentGames} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Favorite Titles</h2>
        <ProfileCarousel items={recentGames.slice(0, 3)} />
      </div>
    </div>
  );
}
