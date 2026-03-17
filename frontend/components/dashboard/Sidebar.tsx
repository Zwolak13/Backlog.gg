"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, User, Settings, LogOut } from "lucide-react";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const menu = [
    { name: "Home", icon: <Home size={22} />, href: "/dashboard" },
    { name: "Profile", icon: <User size={22} />, href: "/dashboard/profile" },
    { name: "Settings", icon: <Settings size={22} />, href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`
        group h-screen 
        ${expanded ? "w-60" : "w-20"}
        transition-all duration-300 
        border-r border-white/10 
        backdrop-blur-2xl 
        relative overflow-hidden
        bg-[rgba(20,20,35,0.55)]
      `}
    >
      {/* Gradient glow tła */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--backlog-purple)]/20 to-transparent pointer-events-none" />

      {/* Górna część */}
      <div className="flex flex-col gap-2 p-4 relative z-10">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="
              flex items-center gap-4 
              text-white/80 hover:text-white 
              p-3 rounded-xl 
              hover:bg-white/10 
              transition-all duration-200
            "
          >
            <div
              className="min-w-[22px] flex justify-center"
              style={{ filter: "drop-shadow(0 0 6px var(--backlog-purple))" }}
            >
              {item.icon}
            </div>

            <span
              className={`
                text-sm font-medium whitespace-nowrap 
                transition-all duration-300 origin-left
                ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-90"}
              `}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 relative z-10">
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-4 w-full 
            text-red-400 hover:text-red-300 
            p-3 rounded-xl 
            hover:bg-red-500/10 
            transition-all duration-200
          "
        >
          <div
            className="min-w-[22px] flex justify-center"
            style={{ filter: "drop-shadow(0 0 6px var(--backlog-pink))" }}
          >
            <LogOut size={22} />
          </div>

          <span
            className={`
              text-sm font-medium whitespace-nowrap 
              transition-all duration-300 origin-left
              ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            `}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
