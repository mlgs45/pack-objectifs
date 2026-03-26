"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Building2, FolderOpen, BarChart3, BookOpen,
  Users, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Entreprises", href: "/entreprises", icon: Building2 },
  { name: "Projets", href: "/projets", icon: FolderOpen },
  { name: "Statistiques", href: "/statistiques", icon: BarChart3 },
  { name: "Ressources", href: "/ressources", icon: BookOpen },
];

const adminNavigation = [
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const allNav = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-sidebar hidden lg:flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="h-9 w-9 bg-gradient-accent rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-accent/30">
            PO
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <h1 className="text-white font-bold text-sm leading-tight">Pack Objectifs</h1>
              <p className="text-white/40 text-[10px] font-medium tracking-wider uppercase">CCI Centre Val-de-Loire</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 mb-3 text-[10px] font-semibold tracking-wider uppercase text-white/30">Menu principal</p>
          )}
          {allNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-white/15 text-white shadow-lg shadow-black/10"
                    : "text-white/50 hover:bg-white/8 hover:text-white/90"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-accent" : "text-white/40 group-hover:text-white/70"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        {!collapsed && session?.user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-accent rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                {session.user.prenom?.[0]}{session.user.nom?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{session.user.prenom} {session.user.nom}</p>
                <p className="text-white/40 text-xs truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-gray-50 border border-gray-200"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-gray-200/50 px-2 py-1">
        <div className="flex items-center justify-around">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-accent")} />
                <span>{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
