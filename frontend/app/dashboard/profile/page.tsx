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
    <div className="w-full min-h-screen text-white" style={{ background: "rgb(10,11,17)" }}>
      <ProfileHeader activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />

      <div className="flex flex-col lg:flex-row gap-6 px-8 md:px-12 py-8 w-full">
        <div className="flex-1 min-w-0">
          {activeTab === "Games"    && <ProfileGameList />}
          {activeTab === "Library"  && <ProfileLibrary />}
          {activeTab === "Activity" && (
            <div
              className="flex flex-col items-center justify-center py-28 gap-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(135,86,241,0.1)", border: "1px solid rgba(135,86,241,0.2)" }}
              >
                <Clock4 size={26} style={{ color: "var(--backlog-purple)" }} />
              </div>
              <div className="text-center">
                <p className="text-white/50 font-semibold mb-1">No activity yet</p>
                <p className="text-white/25 text-sm max-w-xs">
                  Your recent game sessions will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <ProfileStats />
          <FriendsPanel />
        </div>
      </div>
    </div>
  );
}
