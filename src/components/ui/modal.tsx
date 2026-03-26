"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative bg-white rounded-2xl shadow-2xl p-6 w-full mx-4 border border-gray-100",
        "animate-in zoom-in-95 fade-in duration-200",
        sizes[size]
      )}>
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 ml-auto transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
