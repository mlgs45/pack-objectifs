"use client";
import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border bg-gray-50/50 px-4 py-2.5 text-sm appearance-none transition-all focus:outline-none focus:ring-2 focus:bg-white focus:shadow-sm",
            error
              ? "border-red-300 focus:ring-red-500/20"
              : "border-gray-200 focus:ring-primary/20 focus:border-primary/40",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
export { Select };
