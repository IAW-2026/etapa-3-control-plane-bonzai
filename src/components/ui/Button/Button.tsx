import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantMap: Record<string, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  accent: styles.accent,
};

const sizeMap: Record<string, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className, children, ...props }, ref) => {
    const classes = [
      styles.button,
      variantMap[variant],
      sizeMap[size],
      fullWidth ? styles.full : "",
      props.disabled ? styles.disabled : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
