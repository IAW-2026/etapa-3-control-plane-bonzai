"use client";

import { CreditCard, Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { AppPlaceholder } from "@/app/dashboard/placeholder";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" italic="App" description="Payment processing and transaction management." />
      <AppPlaceholder icon={<CreditCard size={28} />} name="Payments App" hint="Functions such as transactions, refunds and payment methods will be available here." />
    </div>
  );
}
