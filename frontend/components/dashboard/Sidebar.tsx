"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, User, LogOut, Menu, X, Gamepad2 } from "lucide-react";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const menu = [
    { name: "Home", icon: <Home size={22} />, href: "/dashboard" },
    { name: "Games", icon: <Gamepad2 size={22} />, href: "/dashboard/games" },
    { name: "Profile", icon: <User size={22} />, href: "/dashboard/profile" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-[rgba(20,20,35,0.55)] backdrop-blur-xl border border-white/10 text-white"
      >
        <Menu size={22} />
      </button>

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
          fixed top-0 left-0 z-50
          h-screen
          flex-col justify-between
          ${expanded ? "w-60" : "w-20"}
          transition-all duration-300 
          border-r border-white/10 
          backdrop-blur-2xl 
          overflow-hidden
          bg-[rgba(20,20,35,0.55)]
          hidden md:flex
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--backlog-purple)]/20 to-transparent pointer-events-none z-0" />

        <div className="flex flex-col gap-2 p-4 z-10">
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

        <div className="p-4 z-10">
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

      <div
        className={`
          fixed inset-0 z-50 bg-[rgba(10,10,20,0.9)] backdrop-blur-xl md:hidden
          transform transition-transform duration-300
          ${mobileOpen ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-white"
          >
            <X size={28} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 mt-10 px-6">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-white text-2xl font-semibold flex items-center gap-4"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="text-red-400 text-2xl font-semibold flex items-center gap-4"
          >
            <LogOut size={26} />
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}
