#!/bin/bash

# Script to apply India-only store configuration

echo "Applying India-only store configuration..."

# Copy current files to ensure we have them for later reference
mkdir -p original-files_backup
cp ../storefront/next.config.mjs original-files_backup/next.config.mjs.backup
cp ../storefront/components/global/header/index.tsx original-files_backup/header.tsx.backup
cp ../storefront/components/shared/localized-link.tsx original-files_backup/localized-link.tsx.backup
cp ../storefront/config.ts original-files_backup/config.ts.backup
echo "✅ Created backups of current files"

# Apply India-only store configuration
cat << 'EOF' > ../storefront/next.config.mjs
/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {hostname: "cdn.sanity.io"},
      {hostname: "munchies.medusajs.app"},
      {hostname: "tinloof-munchies.s3.eu-north-1.amazonaws.com"},
      {hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com"},
      {hostname: "s3.eu-central-1.amazonaws.com"},
      {hostname: "pub-b058bbb844bb4def9947d1a87d697d2c.r2.dev"},
    ],
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === "production",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    taint: true,
  },
  // Simplified rewrites for India-only store
  rewrites() {
    return [
      // Map root paths to India region
      {
        source: "/:path*",
        destination: "/in/:path*",
      }
    ];
  },
};

export default config;
EOF
echo "✅ Applied India-only next.config.mjs"

cat << 'EOF' > ../storefront/components/global/header/index.tsx
import type {Header} from "@/types/sanity.generated";

import Icon from "@/components/shared/icon";
import LocalizedLink from "@/components/shared/localized-link";
import {Suspense} from "react";

import Cart from "./cart";
import AnnouncementBar from "./parts/announcement-bar";
import BottomBorder from "./parts/bottom-border";
import HamburgerContainer from "./parts/hamburger/container";
import Navigation from "./parts/navigation";

export default function Header(props: {countryCode: string} & Header) {
  return (
    <header className="sticky top-0 z-50 flex w-full flex-col items-center bg-background">
      <AnnouncementBar {...props} />
      <div className="mx-auto flex w-full max-w-max-screen items-center justify-between gap-2xl px-m py-xs lg:px-xl">
        <div className="flex items-center gap-m">
          <div className="flex items-center justify-start gap-s">
            <HamburgerContainer sanityData={props} />
            <LocalizedLink href="/" prefetch>
              <img
                alt="Mubchies logo"
                className="my-[9px] h-[22px] w-fit lg:my-[10px] lg:h-9"
                src="/images/logo.svg"
              />
            </LocalizedLink>
          </div>
          <Suspense>
            <Navigation data={props} />
          </Suspense>
        </div>
        <div className="flex items-center gap-s">
          <Suspense
            fallback={
              <div className="relative h-10 w-10 p-2">
                <Icon name="Cart" />
              </div>
            }
          >
            <Cart
              cartAddons={props.cartAddons}
              countryCode={props.countryCode}
            />
          </Suspense>
        </div>
      </div>
      <div className="relative z-30 w-screen" id="navigation-portal" />

      <BottomBorder className="lg:hidden" />
    </header>
  );
}
EOF
echo "✅ Applied India-only header component"

cat << 'EOF' > ../storefront/components/shared/localized-link.tsx
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
EOF
echo "✅ Applied India-only localized-link component"

cat << 'EOF' > ../storefront/config.ts
const baseUrlWithoutProtocol =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_BRANCH_URL;

const baseUrl = baseUrlWithoutProtocol
  ? `https://${baseUrlWithoutProtocol}`
  : "http://localhost:3000";

const config = {
  backendUrl:
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000/store",
  baseUrl,
  defaultCountryCode: "in",
  sanity: {
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-27",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
    revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || "",
    studioUrl: "/cms",
    // Not exposed to the front-end, used solely by the server
    token: process.env.SANITY_API_TOKEN || "",
  },
  siteName: "Munchies",
};

export default config;
EOF
echo "✅ Applied India-only config with 'in' as default country"

echo ""
echo "All files have been switched to India-only configuration!"
echo "Please restart your Next.js server to apply the changes."
echo ""
echo "Remember to test that:"
echo "1. The country selector is hidden from the header"
echo "2. All URLs work without country code prefixes"
echo "3. Products appear with Indian prices" 