import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";

import medusa from "@/data/medusa/client";
import {setAuthToken} from "@/data/medusa/cookies";

/**
 * API handler for user registration
 * Registers with Medusa backend and sets the auth token
 */
export async function POST(request: Request) {
  try {
    const {email, password, first_name, last_name, phone} = await request.json();

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        {message: "All fields except phone are required"},
        {status: 400}
      );
    }

    try {
      // Step 1: Register the user credentials
      const token = await medusa.auth.register('customer', 'emailpass', {
        email,
        password,
      });

      // Step 2: Create the customer with all provided details
      const customHeaders = { authorization: `Bearer ${token}` };
      
      await medusa.store.customer.create(
        {
          email,
          first_name,
          last_name,
          phone: phone || undefined,
        },
        {},
        customHeaders
      );

      // Step 3: Log the user in
      const loginToken = await medusa.auth.login('customer', 'emailpass', {
        email,
        password,
      });

      // Step 4: Set the JWT in cookies
      await setAuthToken(loginToken as string);
      
      // Revalidate the customer cache tag
      revalidateTag("customer");

      return NextResponse.json({success: true});
      
    } catch (authError: any) {
      console.error("Registration error:", authError);
      
      // Handle specific error cases
      if (authError.response?.status === 422 || 
          authError.message?.includes("already exists")) {
        return NextResponse.json(
          {message: "Email already exists"},
          {status: 422}
        );
      }
      
      return NextResponse.json(
        {message: "Registration failed: " + (authError.message || "Unknown error")},
        {status: 400}
      );
    }
  } catch (error: any) {
    console.error("Registration request error:", error);
    
    return NextResponse.json(
      {message: "An error occurred during registration: " + (error.message || "Unknown error")},
      {status: 500}
    );
  }
} 