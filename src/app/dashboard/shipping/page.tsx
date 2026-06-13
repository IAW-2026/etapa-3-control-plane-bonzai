"use client";

import { Truck, Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPlaceholder } from "@/app/dashboard/payments/page";

export default function ShippingPage() {
  return (
    <div>
      <PageHeader title="Shipping" italic="App" description="Shipping dispatch and tracking management." />
      <AppPlaceholder icon={<Construction size={28} />} name="Shipping App" hint="Dispatches, tracking numbers and delivery status will be available here." />
    </div>
  );
}
