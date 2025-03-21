# Understanding the Next.js Rewrite Issue with Order Confirmation

## Overview
This document explains a specific issue encountered in our Medusa Commerce application related to Next.js URL rewrites and order confirmation redirects. The problem manifested as JavaScript errors when accessing order confirmation pages through certain URL patterns, specifically those containing country code prefixes.

## The Rewrite System

### How Next.js Rewrites Work in Our Application
Our application is configured with Next.js rewrites to handle country-specific content. The main configuration in `next.config.mjs` specifies that all non-excluded paths should be rewritten to include the `/in/` prefix (for India):

```js
// Simplified example from next.config.mjs
{
  async rewrites() {
    return {
      beforeFiles: [
        // Exclude specific paths from rewriting
        { source: '/cms/:path*', destination: '/cms/:path*' },
        { source: '/api/:path*', destination: '/api/:path*' },
        // Rewrite everything else to India region
        { source: '/:path*', destination: '/in/:path*' }
      ]
    }
  }
}
```

This means when a user visits:
- `http://localhost:3000/` → Next.js internally serves content from `/in/`
- `http://localhost:3000/products` → Next.js internally serves content from `/in/products`

The rewrite happens transparently to the user; they still see the original URL in their browser, but Next.js serves the content from the rewritten path.

### How Routing is Structured
Our application uses Next.js App Router with the following structure:
- `/storefront/app/[countryCode]/(website)/...` - Main country-specific routes
- `/storefront/app/[countryCode]/(website)/order/confirmed/[id]/...` - Order confirmation routes

The `[countryCode]` segment allows the application to serve different content based on country (in our case, primarily "in" for India).

## The Issue

### The Problem
When completing an order, the application was attempting to redirect to:
```
/${countryCode}/order/confirmed/${orderId}
```

For India (with country code "in"), this resulted in a URL like:
```
/in/order/confirmed/order_01JPW264G9E4W8WNAQTVD1ZYFE
```

While this URL technically exists and returns a 200 status code, it was causing JavaScript errors in the client-side code:
```
Cannot read properties of undefined (reading 'toLowerCase')
```

### Root Cause Analysis
The issue occurred because of how the redirect and rewrite systems interact:

1. **Normal Navigation Flow**:
   - User visits `/products` → Next.js rewrites to `/in/products` internally
   - The application handles this correctly because it follows the expected routing pattern

2. **Order Completion Flow**:
   - The server-side action in `placeOrder()` redirects to `/in/order/confirmed/${orderId}`
   - The application expects this URL to work as-is, without further rewriting
   - However, the client-side code has issues handling paths that already contain the `/in/` prefix

The problem was not that the URL path didn't exist, but rather how the client-side JavaScript processed URLs with the country code already included.

### Why Rewrites Didn't Work as Expected
The redirect that happens after order completion is a server-side redirect (using Next.js's `redirect` function), which bypasses the normal client-side routing. This means:

1. When a normal navigation happens, Next.js client routing system handles the rewrite properly
2. When a server-side redirect happens, it directly sends the browser to the new URL
3. The rewrite system doesn't get a chance to "undo" or properly handle the already-prefixed URL

This created an inconsistency in how URLs were handled between normal navigation and post-order redirects.

## The Solution

### The Fix
The solution was to modify the `placeOrder` function in `storefront/actions/medusa/order.ts` to redirect to the URL without the country code prefix:

```js
// Before the fix
const countryCode = 
  cartRes.order.shipping_address?.country_code?.toLowerCase() || "in";
redirect(`/${countryCode}/order/confirmed/${cartRes.order.id}`);

// After the fix
// Get the country code but don't include it in the redirect for India-only store
// This preserves the variable for potential future multi-country support
const countryCode = 
  cartRes.order.shipping_address?.country_code?.toLowerCase() || "in";

// For India-specific store, always redirect without the country code prefix
// If multi-country support is added later, this logic can be updated
redirect(`/order/confirmed/${cartRes.order.id}`);
```

### Why This Works
By redirecting to `/order/confirmed/${orderId}` without the country code prefix:

1. The Next.js rewrite system can properly handle this path, rewriting it internally to `/in/order/confirmed/${orderId}`
2. The client-side code receives a URL it can handle correctly
3. The application maintains consistency in how URLs are processed

This approach lets the standard Next.js rewrite mechanism handle the country code prefixing, rather than trying to do it manually in the redirect.

## Lessons Learned

### Rewrite System Considerations
When working with Next.js rewrites and redirects, important considerations include:

1. **Consistency in URL Handling**: Ensure that URLs are handled consistently between client-side navigation and server-side redirects.

2. **Understanding Rewrite Order**: Next.js processes rewrites in a specific order. Adding custom prefixes manually can interfere with this process.

3. **Client-Side vs. Server-Side**: Be aware of the differences in how URLs are processed between client-side navigation and server-side redirects.

4. **Testing Different Navigation Paths**: Test both direct URL access and redirects to ensure they work correctly.

### Future-Proofing
The solution maintains flexibility for future multi-country support by:

1. Still capturing the country code from the order data
2. Using a simpler redirect pattern that works with the existing rewrite system
3. Adding comments explaining the rationale, which will help future developers understand why this approach was taken

## Conclusion
The issue with order confirmation URLs was caused by an inconsistency in how paths with country code prefixes were handled between normal navigation and server-side redirects. By modifying the redirect URL to omit the country code prefix, we allowed the Next.js rewrite system to properly handle the path, resolving the JavaScript errors and ensuring a consistent user experience. 