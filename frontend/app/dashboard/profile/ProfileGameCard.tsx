export default function ProfileGameCard({ game }: any) {
  return (
    <div
      className="
        relative group
        w-[240px] h-72
        rounded-xl overflow-hidden
        bg-white/5 border border-white/10 
        backdrop-blur-xl
        shadow-[0_0_20px_-5px_var(--backlog-purple)]
        hover:shadow-[0_0_30px_-5px_var(--backlog-purple)]
        transition-all duration-300
        cursor-pointer
      "
    >
      <img
        src={game.cover}
        className="
          w-full h-full object-cover 
          group-hover:scale-105 transition duration-500
        "
      />

      <div
        className="
          absolute inset-0 
          bg-gradient-to-b 
          from-[rgba(0,0,0,0.55)] 
          via-transparent 
          to-transparent
        "
      />

      <div
        className="
          absolute inset-0 
          bg-gradient-to-t 
          from-[rgba(0,0,0,0.85)] 
          via-[rgba(0,0,0,0.4)] 
          to-transparent
        "
      />

      <div
        className="
          absolute top-3 right-3 
          px-3 py-1 rounded-full 
          bg-[var(--backlog-purple)]/70 
          backdrop-blur-md border border-white/20
          flex items-center gap-1
          text-white text-sm font-semibold
          shadow-[0_0_10px_var(--backlog-purple)]
          group-hover:bg-[var(--backlog-purple)]
          transition
        "
      >
        ★ {game.rating ?? "—"}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-md">
          {game.title}
        </h3>
      </div>
    </div>
  );
}
