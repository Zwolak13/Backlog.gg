export default function ProfileStats() {
  const stats = [
    { label: "Completed", value: 42 },
    { label: "In Progress", value: 7 },
    { label: "Favorites", value: 12 },
    { label: "Abandoned", value: 5 },
  ];

  return (
    <div
      className="
        w-full p-6 rounded-xl
        bg-[rgba(20,20,35,0.45)]
        border border-white/10 
        backdrop-blur-2xl
        shadow-[0_0_25px_-5px_var(--backlog-purple)]
        flex flex-col gap-5
      "
    >
      <h2 className="text-xl font-semibold text-white/90 tracking-wide">
        Stats
      </h2>

      <div className="flex flex-col gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="
              flex justify-between items-center
              px-4 py-2.5
              rounded-lg
              bg-white/5 hover:bg-white/10
              border border-white/10
              transition-all
            "
          >
            <span className="text-white/70 text-sm">{s.label}</span>
            <span className="font-bold text-white text-lg">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
