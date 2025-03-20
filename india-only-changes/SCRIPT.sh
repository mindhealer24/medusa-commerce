#!/bin/bash

# Script to revert India-only store changes back to multi-country configuration

echo "Reverting India-only store changes to multi-country configuration..."

# Copy original files back to their locations
cp original-files/next.config.mjs.original ../storefront/next.config.mjs
echo "✅ Restored next.config.mjs"

cp original-files/header.tsx.original ../storefront/components/global/header/index.tsx
echo "✅ Restored header component with country selector"

cp original-files/localized-link.tsx.original ../storefront/components/shared/localized-link.tsx
echo "✅ Restored localized-link component with country code handling"

cp original-files/config.ts.original ../storefront/config.ts
echo "✅ Restored config with US as default country"

echo ""
echo "All files have been reverted successfully!"
echo "Please restart your Next.js server to apply the changes."
echo ""
echo "Remember to test that:"
echo "1. The country selector appears in the header"
echo "2. Country-specific URLs (e.g., '/de/products') work correctly"
echo "3. Products are visible for different country selections" 