import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileGameList from "./ProfileGameList";

export default function ProfilePage() {
  return (
    <div className="w-full min-h-screen flex flex-col gap-10 overflow-hidden">
      <ProfileHeader />

      <div
        className="
          w-full max-w-100vw 
          mx-auto
          px-6 pb-20 
          flex flex-col-reverse lg:flex-row 
          gap-12 lg:gap-2
          overflow-hidden
        "
      >
        <div className="flex-1 flex flex-col gap-10 overflow-hidden">
          <ProfileGameList />
        </div>

        <div className="w-full lg:w-80 shrink-0 overflow-hidden">
          <ProfileStats />
        </div>
      </div>
    </div>
  );
}

