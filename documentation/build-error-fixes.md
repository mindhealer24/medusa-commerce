# Build Error Fixes Documentation

## Overview

This document outlines the changes made to fix build errors in the Medusa backend when running in production mode. The build errors were related to:

1. Missing MedusaRequest and MedusaResponse imports
2. Invalid fields in query routes

## Files Changed

### 1. Route Handler Files with Import Errors

#### File: `backend/src/api/admin/custom/route.ts`

**Issue:**
The file was importing `MedusaRequest` and `MedusaResponse` from `@medusajs/medusa`, but these types have been moved to `@medusajs/framework` in the newer version of Medusa.

**Change Made:**
```diff
- import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
+ import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
```

**Reason:**
Medusa has moved these types from the `@medusajs/medusa` package to `@medusajs/framework` as part of their restructuring. This is evident from other API files in the project that correctly import from `@medusajs/framework`.

#### File: `backend/src/api/store/custom/route.ts`

**Issue:**
Same as above, incorrect import location for the types.

**Change Made:**
```diff
- import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
+ import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
```

**Reason:**
Same as above.

### 2. Query Route with Invalid Fields

#### File: `backend/src/api/query/route.ts`

**Issue:**
The file was trying to query fields that don't exist in the standard product schema:
- `sanity_product.id`
- `sanity_product.title`

**Change Made:**
```diff
const { data } = await query.graph({
  entity: "product",
- fields: ["id", "sanity_product.id", "sanity_product.title"],
+ fields: ["id", "title", "handle"],
  pagination: { skip: 0, take: 100 },
});
```

**Reason:**
The field names `sanity_product.id` and `sanity_product.title` don't match the expected field format for the product entity. The correct fields to query are the standard product fields like `id`, `title`, and `handle`.

## Testing Changes

After making these changes, the build succeeds without errors:

```bash
npm run build
```

And the server starts successfully in production mode:

```bash
npm run start
``` 