import {NextResponse} from "next/server";

import medusa from "@/data/medusa/client";
import {removeAuthToken} from "@/data/medusa/cookies";
import {revalidateTag} from "next/cache";

/**
 * API handler for user logout
 * Logs out from Medusa and removes the auth token from cookies
 */
export async function POST() {
  try {
    // Log out from Medusa
    await medusa.auth.logout();
    
    // Remove auth token from cookies
    await removeAuthToken();
    
    // Revalidate auth and customer tags
    revalidateTag("auth");
    revalidateTag("customer");
    
    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      {message: "An error occurred during logout"},
      {status: 500}
    );
  }
} 