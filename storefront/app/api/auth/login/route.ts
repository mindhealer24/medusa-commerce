import {NextResponse} from "next/server";

import medusa from "@/data/medusa/client";
import {setAuthToken} from "@/data/medusa/cookies";

/**
 * API handler for user login
 * Authenticates with Medusa backend and sets the auth token
 */
export async function POST(request: Request) {
  try {
    const {email, password} = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {message: "Email and password are required"},
        {status: 400}
      );
    }

    try {
      // Following solace pattern - login using the auth module with customer provider and emailpass strategy
      const token = await medusa.auth.login('customer', 'emailpass', {
        email,
        password,
      });
      
      if (!token) {
        return NextResponse.json(
          {message: "Authentication failed"},
          {status: 401}
        );
      }

      // Set the JWT in cookies
      await setAuthToken(token as string);

      return NextResponse.json({success: true});
    } catch (authError) {
      console.error("Authentication error:", authError);
      
      return NextResponse.json(
        {message: "Invalid email or password"},
        {status: 401}
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    
    return NextResponse.json(
      {message: "An error occurred during login"},
      {status: 500}
    );
  }
} 