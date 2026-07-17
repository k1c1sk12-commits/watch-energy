"use client";

import { useRouter } from "next/navigation";
import BoneEater from "@/components/BoneEater";
import { useLang } from "@/lib/i18n";

export default function BoneClient() {
  const router = useRouter();
  const { lang } = useLang();
  // key={lang}: the imperative engine re-mounts with the new dictionary while
  // game progress survives via its own save.
  return <BoneEater key={lang} lang={lang} onBack={() => router.push("/")} />;
}
