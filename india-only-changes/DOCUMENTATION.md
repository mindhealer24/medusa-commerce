# India-Only Store Migration Documentation

This document details the changes made to convert the multi-country store into an India-only store. It includes a description of each modified file, the specific changes made, and the reasoning behind those changes.

## Overview of Changes

The primary goal was to simplify the store by removing the country selection functionality and setting India as the default and only country. This involved:

1. Removing the country selector from the header
2. Simplifying URL routing to always use the Indian region
3. Simplifying the LocalizedLink component
4. Setting India as the default country in the configuration

## Detailed Changes by File

### 1. `storefront/next.config.mjs`

**Original Configuration:**
```javascript
rewrites() {
  return [
    {
      source:
        "/:path((?!us|dk|fr|de|es|jp|gb|ca|ar|za|mx|my|au|nz|dz|br|in|cms|api|images|icons|favicon.ico|sections|favicon-inactive.ico).*)",
      destination: "/us/:path*",
    },
  ];
},
```

**New Configuration:**
```javascript
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
```

**Changes Made:**
- Replaced the complex regex pattern that excluded multiple country codes with a simple path-catching pattern
- Changed the destination from `/us/:path*` to `/in/:path*` to redirect all traffic to the India region
- Added comments to clarify the purpose of the changes

**Reason for Change:**
The original configuration was designed to handle multiple countries with a default fallback to 'us'. For an India-only store, we simplified this to always map any path to the India region, eliminating the complexity of country-specific routing.

### 2. `storefront/components/global/header/index.tsx`

**Changes Made:**
- Removed the import for `CountrySelector` component:
  ```javascript
  import {CountrySelector} from "./country-selector";
  ```
- Removed the CountrySelector component from the header UI:
  ```javascript
  <span className="hidden lg:block">
    <CountrySelector />
  </span>
  ```

**Reason for Change:**
Since we're now only targeting India, the country selector is unnecessary and would confuse users. Removing it simplifies the UI and eliminates potential routing issues.

### 3. `storefront/components/shared/localized-link.tsx`

**Original Implementation:**
```javascript
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

**New Implementation:**
```javascript
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
```

**Changes Made:**
- Removed the imports for `config` and `useCountryCode`
- Removed all the path manipulation logic that was adding country codes to links
- Simplified the component to directly pass through the href to the Next.js Link component
- Added comments explaining the simplification

**Reason for Change:**
The original implementation was adding country codes to links based on the selected country. For an India-only store, this complexity is unnecessary since we don't need to modify the URLs based on country.

### 4. `storefront/config.ts`

**Changes Made:**
- Changed the `defaultCountryCode` value from "us" to "in":
  ```javascript
  defaultCountryCode: "in", // Previously was "us"
  ```

**Reason for Change:**
This ensures that any remaining code that references the default country will now use India instead of the United States.

## How to Revert These Changes

To revert back to the multi-country implementation:

1. Replace the modified files with their original versions (stored in the `india-only-changes/original-files` directory)
2. Ensure the CountrySelector component is properly integrated in the header
3. Test navigation with different country codes to ensure proper routing

## Additional Considerations

If you want to expand to multiple countries in the future:

1. The app directory structure with `[countryCode]` should be maintained
2. The country selector will need to be reintegrated into the header
3. The URL handling in LocalizedLink will need to be restored to handle different country codes
4. The rewrites configuration will need to be updated to handle the default country code properly

## Contact

For any questions about these changes, please contact the development team. 