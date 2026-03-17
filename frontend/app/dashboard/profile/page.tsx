import ProfileHeader from "./ProfileHeader";
import ProfileAvatar from "./ProfileAvatar";
import ProfileDetails from "./ProfileDetails";
import ProfileDangerZone from "./ProfileDangerZone";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      <ProfileHeader />
      <ProfileAvatar />
      <ProfileDetails />
      <ProfileDangerZone />
    </div>
  );
}
