import {Metadata} from "next";
import {getCustomer} from "@/data/medusa/customer";
import LogoutButton from "../../account/@dashboard/logout-button";

export const metadata: Metadata = {
  title: "Account Dashboard",
  description: "View your account details and orders.",
};

export default async function DashboardPage() {
  // Get customer data - authentication check is now handled by middleware
  const customer = await getCustomer();

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-8 border rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Account</h1>
          <LogoutButton />
        </div>
        <div className="flex flex-col gap-2">
          {customer && (
            <>
              <p>
                <span className="font-medium">Name:</span> {customer.first_name}{" "}
                {customer.last_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {customer.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {customer.phone || "N/A"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 