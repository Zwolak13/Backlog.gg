export default function GameSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="w-full h-60 bg-white/[0.06] animate-pulse" />
      <div className="px-1 pt-3 pb-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}
