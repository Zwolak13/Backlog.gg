"use client";

import { useState } from "react";
import ProfileSettingsModal from "@/components/ProfileSettings/ProfileSettingsModal";
import { Edit3 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileHeader() {
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ProfileSettingsModal onClose={() => setOpen(false)} />}

      <div
        className="
          relative
          w-full
          bg-gradient-to-r from-[var(--backlog-purple)]/40 to-[var(--backlog-indigo)]/40
          backdrop-blur-xl border-b border-white/10
          shadow-[0_0_40px_-10px_var(--backlog-purple)]
          flex flex-col md:flex-row
          items-center md:items-center
          px-6 md:px-10
          pt-10 pb-8 md:pt-12 md:pb-10
          gap-6 md:gap-10
        "
      >
        {/* EDIT BUTTON (desktop) */}
        <button
          onClick={() => setOpen(true)}
          className="
            hidden md:flex
            absolute top-6 right-6
            p-2 rounded-lg
            bg-white/5 hover:bg-white/10
            border border-white/10
            transition-all
            text-white/70 hover:text-white
          "
        >
          <Edit3 size={20} />
        </button>

        {/* AVATAR */}
        <img
          src={profile?.avatar_url || "/default-avatar.png"}
          className="
            w-24 h-24 md:w-32 md:h-32 rounded-full object-cover
            border-4 border-white/20
            shadow-[0_0_25px_var(--backlog-purple)]
          "
        />

        {/* USERNAME + BIO */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
              {profile?.username || "Loading..."}
            </h1>

            {/* EDIT BUTTON (mobile) */}
            <button
              onClick={() => setOpen(true)}
              className="
                md:hidden
                p-1.5 rounded-md
                bg-white/5 hover:bg-white/10
                border border-white/10
                transition-all
                text-white/50 hover:text-white/80
                flex items-center justify-center
              "
            >
              <Edit3 size={16} />
            </button>
          </div>

          <p className="text-white/70 max-w-xl text-sm md:text-base leading-relaxed">
            {profile?.bio || "This user has no bio yet."}
          </p>
        </div>
      </div>
    </>
  );
}
