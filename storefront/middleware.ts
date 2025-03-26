import { NextRequest, NextResponse } from "next/server";

// Middleware cannot directly use server actions like getCustomer
// so we check for authentication by looking for the medusa session cookie
export async function middleware(request: NextRequest) {
  // Check for the medusa session cookie
  const sessionCookie = request.cookies.get('_medusa_jwt');
  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.includes('/account/login') || url.pathname.includes('/account/register');
  const isDashboardRoute = url.pathname.includes('/account/dashboard');

  // Handle authentication redirects
  if (isDashboardRoute && !sessionCookie) {
    // If trying to access dashboard without being logged in, redirect to login
    url.pathname = url.pathname.replace('/account/dashboard', '/account/login');
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && sessionCookie) {
    // If already logged in and trying to access login/register, redirect to dashboard
    url.pathname = url.pathname.replace(/\/account\/(login|register)/, '/account/dashboard');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure middleware to run only for specific account routes
export const config = {
  matcher: ['/account/:path*'],
}; 