import {getCustomer} from "@/data/medusa/customer";

import AccountButtonClient from "./account-button-client";

export default async function AccountButton() {
  const customer = await getCustomer();
  
  return <AccountButtonClient isLoggedIn={!!customer} />;
} 