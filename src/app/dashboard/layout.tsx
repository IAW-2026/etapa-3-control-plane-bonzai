"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileMenuButton } from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoaded, router]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 bg-[var(--color-neutral)] px-5 pt-16 pb-8 sm:px-6 sm:pt-8 lg:px-12 lg:py-10">
        <div style={{ width: "min(100%, 1200px)", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
