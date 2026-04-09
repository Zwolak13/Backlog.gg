"use client";

import { use, useState, useEffect } from "react";
import { getGameDetails, addToLibrary } from "@/lib/api";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toast";

const STATUS_OPTIONS = ["playing", "completed", "backlog", "wishlist"] as const;

export default function GameDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: appid } = use(params);

  const [game, setGame] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("backlog");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getGameDetails(appid);
      setGame(data);
    };
    load();
  }, [appid]);

  const handleAdd = async () => {
    if (!game) return;
    setAdding(true);
    const result = await addToLibrary(game.id, selectedStatus);
    if (result.error) {
      toastError(result.error);
    } else {
      toastSuccess(`Added to ${selectedStatus}!`);
    }
    setAdding(false);
  };

  if (!game) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="p-6 md:p-10 text-white max-w-5xl mx-auto">
      <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8">
        {game.background_image && (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{game.name}</h1>
          {game.released && (
            <p className="text-white/60 text-sm mt-1">{game.released}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 capitalize focus:outline-none focus:border-[var(--backlog-purple)]/50"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-[rgb(20,20,35)] capitalize">
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="px-5 py-2 rounded-lg bg-[var(--backlog-purple)] hover:bg-[var(--backlog-indigo)] text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add to Library"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {game.metacritic && (
          <Stat label="Metacritic" value={game.metacritic} />
        )}
        {game.price && (
          <Stat label="Price" value={game.price} />
        )}
        {game.developers?.[0] && (
          <Stat label="Developer" value={game.developers[0]} />
        )}
        {game.publishers?.[0] && (
          <Stat label="Publisher" value={game.publishers[0]} />
        )}
      </div>

      {game.description_raw && (
        <p className="text-white/70 leading-relaxed mb-8">{game.description_raw}</p>
      )}

      {game.genres?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {game.genres.map((g: any) => (
              <span key={g.id} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/70">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {game.platforms?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Platforms</h2>
          <div className="flex flex-wrap gap-2">
            {game.platforms.map((p: any, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/70">
                {p.platform?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {game.screenshots?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Screenshots</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {game.screenshots.map((url: string, i: number) => (
              <div key={i} className="relative h-40 rounded-lg overflow-hidden">
                <Image src={url} alt={`Screenshot ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-medium text-sm">{value}</p>
    </div>
  );
}
