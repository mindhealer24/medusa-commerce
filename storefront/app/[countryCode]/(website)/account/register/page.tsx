import {Metadata} from "next";
import RegisterForm from "../@login/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for a new account.",
};

export default async function RegisterPage() {
  // The redirect logic is now handled by middleware
  return (
    <div className="max-w-md mx-auto my-8">
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      <RegisterForm />
    </div>
  );
} 