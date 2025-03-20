How we fixed "untitled" products in Sanity:
The issue was that the sync service was only setting internalTitle but not title. Here's what we found in backend/src/modules/sanity/service.ts:

private transformProductForCreate = (product: ProductDTO) => {
  return {
    _type: this.typeMap[SyncDocumentTypes.PRODUCT],
    _id: product.id,
    internalTitle: product.title,  // Only setting internalTitle
    pathname: { _type: "slug", current: "/products/" + product.handle },
  };
};

The fix was to set both title and internalTitle in the transform functions:

private transformProductForCreate = (product: ProductDTO) => {
  return {
    _type: this.typeMap[SyncDocumentTypes.PRODUCT],
    _id: product.id,
    title: product.title,         // Added this
    internalTitle: product.title,
    pathname: { _type: "slug", current: "/products/" + product.handle },
  };
};
















Ah, I see the issue now. This is a URL routing problem combined with how regions work. Let's tackle this more complex issue:
The URL Problem
Here's what's happening:
When you select India, the URL changes to localhost:3000/in
If you then select Denmark, it's appending /de to the existing path, resulting in localhost:3000/de/in
This is an invalid route that doesn't match any expected pattern, causing the "not found" error
The URL structure should be /[countryCode] (e.g., /de, /in, /us), but it's incorrectly stacking country codes.

How to Fix This:
1. Let's examine the country selector component:
The issue is in the URL path generation in the country selector. Let's look at the problem in the getNewPath function:


// ... existing code ...

const getNewPath = (newCountryCode: string) => {
  // Get the current path without country code prefix
  const pathParts = pathname.split("/").filter(Boolean);
  
  // Always construct the path from scratch
  // If the path is the root path or only has the country code, go to root of new country
  if (pathParts.length <= 1) {
    return newCountryCode === config.defaultCountryCode ? "/" : `/${newCountryCode}`;
  }
  
  // For all other paths, extract the path after the country code and use that
  // Remove the current country code from the path (if it exists)
  const routeParts = pathParts.slice(1); // Skip the first part which is the country code
  
  // Construct the new path
  return newCountryCode === config.defaultCountryCode
    ? `/${routeParts.join('/')}`
    : `/${newCountryCode}/${routeParts.join('/')}`;
};

// ... existing code ...



Now let's also check and update the way the app handles routing for country codes:
Let's check the country code context to ensure it's functioning correctly:
Let's look at the rewrites in the Next.js config:
Let me check if "in" is included in the country code exclusion pattern in the rewrites configuration:

// ... existing code ...
rewrites() {
  return [
    {
      source:
        "/:path((?!us|dk|fr|de|es|jp|gb|ca|ar|za|mx|my|au|nz|dz|br|in|cms|api|images|icons|favicon.ico|sections|favicon-inactive.ico).*)",
      destination: "/us/:path*",
    },
  ];
},
// ... existing code ...

Here's what was happening and how the fixes should resolve the issues:
The Country Selector Path Generation Issue:
The original getNewPath function was manipulating the URL path incorrectly, leading to stacked country codes
Our fixed version now properly constructs the URL path based on the selected country code
It extracts the relevant parts of the path without the country code and adds the new country code properly
Rewrite Rule Issue:
India's country code 'in' was missing from the rewrites exception list
This meant when you navigated to '/in', it might not have been recognized as a valid country path
We've added 'in' to the list of country codes in the rewrites pattern

Combined Effect:
The broken URL generation was creating paths like '/de/in'
The rewrite rule wasn't recognizing 'in' as a valid country code
These two issues together caused the "not found" errors
After these changes, the country selector should work correctly for all countries, including India. The URLs will be properly formatted (e.g., '/in', '/de') and won't stack country codes incorrectly.
If you're still having issues after these fixes, we should look into the region handling to ensure India's region is properly configured and that products are available in that region.