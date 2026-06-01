"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

// Behold.so JSON feed URL (https://feeds.behold.so/XXXXXXXX). Set via env, or
// the hardcoded fallback once the feed exists. Empty -> the component renders
// nothing, so it's safe to ship before the feed is connected.
const FEED = process.env.NEXT_PUBLIC_BEHOLD_FEED ?? "";

interface Post {
  permalink: string;
  thumb: string;
}

// Behold posts carry a `sizes` map and a `permalink`; be defensive about shape.
interface RawPost {
  permalink?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: Record<string, { mediaUrl?: string } | undefined>;
}

function pickThumb(p: RawPost): string {
  return (
    p.sizes?.small?.mediaUrl ??
    p.sizes?.medium?.mediaUrl ??
    p.sizes?.thumbnail?.mediaUrl ??
    p.thumbnailUrl ??
    p.mediaUrl ??
    ""
  );
}

export default function IgPreview() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!FEED) return;
    let cancelled = false;
    fetch(FEED)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("feed error"))))
      .then((data) => {
        const raw: RawPost[] = Array.isArray(data) ? data : (data?.posts ?? []);
        const mapped = raw
          .map((p) => ({ permalink: p.permalink ?? "", thumb: pickThumb(p) }))
          .filter((p) => p.permalink && p.thumb)
          .slice(0, 6);
        if (!cancelled) setPosts(mapped);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-mid">Latest from @gptwatchcollector</p>
      <div className="flex gap-2">
        {posts.map((p) => (
          <a
            key={p.permalink}
            href={p.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("ig_post_click")}
            className="block aspect-square flex-1 overflow-hidden rounded-md border border-border-gold/40 transition-transform duration-200 active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt="Instagram post" loading="lazy" className="h-full w-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
