import type { Metadata } from "next";

import { ProfileView } from "@/features/identity/components/profile-view";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
};

export default function ProfilePage() {
  return <ProfileView />;
}
