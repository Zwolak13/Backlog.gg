"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileGameList from "./ProfileGameList";
import ProfileLibrary from "./ProfileLibrary";
import FriendsPanel from "./FriendsPanel";
import ProfileStats from "./ProfileStats";
import { Clock4 } from "lucide-react";

type Tab = "Games" | "Activity" | "Library";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Games");

  return (
    <div className="w-full min-h-screen">
      <ProfileHeader activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />

      <div className="flex flex-col lg:flex-row gap-6 px-6 md:px-10 py-8 w-full mx-auto">
        <div className="flex-1 min-w-0">
          {activeTab === "Games" && <ProfileGameList />}

          {activeTab === "Activity" && (
            <EmptyTab
              icon={<Clock4 size={36} className="text-white/20" />}
              title="No activity yet"
              sub="Your recent game sessions will appear here."
            />
          )}

          {activeTab === "Library" && <ProfileLibrary />}
        </div>

        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <ProfileStats />
          <FriendsPanel />
        </div>
      </div>
    </div>
  );
}

function EmptyTab({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      {icon}
      <p className="text-white/40 font-medium">{title}</p>
      <p className="text-white/25 text-sm max-w-xs">{sub}</p>
    </div>
  );
}
