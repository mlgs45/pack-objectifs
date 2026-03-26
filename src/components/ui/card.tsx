import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
  hover?: boolean;
}

export function Card({ children, className, onClick, glass, hover = !!onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-6",
        glass
          ? "glass border-white/20 shadow-lg"
          : "bg-white border-gray-100 shadow-sm",
        hover && "card-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-gray-900 tracking-tight", className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}
