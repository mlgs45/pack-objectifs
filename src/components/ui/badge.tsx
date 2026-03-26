import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "accent";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-600 ring-gray-200/50",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/50",
  error: "bg-red-50 text-red-700 ring-red-200/50",
  info: "bg-sky-50 text-sky-700 ring-sky-200/50",
  accent: "bg-accent-50 text-accent-700 ring-accent-200/50",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}
