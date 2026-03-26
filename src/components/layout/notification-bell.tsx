"use client";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
    >
      <Bell className="h-5 w-5 text-gray-500" />
      {count > 0 && (
        <span className="absolute top-1 right-1 h-4 w-4 bg-accent rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm pulse-ring">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
