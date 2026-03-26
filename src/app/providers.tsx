"use client";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/lib/query-client";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
