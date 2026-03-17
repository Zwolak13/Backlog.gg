export default function FullscreenLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--backlog-purple)] border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
