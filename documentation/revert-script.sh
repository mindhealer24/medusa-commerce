#!/bin/bash

# Revert script for Medusa build error fixes
# This script will revert the changes made to fix build errors

echo "Starting revert process..."

# 1. Revert API route files
echo "Reverting API route files..."

# Revert admin custom route
cat > src/api/admin/custom/route.ts << 'EOL'
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.sendStatus(200);
}
EOL

# Revert store custom route
cat > src/api/store/custom/route.ts << 'EOL'
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.sendStatus(200);
}
EOL

# Revert query route
cat > src/api/query/route.ts << 'EOL'
import { Query } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const POST = async (req, res) => {
  const query: Query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "sanity_product.id", "sanity_product.title"],
    pagination: { skip: 0, take: 100 },
  });

  res.json({ data });
};
EOL

echo "Revert completed. Note that the build will fail again after reverting."
echo "To fix the build, follow the instructions in documentation/build-error-fixes.md" 