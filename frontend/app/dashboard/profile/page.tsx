"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileGameList from "./ProfileGameList";
import ProfileLibrary from "./ProfileLibrary";
import FriendsPanel from "./FriendsPanel";
import ProfileStats from "./ProfileStats";
import ProfileActivity from "./ProfileActivity";

type Tab = "Games" | "Activity" | "Library";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Games");

  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden flex flex-col text-white" style={{ background: "rgb(10,11,17)" }}>
      <ProfileHeader activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />

      <div className="flex flex-col lg:flex-row gap-4 px-8 md:px-12 py-4 w-full lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="flex-1 min-w-0 lg:min-h-0 lg:overflow-hidden">
          {activeTab === "Games"    && <ProfileGameList />}
          {activeTab === "Library"  && <ProfileLibrary />}
          {activeTab === "Activity" && <ProfileActivity />}
        </div>

        <div className="w-full lg:w-60 shrink-0 flex flex-col gap-3 lg:h-full lg:min-h-0">
          <ProfileStats />
          <FriendsPanel />
        </div>
      </div>
    </div>
  );
}
