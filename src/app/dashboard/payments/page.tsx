"use client";

import { CreditCard, Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" italic="App" description="Payment processing and transaction management." />
      <AppPlaceholder icon={<CreditCard size={28} />} name="Payments App" hint="Functions such as transactions, refunds and payment methods will be available here." />
    </div>
  );
}

export function AppPlaceholder({ icon, name, hint }: { icon: React.ReactNode; name: string; hint: string }) {
  return (
    <div className="text-center py-20 border border-[var(--color-border)]">
      <div className="w-16 h-16 mx-auto mb-6 bg-[rgba(27,61,47,0.05)] flex items-center justify-center text-[var(--color-warning)]">{icon}</div>
      <h2 className="font-serif text-2xl text-[var(--color-text-muted)] mb-2">{name}</h2>
      <p className="text-sm text-[#aaa] max-w-md mx-auto">{hint}</p>
    </div>
  );
}
