import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-[spin_0.6s_linear_infinite] mx-auto my-12",
        className
      )}
    />
  );
}
