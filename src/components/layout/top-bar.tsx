"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Search, LogOut, User, Settings, Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";

export function TopBar() {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-gray-200/50">
      <div className="h-full px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100/80 border-0 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-gray-100/80 transition-colors"
            >
              <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {session?.user?.prenom?.[0]}{session?.user?.nom?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{session?.user?.prenom} {session?.user?.nom}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{session?.user?.role === "ADMIN" ? "Administrateur" : "Conseiller"}</p>
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                  <Link
                    href="/profil"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Mon profil
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
