import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const inputClasses = [styles.input, error ? styles.inputError : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={inputClasses} {...props} />
        {hint && !error && <p className={styles.hint}>{hint}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
