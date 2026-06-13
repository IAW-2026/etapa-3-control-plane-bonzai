"use client";

import { Store, Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPlaceholder } from "@/app/dashboard/payments/page";

export default function BuyerPage() {
  return (
    <div>
      <PageHeader title="Buyer" italic="App" description="Customer-facing storefront and purchasing." />
      <AppPlaceholder icon={<Construction size={28} />} name="Buyer App" hint="Customer activity, browsing behavior and purchase history will be available here." />
    </div>
  );
}
