"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Building2, FolderOpen, BarChart3, BookOpen,
  Users, Bell, ChevronDown, LogOut, User, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";

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

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const allNav = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <header className="sticky top-0 z-40 bg-primary text-white shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg shrink-0">
            <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center text-sm font-bold">
              PO
            </div>
            <span className="hidden sm:inline">Pack Objectifs</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {allNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="h-8 w-8 bg-accent/80 rounded-full flex items-center justify-center text-sm font-semibold">
                  {session?.user?.prenom?.[0]}{session?.user?.nom?.[0]}
                </div>
                <span className="hidden md:inline text-sm">
                  {session?.user?.prenom} {session?.user?.nom}
                </span>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 text-gray-700">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{session?.user?.prenom} {session?.user?.nom}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {allNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-white/20 text-white" : "text-white/70"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
