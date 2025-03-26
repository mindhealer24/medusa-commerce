"use client";

import LocalizedLink from "@/components/shared/localized-link";

interface AccountButtonClientProps {
  isLoggedIn: boolean;
}

export default function AccountButtonClient({isLoggedIn}: AccountButtonClientProps) {
  // Use different URLs based on login status
  const href = isLoggedIn ? "/account/dashboard" : "/account/login";
  
  return (
    <LocalizedLink
      href={href}
      className="relative flex h-10 w-10 items-center justify-center p-2"
      aria-label={isLoggedIn ? "Your account" : "Sign in"}
      title={isLoggedIn ? "Your account" : "Sign in"}
    >
      <div className="h-5 w-5">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </LocalizedLink>
  );
} 