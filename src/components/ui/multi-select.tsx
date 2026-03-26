"use client";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  error,
  searchable = true,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(
    (o) => o.label.toLowerCase().includes(search.toLowerCase()) && !value.includes(o.value)
  );

  const selectedLabels = value.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  );

  const remove = (v: string) => onChange(value.filter((x) => x !== v));
  const add = (v: string) => {
    onChange([...value, v]);
    setSearch("");
  };

  return (
    <div className="w-full" ref={ref}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className={cn(
          "min-h-[38px] rounded-lg border px-2 py-1.5 cursor-pointer flex flex-wrap gap-1 items-center",
          error ? "border-error" : "border-gray-300",
          open && "ring-2 ring-primary-300 border-primary"
        )}
        onClick={() => setOpen(true)}
      >
        {selectedLabels.map((label, i) => (
          <span
            key={value[i]}
            className="inline-flex items-center gap-1 bg-primary-50 text-primary text-xs rounded-md px-2 py-1"
          >
            {label}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(value[i]); }}
              className="hover:text-primary-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-sm text-gray-400">{placeholder}</span>}
        <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
      </div>
      {open && (
        <div className="absolute z-40 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-300"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">Aucun résultat</div>
          ) : (
            filtered.slice(0, 50).map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors"
                onClick={() => add(opt.value)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
