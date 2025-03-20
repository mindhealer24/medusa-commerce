"use client";
import type { ComponentProps } from "react";

import Link from "next/link";

// Simplified LocalizedLink for India-only store
export default function LocalizedLink({
  href,
  ...passThroughProps
}: ComponentProps<typeof Link>) {
  // For an India-only store, just pass through the href without modification
  return <Link href={href} {...passThroughProps} />;
}
