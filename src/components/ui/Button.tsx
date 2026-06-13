import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.1em] transition-all duration-[0.4s]",
          "cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-[var(--color-primary)] text-white rounded-sm hover:bg-black hover:-translate-y-0.5",
          variant === "secondary" &&
            "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary)] hover:text-white",
          variant === "ghost" &&
            "bg-transparent text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-primary)]",
          variant === "accent" &&
            "bg-[var(--color-accent)] text-white rounded-sm hover:bg-[var(--color-accent-light)] hover:-translate-y-0.5",
          size === "sm" && "text-[0.6rem] px-3 py-1.5",
          size === "md" && "text-[0.65rem] px-5 py-[0.6rem]",
          size === "lg" && "text-[0.7rem] px-6 py-3",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
