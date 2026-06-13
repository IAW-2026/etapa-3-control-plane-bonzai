"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn, useUser, useClerk } from "@clerk/nextjs";
import { useAuth } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { isAdmin, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (userId && isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, isAdmin, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {userId && !isAdmin ? (
          <div className="border border-[var(--color-border)] bg-white p-10 text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 bg-[rgba(220,38,38,0.08)] flex items-center justify-center text-[var(--color-error)]">
              <ShieldAlert size={24} />
            </div>
            <h1 className="font-serif text-xl text-[var(--color-error)] mb-2">Access Denied</h1>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Your account does not have the <strong>super_admin</strong> role required to access the
              Control Plane.
            </p>
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-5 py-[0.6rem] border border-[var(--color-border)] bg-transparent text-[var(--color-text)] cursor-pointer hover:bg-black hover:text-white transition-colors"
            >
              Sign in with another account
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[var(--color-primary)] text-white flex items-center justify-center font-serif text-xl mb-6">
              CP
            </div>
            <SignIn
              routing="hash"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "border border-[var(--color-border)] shadow-none",
                  headerTitle: "font-serif text-[var(--color-primary)]",
                  headerSubtitle: "text-[var(--color-text-muted)]",
                  formButtonPrimary: "bg-[var(--color-primary)] hover:bg-black text-sm uppercase tracking-[0.1em]",
                  formFieldLabel: "text-xs font-semibold",
                  formFieldInput: "border-[1.5px] border-[var(--color-border)] rounded-xl",
                  footerActionLink: "text-[var(--color-primary)]",
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
