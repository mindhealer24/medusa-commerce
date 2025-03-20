# India-Only Store Configuration

This folder contains documentation and original files related to the conversion of the multi-country store to an India-only store.

## Contents

- `DOCUMENTATION.md` - Detailed documentation of all changes made
- `original-files/` - Directory containing the original versions of modified files

## How to Revert to Multi-Country Configuration

To revert back to the multi-country store configuration:

1. Copy the files from the `original-files` directory to their respective locations in the project:

   ```bash
   cp original-files/next.config.mjs.original ../storefront/next.config.mjs
   cp original-files/header.tsx.original ../storefront/components/global/header/index.tsx
   cp original-files/localized-link.tsx.original ../storefront/components/shared/localized-link.tsx
   cp original-files/config.ts.original ../storefront/config.ts
   ```

2. Restart your Next.js development server

3. Verify that the country selector appears in the header and that country-specific URLs (e.g., `/de/products`) work correctly

## Files Modified

The following files were modified to implement the India-only store:

1. `storefront/next.config.mjs` - Updated rewrites to always route to India region
2. `storefront/components/global/header/index.tsx` - Removed country selector from the header
3. `storefront/components/shared/localized-link.tsx` - Simplified link handling without country codes
4. `storefront/config.ts` - Changed default country code from "us" to "in"

For detailed information about each change, please refer to the `DOCUMENTATION.md` file. 