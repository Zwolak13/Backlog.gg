"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import ProfileGameList from "./ProfileGameList";
import ProfileLibrary from "./ProfileLibrary";
import FriendsPanel from "./FriendsPanel";
import ProfileStats from "./ProfileStats";
import ProfileActivity from "./ProfileActivity";
import { useProfile } from "@/hooks/useProfile";

type Tab = "Games" | "Activity" | "Library";

interface ProfileViewProps {
  username?: string;
}

export default function ProfileView({ username }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Games");
  const { profile, loading, notFound } = useProfile(username);
  const isOwnProfile = !username;

  if (username && !loading && notFound) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 text-white"
        style={{ background: "rgb(10,11,17)" }}
      >
        <p className="text-sm text-white/50">User not found.</p>
        <Link href="/dashboard/profile" className="text-sm text-[var(--backlog-purple)] hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen lg:h-screen lg:overflow-hidden flex flex-col text-white"
      style={{ background: "rgb(10,11,17)" }}
    >
      <ProfileHeader
        activeTab={activeTab}
        isOwnProfile={isOwnProfile}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        profile={profile}
        profileLoading={loading}
        username={username}
      />

      <div className="flex flex-col lg:flex-row gap-4 px-8 md:px-12 py-4 w-full lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="flex-1 min-w-0 lg:min-h-0 lg:overflow-hidden">
          {activeTab === "Games" && <ProfileGameList username={username} />}
          {activeTab === "Library" && <ProfileLibrary isOwnProfile={isOwnProfile} username={username} />}
          {activeTab === "Activity" && <ProfileActivity username={username} />}
        </div>

        <div className="w-full lg:w-60 shrink-0 flex flex-col gap-3 lg:h-full lg:min-h-0">
          <ProfileStats username={username} />
          <FriendsPanel isOwnProfile={isOwnProfile} username={username} />
        </div>
      </div>
    </div>
  );
}
