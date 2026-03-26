import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
      <Link href="/dashboard" className="hover:text-primary transition-colors font-medium">
        Accueil
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
