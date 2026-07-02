"use client";

import { useRouter } from "next/navigation";
import Quiz from "@/components/Quiz";

// Client mount for the standalone /quiz route — "back" returns to the home
// screen (full navigation, since the quiz now owns its own URL for SEO).
export default function QuizClient() {
  const router = useRouter();
  return <Quiz onBack={() => router.push("/")} />;
}
