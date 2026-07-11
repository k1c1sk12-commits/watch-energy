"use client";

import { useRouter } from "next/navigation";
import Smash from "@/components/Smash";

// Client mount for the standalone /smash route — "back" returns to the home
// screen (full navigation, since the game owns its own URL for SEO).
export default function SmashClient() {
  const router = useRouter();
  return <Smash onBack={() => router.push("/")} />;
}
