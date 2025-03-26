"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";

import LoginForm from "@/app/[countryCode]/(website)/account/@login/login-form";
import RegisterForm from "@/app/[countryCode]/(website)/account/@login/register-form";

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN);

  useEffect(() => {
    if (mode) {
      setCurrentView(mode as LOGIN_VIEW);
      
      // Update URL without the mode parameter
      const newUrl = `/account`;
      router.replace(newUrl);
    }
  }, [mode, router]);

  const renderComponent = () => {
    switch (currentView) {
      case LOGIN_VIEW.SIGN_IN:
        return (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-8 border rounded-lg">
              <h1 className="text-2xl font-bold mb-4">Login</h1>
              <p className="text-gray-600 mb-6">
                Login to your account to view orders, manage your profile and more.
              </p>
              <LoginForm setShowRegister={() => setCurrentView(LOGIN_VIEW.REGISTER)} />
            </div>
          </div>
        );
      case LOGIN_VIEW.REGISTER:
        return (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-8 border rounded-lg">
              <h1 className="text-2xl font-bold mb-4">Create Account</h1>
              <p className="text-gray-600 mb-6">
                Create an account to start shopping, track orders, and more.
              </p>
              <RegisterForm setShowLogin={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full">{renderComponent()}</div>;
};

export default LoginTemplate; 