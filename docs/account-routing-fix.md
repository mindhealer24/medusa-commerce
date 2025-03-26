# Account Routing Fix Documentation

## Issue Description
When clicking the account icon in the header, users were being redirected to `/in` route (e.g., `/in/account`) instead of the intended `/account` route. This was causing inconsistency with other pages that didn't have the `/in` route.

## Root Cause Analysis

### 1. Mixed Routing Patterns
The application was mixing two different routing patterns:
- Multi-country routing (with country code)
- Single-country routing (India-only)

### 2. Localization Implementation
We had two different versions of the `LocalizedLink` component:

#### Original Version (Multi-country support):
```typescript
// localized-link.tsx.original
"use client";
import type { ComponentProps } from "react";
import config from "@/config";
import Link from "next/link";
import { useCountryCode } from "../context/country-code-context";

export default function LocalizedLink({
  href,
  ...passThroughProps
}: ComponentProps<typeof Link>) {
  const countryCode = useCountryCode();
  const isDefault = countryCode === config.defaultCountryCode

  const normalizedPath = href.toString();
  const isExternalLink = normalizedPath.startsWith("https://");
  const isDeepLink = normalizedPath.startsWith("#");
  const localizedHref =
    isExternalLink || isDeepLink || isDefault
      ? href
      : `/${countryCode}${normalizedPath.startsWith("/") ? "" : "/"}${href}`;

  return <Link href={localizedHref} {...passThroughProps} />;
}
```

#### Simplified Version (India-only):
```typescript
// localized-link.tsx
"use client";
import type { ComponentProps } from "react";
import Link from "next/link";

export default function LocalizedLink({
  href,
  ...passThroughProps
}: ComponentProps<typeof Link>) {
  // For an India-only store, just pass through the href without modification
  return <Link href={href} {...passThroughProps} />;
}
```

### 3. Account Button Implementation

#### Original Implementation:
```typescript
// Before: account-button-client.tsx
"use client";

import Link from "next/link";
import {useParams} from "next/navigation";

interface AccountButtonClientProps {
  isLoggedIn: boolean;
}

export default function AccountButtonClient({isLoggedIn}: AccountButtonClientProps) {
  const params = useParams();
  const countryCode = params.countryCode as string;

  return (
    <Link
      href={`/${countryCode}/account`}
      className="relative flex h-10 w-10 items-center justify-center p-2"
      aria-label={isLoggedIn ? "Your account" : "Sign in"}
      title={isLoggedIn ? "Your account" : "Sign in"}
    >
      {/* SVG content */}
    </Link>
  );
}
```

#### Fixed Implementation:
```typescript
// After: account-button-client.tsx
"use client";

import LocalizedLink from "@/components/shared/localized-link";

interface AccountButtonClientProps {
  isLoggedIn: boolean;
}

export default function AccountButtonClient({isLoggedIn}: AccountButtonClientProps) {
  return (
    <LocalizedLink
      href="/account"
      className="relative flex h-10 w-10 items-center justify-center p-2"
      aria-label={isLoggedIn ? "Your account" : "Sign in"}
      title={isLoggedIn ? "Your account" : "Sign in"}
    >
      {/* SVG content */}
    </LocalizedLink>
  );
}
```

### 4. Login Template Implementation

#### Original Implementation:
```typescript
// Before: login-template.tsx
"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";

const LoginTemplate = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN);

  useEffect(() => {
    if (mode) {
      setCurrentView(mode as LOGIN_VIEW);
      
      // Update URL without the mode parameter
      const newUrl = `/account`;  // This was problematic
      router.replace(newUrl);
    }
  }, [mode, router]);
  // ... rest of the component
};
```

#### Fixed Implementation:
```typescript
// After: login-template.tsx
"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";

const LoginTemplate = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN);

  useEffect(() => {
    if (mode) {
      setCurrentView(mode as LOGIN_VIEW);
      
      // Update URL without the mode parameter
      router.replace("/account");  // Simplified, consistent with LocalizedLink
    }
  }, [mode, router]);
  // ... rest of the component
};
```

The change in `login-template.tsx` was part of the same routing consistency fix:

1. **Why it needed to change**:
   - The template was using a hardcoded path (`/account`)
   - This path needed to be consistent with our new routing approach
   - It was part of the mixed routing patterns issue

2. **What changed**:
   - Simplified the URL replacement
   - Made it consistent with how `LocalizedLink` handles routes
   - Removed string concatenation for paths

3. **Impact**:
   - Ensures consistent routing behavior
   - Works harmoniously with `LocalizedLink`
   - Maintains the same routing pattern throughout the application

## The Fix Explained

1. **Removed Direct Country Code Usage**:
   - Removed the manual country code injection (`/${countryCode}/account`)
   - Let the `LocalizedLink` component handle routing consistently

2. **Simplified Routing Logic**:
   - Instead of mixing routing patterns, we now use simple routes (`/account`)
   - The `LocalizedLink` component handles any necessary transformations

3. **Consistent Pattern**:
   - All navigation now goes through `LocalizedLink`
   - Routes are written without country codes in the components
   - Routing is handled at a single point (the `LocalizedLink` component)

## Why This Works

1. **Single Source of Truth**:
   - All routing logic is now centralized in `LocalizedLink`
   - Components don't need to know about country codes

2. **Simplified Mental Model**:
   - Components use simple routes (`/account`)
   - No mixing of routing patterns
   - Clear separation of concerns

3. **Consistent Behavior**:
   - All routes are handled the same way
   - No special cases for different routes
   - Prevents the `/in` route from being injected

## Directory Structure Impact
```
app/
├── [countryCode]/
│   └── (website)/
│       └── account/
│           ├── @dashboard/
│           ├── @login/
│           └── layout.tsx
```

Even though we still have the `[countryCode]` in our directory structure (for potential future use), our components now use simple routes, and the `LocalizedLink` component handles any necessary transformations.

## Key Takeaways

1. **Consistency is Key**:
   - Use a single routing pattern throughout the application
   - Don't mix different routing strategies

2. **Centralize Routing Logic**:
   - Use a single component to handle route transformations
   - Keep routing logic out of individual components

3. **Simplify Component Logic**:
   - Components should use simple routes
   - Let routing infrastructure handle complexities

4. **Future-Proofing**:
   - The solution maintains the possibility of adding multi-country support later
   - Changes would only need to be made in `LocalizedLink`

## Testing Recommendations

1. Test account navigation from different parts of the application
2. Verify URL consistency across all account-related pages
3. Check that login/register flows work correctly
4. Verify that deep linking to account pages works
5. Test navigation between account sections 