"use client";
import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border bg-gray-50/50 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white focus:shadow-sm min-h-[100px] resize-y",
            error
              ? "border-red-300 focus:ring-red-500/20"
              : "border-gray-200 focus:ring-primary/20 focus:border-primary/40",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
