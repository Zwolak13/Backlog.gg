"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, ExternalLink, Flame, Gamepad2, Heart, Library, MessageSquare, Percent, RefreshCw, Sparkles, Star, Users } from "lucide-react";
import { getMe, ApiResponse, User } from "@/lib/api";
import { getPreferredCurrency } from "@/lib/preferences";

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

interface Deal {
  id: string;
  app_id: number;
  title: string;
  cover_image: string | null;
  current_price: string | null;
  original_price: string | null;
  discount_percent: number | null;
  source: string | null;
  deal_url: string;
}

interface SpotlightGame {
  game_id: number;
  name: string;
  background_image: string | null;
  portrait_image: string | null;
  metacritic: number | null;
  days_in_backlog: number;
  added_at: string;
}

interface SpotlightData {
  spotlight: SpotlightGame | null;
  backlog_count: number;
}

interface ActivityGame {
  id: number;
  slug: string;
  title: string;
  cover_image: string | null;
}

type ActivityType =
  | "rated_game"
  | "added_to_wishlist"
  | "added_to_favourites"
  | "added_to_library"
  | "wrote_review";

interface ActivityItem {
  id: string;
  username: string;
  avatar_url: string | null;
  type: ActivityType;
  timestamp: string;
  game: ActivityGame;
  extra: {
    rating?: number;
    status?: string;
  };
}

interface Recommendation {
  name: string;
  steam_appid: number;
  reason_tag: string;
  reason: string;
  description: string;
  background_image: string | null;
  slug: string | null;
}

const initialDeals: LoadState<Deal[]> = { data: [], loading: true, error: null };
const initialSpotlight: LoadState<SpotlightData> = { data: { spotlight: null, backlog_count: 0 }, loading: true, error: null };
const initialActivity: LoadState<ActivityItem[]> = { data: [], loading: true, error: null };
const initialRecommendations: LoadState<Recommendation[]> = { data: [], loading: true, error: null };

function useHorizontalDrag() {
  const ref = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;

    moved.current = false;
    const startX = event.clientX;
    const startScroll = element.scrollLeft;
    element.style.cursor = "grabbing";

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      if (Math.abs(dx) > 4) moved.current = true;
      element.scrollLeft = startScroll - dx;
    };

    const onPointerUp = () => {
      element.style.cursor = "grab";
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  return { ref, moved, onPointerDown };
}

function relativeTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const item of units) {
    if (Math.abs(seconds) >= item.seconds) {
      return formatter.format(Math.round(seconds / item.seconds), item.unit);
    }
  }
  return "just now";
}

function actionCopy(item: ActivityItem) {
  switch (item.type) {
    case "rated_game":
      return {
        icon: <Star size={14} fill="currentColor" />,
        label: "rated",
        meta: item.extra.rating != null ? `${item.extra.rating}/10` : null,
        color: "#fbbf24",
      };
    case "added_to_wishlist":
      return {
        icon: <Heart size={14} />,
        label: "wishlisted",
        meta: "wishlist",
        color: "#a78bfa",
      };
    case "added_to_favourites":
      return {
        icon: <Star size={14} fill="currentColor" />,
        label: "favourited",
        meta: item.extra.status ?? null,
        color: "#f59e0b",
      };
    case "added_to_library":
      return {
        icon: <Library size={14} />,
        label: "added",
        meta: item.extra.status ?? null,
        color: "#60a5fa",
      };
    case "wrote_review":
      return {
        icon: <MessageSquare size={14} />,
        label: "reviewed",
        meta: item.extra.rating != null ? `${item.extra.rating}/10` : null,
        color: "#c084fc",
      };
    default:
      return {
        icon: <Gamepad2 size={14} />,
        label: "updated",
        meta: item.extra.status ?? null,
        color: "#94a3b8",
      };
  }
}

function SectionHeader({
  title,
  subtitle,
  icon,
  meta,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
          style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)" }}
        >
          {icon}
        </span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
          {title}
        </h2>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
        {meta && <span className="text-xs text-white/20">{meta}</span>}
      </div>
      {subtitle && (
        <p className="ml-8 mt-1 text-xs text-white/26">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function DealsSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-3" style={{ width: "max-content" }}>
        {Array.from({ length: 16 }).map((_, index) => (
          <div key={index} className="flex-none rounded-xl bg-white/[0.06] animate-pulse" style={{ width: 274, height: 146 }} />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: "linear-gradient(to left, rgb(10,11,17), transparent)" }} />
    </div>
  );
}

function SpotlightSkeleton() {
  return (
    <div className="rounded-xl bg-white/[0.06] animate-pulse" style={{ height: 130 }} />
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-white/[0.07] animate-pulse shrink-0" />
        <div className="h-3.5 w-28 rounded bg-white/[0.07] animate-pulse" />
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)" }} />
      </div>
      <div className="ml-8 mt-2 h-2.5 w-56 max-w-[55%] rounded bg-white/[0.04] animate-pulse" />
    </div>
  );
}

function EmptyState({ title, text, compact = false }: { title: string; text: string; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 ${compact ? "py-10" : "py-14"}`}>
      <p className="text-white/55 font-semibold">{title}</p>
      <p className="text-white/28 text-sm mt-1 max-w-sm">{text}</p>
    </div>
  );
}

function ErrorState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={compact ? "p-3" : "px-5 py-6"}>
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(252,165,165,0.95)" }}>
        {message}
      </div>
    </div>
  );
}

function DealCard({ deal, dragging }: { deal: Deal; dragging?: React.MutableRefObject<boolean> }) {
  return (
    <a
      href={deal.deal_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        if (dragging?.current) event.preventDefault();
      }}
      className="group relative flex-none overflow-hidden rounded-xl block"
      draggable={false}
      style={{ width: 274, height: 146, background: "rgb(20,22,34)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {deal.cover_image ? (
        <Image
          src={deal.cover_image}
          alt={deal.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="274px"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(135,86,241,0.25), rgba(10,11,17,0.9))" }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5" />
      {deal.discount_percent != null && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black text-white" style={{ background: "rgba(239,68,68,0.9)" }}>
          <Percent size={10} />
          {deal.discount_percent}%
        </span>
      )}
      <div className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center text-white/70 bg-black/45 border border-white/10">
        <ExternalLink size={12} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-bold leading-tight line-clamp-1">{deal.title}</p>
        <div className="flex items-end justify-between gap-3 mt-2">
          <div className="min-w-0">
            <p className="text-lg font-black text-white leading-none" style={{ fontFamily: "var(--font-syne)" }}>
              {deal.current_price ?? "See deal"}
            </p>
            {deal.original_price && (
              <p className="text-white/35 text-[10px] line-through mt-0.5">{deal.original_price}</p>
            )}
          </div>
          {deal.source && (
            <span className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-white/50 bg-white/[0.07] border border-white/[0.08] truncate max-w-20">
              {deal.source}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function DealsSection({ state }: { state: LoadState<Deal[]> }) {
  const { ref, moved, onPointerDown } = useHorizontalDrag();
  const loopedDeals = useMemo(() => {
    if (state.data.length === 0) return [];
    return Array.from({ length: 4 }).flatMap(() => state.data);
  }, [state.data]);

  useEffect(() => {
    const element = ref.current;
    if (!element || state.data.length === 0) return;
    const singleSetWidth = element.scrollWidth / 4;
    element.scrollLeft = singleSetWidth;
  }, [ref, state.data]);

  const handleScroll = () => {
    const element = ref.current;
    if (!element || state.data.length === 0) return;

    const singleSetWidth = element.scrollWidth / 4;
    if (singleSetWidth <= 0) return;

    if (element.scrollLeft < singleSetWidth * 0.5) {
      element.scrollLeft += singleSetWidth;
    } else if (element.scrollLeft > singleSetWidth * 2.5) {
      element.scrollLeft -= singleSetWidth;
    }
  };

  return (
    <section>
      <SectionHeader
        title="Game Deals"
        subtitle="Discounted games worth checking before the backlog grows again"
        icon={<Flame size={13} />}
        meta={state.loading ? "Loading" : `${state.data.length}`}
      />
      {state.loading ? <DealsSkeleton /> : null}
      {!state.loading && state.error ? <SectionCard><ErrorState message={state.error} compact /></SectionCard> : null}
      {!state.loading && !state.error && state.data.length === 0 ? (
        <SectionCard><EmptyState compact title="No deals found" text="The deals source did not return discounted games right now. Try again later." /></SectionCard>
      ) : null}
      {!state.loading && !state.error && state.data.length > 0 ? (
        <div className="relative">
          <div
            ref={ref}
            className="flex gap-3 overflow-x-auto select-none [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", cursor: "grab", WebkitUserSelect: "none" }}
            onPointerDown={onPointerDown}
            onScroll={handleScroll}
          >
            {loopedDeals.map((deal, index) => (
              <DealCard key={`${deal.id}-${index}`} deal={deal} dragging={moved} />
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none" style={{ background: "linear-gradient(to right, rgb(10,11,17), transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: "linear-gradient(to left, rgb(10,11,17), transparent)" }} />
        </div>
      ) : null}
    </section>
  );
}

function daysLabel(days: number) {
  if (days === 0) return "Added today";
  if (days === 1) return "Waiting 1 day";
  if (days < 30) return `Waiting ${days} days`;
  if (days < 60) return "Waiting about a month";
  const months = Math.floor(days / 30);
  return `Waiting ${months} months`;
}

function BacklogSpotlight({
  state,
  onPickAnother,
  shuffling,
}: {
  state: LoadState<SpotlightData>;
  onPickAnother: (excludeId: number) => void;
  shuffling: boolean;
}) {
  const { spotlight, backlog_count } = state.data;

  return (
    <section className="shrink-0">
      <SectionHeader
        title="Backlog Spotlight"
        subtitle="One game from your backlog, waiting for its moment"
        icon={<Clock size={13} />}
        meta={backlog_count > 0 ? `${backlog_count} waiting` : undefined}
      />

      {state.loading ? <SpotlightSkeleton /> : null}

      {!state.loading && state.error ? (
        <SectionCard><ErrorState message={state.error} compact /></SectionCard>
      ) : null}

      {!state.loading && !state.error && !spotlight ? (
        <SectionCard>
          <EmptyState compact title="Your backlog is empty" text="Add games to your backlog and we'll spotlight one here to remind you to play it." />
        </SectionCard>
      ) : null}

      {!state.loading && !state.error && spotlight ? (
        <div
          className="relative overflow-hidden rounded-xl flex items-stretch"
          style={{
            background: "rgb(13,14,22)",
            border: "1px solid rgba(255,255,255,0.07)",
            minHeight: 130,
          }}
        >
          {spotlight.background_image && (
            <div className="absolute inset-0">
              <Image
                src={spotlight.background_image}
                alt=""
                fill
                className="object-cover object-center opacity-[0.07]"
                sizes="100vw"
                unoptimized
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,14,22,0.2), rgb(13,14,22))" }} />
            </div>
          )}

          <div className="relative z-10 flex items-stretch w-full gap-5 p-4">
            <div
              className="relative shrink-0 rounded-lg overflow-hidden self-stretch"
              style={{ width: 70, minHeight: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {spotlight.portrait_image ? (
                <Image
                  src={spotlight.portrait_image}
                  alt={spotlight.name}
                  fill
                  className="object-cover"
                  sizes="70px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 size={22} className="text-white/20" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.2)" }}
                  >
                    <Clock size={9} />
                    {daysLabel(spotlight.days_in_backlog)}
                  </span>
                  {backlog_count > 1 && (
                    <span className="text-[11px] text-white/25">
                      +{backlog_count - 1} more in backlog
                    </span>
                  )}
                </div>
                <p className="text-white font-bold text-base leading-tight truncate" style={{ fontFamily: "var(--font-syne)" }}>
                  {spotlight.name}
                </p>
                {spotlight.metacritic && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Metacritic: <span className="text-white/60 font-semibold">{spotlight.metacritic}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Link
                  href={`/dashboard/games/${spotlight.game_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: "rgba(135,86,241,0.2)", color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.28)" }}
                >
                  Open Game
                  <ChevronRight size={12} />
                </Link>
                <button
                  onClick={() => onPickAnother(spotlight.game_id)}
                  disabled={shuffling || backlog_count <= 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <RefreshCw size={11} className={shuffling ? "animate-spin" : ""} />
                  Pick Another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RecommendationSkeleton() {
  return (
    <section className="h-full min-h-0 flex flex-col">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-h-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white/[0.06] animate-pulse min-h-0" />
        ))}
      </div>
    </section>
  );
}

const REC_TONES = [
  "rgba(96,165,250,0.28)",
  "rgba(167,139,250,0.28)",
  "rgba(52,211,153,0.22)",
];

function RecommendationCard({ rec, tone }: { rec: Recommendation; tone: string }) {
  const inner = (
    <div
      className="relative overflow-hidden rounded-xl min-h-0 h-full"
      style={{ background: "rgb(20,22,34)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 20%, ${tone}, transparent 58%)` }} />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(135deg, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="mb-3 h-36 rounded-lg overflow-hidden relative bg-black/20">
          {rec.background_image ? (
            <Image src={rec.background_image} alt={rec.name} fill className="object-cover object-top" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-white/10">
              <Gamepad2 size={28} className="text-white/18" />
            </div>
          )}
        </div>
        <p className="text-white/80 text-sm font-semibold leading-tight">{rec.name}</p>
        <p className="text-white/35 text-xs mt-1 leading-relaxed line-clamp-2">{rec.reason}</p>
      </div>
      <span
        className="absolute top-3 left-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "rgba(255,255,255,0.42)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {rec.reason_tag}
      </span>
    </div>
  );

  if (rec.steam_appid > 0) {
    return (
      <Link href={`/dashboard/games/${rec.steam_appid}`} className="block min-h-0 hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }
  return <div className="min-h-0">{inner}</div>;
}

function RecommendationSection({ state }: { state: LoadState<Recommendation[]> }) {
  if (state.loading) return <RecommendationSkeleton />;

  return (
    <section className="h-full min-h-0 flex flex-col">
      <SectionHeader
        title="Recommended for You"
        subtitle="Personalised picks based on your library"
        icon={<Sparkles size={13} />}
      />
      {state.error ? (
        <ErrorState message={state.error} compact />
      ) : state.data.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          text="Add some games to your library to get personalised AI picks."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-h-0">
          {state.data.map((rec, i) => (
            <RecommendationCard key={rec.name} rec={rec} tone={REC_TONES[i % REC_TONES.length]} />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivitySkeleton({ full = false }: { full?: boolean }) {
  return (
    <div className="h-full grid grid-rows-3 gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`${full ? "min-h-[78px]" : "min-h-[72px]"} rounded-xl bg-white/[0.06] animate-pulse`} />
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const action = actionCopy(item);

  return (
    <div className="flex h-full min-h-0 items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Link href={`/dashboard/profile/${item.username}`} className="shrink-0">
        <img
          src={item.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.username)}`}
          alt={item.username}
          className="w-9 h-9 rounded-lg object-cover"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/72 leading-relaxed line-clamp-2">
          <Link href={`/dashboard/profile/${item.username}`} className="font-bold text-white hover:text-[var(--backlog-purple)] transition-colors">
            {item.username}
          </Link>{" "}
          <span>{action.label}</span>{" "}
          <Link href={`/dashboard/games/${item.game.id}`} className="font-semibold text-white/90 hover:text-[var(--backlog-purple)] transition-colors">
            {item.game.title}
          </Link>
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/28">
          <span>{relativeTime(item.timestamp)}</span>
          {action.meta && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="capitalize">{action.meta}</span>
            </>
          )}
        </div>
      </div>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ color: action.color, background: `${action.color}14`, border: `1px solid ${action.color}30` }}
      >
        {action.icon}
      </div>
    </div>
  );
}

function ActivitySection({ state, loading }: { state: LoadState<ActivityItem[]>; loading: boolean }) {
  return (
    <section className="h-full min-h-0 flex flex-col">
      {loading ? (
        <SectionHeaderSkeleton />
      ) : (
        <SectionHeader
          title="Friends Activity"
          subtitle="Recent ratings and library moves"
          icon={<Users size={13} />}
          meta={state.loading ? "Loading" : `${state.data.length}`}
        />
      )}
      <div className="flex-1 min-h-0">
        {loading ? <ActivitySkeleton full /> : null}
        {!loading && state.loading ? <ActivitySkeleton /> : null}
        {!loading && !state.loading && state.error ? <ErrorState message={state.error} compact /> : null}
        {!loading && !state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState compact title="No friends activity yet" text="Add friends or wait for them to update their libraries, then their activity will appear here." />
        ) : null}
        {!loading && !state.loading && !state.error && state.data.length > 0 ? (
          <div className="h-full grid grid-rows-3 gap-3">
            {state.data.map((item) => <ActivityRow key={item.id} item={item} />)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<LoadState<Deal[]>>(initialDeals);
  const [spotlight, setSpotlight] = useState<LoadState<SpotlightData>>(initialSpotlight);
  const [spotlightShuffling, setSpotlightShuffling] = useState(false);
  const [activity, setActivity] = useState<LoadState<ActivityItem[]>>(initialActivity);
  const [recommendations, setRecommendations] = useState<LoadState<Recommendation[]>>(initialRecommendations);
  const [currency] = useState(() => getPreferredCurrency());
  const gameContentLoading = deals.loading || spotlight.loading;

  useEffect(() => {
    let alive = true;

    getMe().then((data: ApiResponse<User>) => {
      if (alive && data.user) setUser(data.user);
    });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/dashboard/deals?${new URLSearchParams({ limit: "8", currency })}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { deals?: Deal[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load deals");
        setDeals({ data: payload.deals ?? [], loading: false, error: payload.error ?? null });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setDeals({ data: [], loading: false, error: error.message });
        }
      });

    return () => controller.abort();
  }, [currency]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard/spotlight", { signal: controller.signal })
      .then(async (res) => {
        const payload = await res.json() as { spotlight?: SpotlightGame | null; backlog_count?: number; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Unable to load spotlight");
        setSpotlight({ data: { spotlight: payload.spotlight ?? null, backlog_count: payload.backlog_count ?? 0 }, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setSpotlight({ data: { spotlight: null, backlog_count: 0 }, loading: false, error: error.message });
        }
      });
    return () => controller.abort();
  }, []);

  const handlePickAnother = async (excludeId: number) => {
    setSpotlightShuffling(true);
    try {
      const res = await fetch(`/api/dashboard/spotlight?exclude=${excludeId}`);
      const payload = await res.json() as { spotlight?: SpotlightGame | null; backlog_count?: number };
      setSpotlight({ data: { spotlight: payload.spotlight ?? null, backlog_count: payload.backlog_count ?? 0 }, loading: false, error: null });
    } finally {
      setSpotlightShuffling(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/dashboard/activity?limit=3", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { activity?: ActivityItem[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load friends activity");
        setActivity({ data: payload.activity ?? [], loading: false, error: payload.error ?? null });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setActivity({ data: [], loading: false, error: error.message });
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/games/recommendations/", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { recommendations?: Recommendation[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load recommendations");
        setRecommendations({ data: payload.recommendations ?? [], loading: false, error: null });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setRecommendations({ data: [], loading: false, error: error.message });
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="relative h-screen text-white overflow-y-auto xl:overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[780px] h-[520px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(135,86,241,0.12) 0%, transparent 64%)", filter: "blur(36px)" }} />
        <div className="absolute top-48 -right-40 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 62%)", filter: "blur(42px)" }} />
      </div>

      <div className="relative z-10 h-full px-6 md:px-10 py-5 flex flex-col min-h-0">
        <header className="mb-4 shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--backlog-purple)" }}>
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.15] mt-1 pb-1" style={{ fontFamily: "var(--font-syne)" }}>
            Welcome back{user?.username ? `, ${user.username}` : ""}.
          </h1>
          <p className="text-white/35 text-sm mt-1 max-w-xl">
            Fresh discounts up top, friend signals below. Dangerous combination for a backlog, frankly.
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DealsSection state={deals} />
          <div className="grid min-h-[240px] flex-1 grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(340px,1.35fr)] gap-5 items-stretch">
            <RecommendationSection state={recommendations} />
            <ActivitySection state={activity} loading={gameContentLoading} />
          </div>
          <BacklogSpotlight state={spotlight} onPickAnother={handlePickAnother} shuffling={spotlightShuffling} />
        </div>
      </div>
    </div>
  );
}
