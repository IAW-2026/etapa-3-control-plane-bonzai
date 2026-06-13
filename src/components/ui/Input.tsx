import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold tracking-tight">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "px-4 py-3 text-base bg-white border-[1.5px] border-[var(--color-border)] rounded-xl",
            "transition-all duration-200 outline-none",
            "hover:border-[var(--color-primary)] hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]",
            "focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(27,61,47,0.1)]",
            error && "!border-[var(--color-error)] !shadow-[0_0_0_3px_rgba(220,38,38,0.1)]",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
