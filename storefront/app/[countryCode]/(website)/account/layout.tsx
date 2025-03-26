import {PropsWithChildren} from "react";

// Plain layout component that just renders children
export default function AccountLayout({children}: PropsWithChildren) {
  return (
    <div className="flex flex-col py-8 items-center">
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
} 