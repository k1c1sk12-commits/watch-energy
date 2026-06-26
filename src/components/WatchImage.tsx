"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_READY } from "@/lib/imageManifest";
import type { Watch } from "@/lib/types";
import WatchVisual from "./WatchVisual";

/**
 * Shows the AI illustration at /public/watches/<id>.png when one exists,
 * otherwise falls back to the generated SVG watch. Drop a PNG in and rebuild —
 * the manifest picks it up automatically.
 */
export default function WatchImage({
  watch,
  size,
  priority = true,
}: {
  watch: Watch;
  size: number;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!IMAGE_READY.has(watch.id) || failed) {
    return <WatchVisual watch={watch} size={size} />;
  }

  return (
    <Image
      src={`/watches/${watch.id}.png`}
      alt={`${watch.brand} ${watch.model}`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: "contain" }}
      unoptimized
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}
