# Medusa Build Error Documentation

This folder contains documentation about build errors in the Medusa backend and how they were fixed.

## Contents

- `build-error-fixes.md` - Detailed documentation of the changes made to fix build errors
- `original-files/` - Directory containing the original versions of the modified files
- `revert-script.sh` - Shell script to revert changes to the original state

## How to Revert to Original Code

If you need to revert to the original code (which has build errors), you can use the provided revert script.

### Using the Revert Script

1. Make sure you are in the backend directory:
   ```bash
   cd /path/to/backend
   ```

2. Run the revert script:
   ```bash
   bash documentation/revert-script.sh
   ```

This will restore all modified files to their original state, effectively reverting the changes made to fix the build errors.

**Note:** After reverting, the build will fail again with the original errors. To fix them again, you can follow the instructions in `build-error-fixes.md`.

### Manual Reversion

If you prefer to manually revert the changes:

1. Replace `src/api/admin/custom/route.ts` with `documentation/original-files/admin-custom-route.ts`
2. Replace `src/api/store/custom/route.ts` with `documentation/original-files/store-custom-route.ts`
3. Replace `src/api/query/route.ts` with `documentation/original-files/query-route.ts` 