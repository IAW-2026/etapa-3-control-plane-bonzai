import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  children: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "text-[var(--color-text-muted)] border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.03)]",
  primary: "text-[var(--color-success)] border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.05)]",
  success: "text-[#023b0f] border-[rgba(5,105,15,0.2)] bg-[rgba(31,161,51,0.05)]",
  warning: "text-[var(--color-warning)] border-[rgba(139,115,85,0.2)] bg-[rgba(139,115,85,0.05)]",
  error: "text-[var(--color-error)] border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.05)]",
};

export function Badge({ variant = "default", size = "md", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "uppercase font-semibold border inline-flex items-center gap-1",
        "text-[0.6rem] tracking-[0.1em]",
        size === "sm" && "px-1.5 py-0.5",
        size === "md" && "px-2.5 py-[0.25rem]",
        size === "lg" && "px-3 py-[0.3rem]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
