"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwotItem {
  text: string;
  cotation: number;
}

interface SwotData {
  forces: SwotItem[];
  faiblesses: SwotItem[];
  opportunites: SwotItem[];
  menaces: SwotItem[];
}

interface Props {
  swot: SwotData;
  onChange: (swot: SwotData) => void;
}

const COTATIONS = [-2, -1, 0, 1, 2];

const quadrants = [
  { key: "forces" as const, label: "Forces", color: "bg-green-50 border-green-200", headerColor: "bg-green-500 text-white" },
  { key: "faiblesses" as const, label: "Faiblesses", color: "bg-red-50 border-red-200", headerColor: "bg-red-500 text-white" },
  { key: "opportunites" as const, label: "Opportunités", color: "bg-blue-50 border-blue-200", headerColor: "bg-blue-500 text-white" },
  { key: "menaces" as const, label: "Menaces", color: "bg-orange-50 border-orange-200", headerColor: "bg-orange-500 text-white" },
];

export function DiagSwot({ swot, onChange }: Props) {
  const [newTexts, setNewTexts] = useState<Record<string, string>>({ forces: "", faiblesses: "", opportunites: "", menaces: "" });

  const addItem = (quadrant: keyof SwotData) => {
    const text = newTexts[quadrant].trim();
    if (!text) return;
    const updated = { ...swot, [quadrant]: [...swot[quadrant], { text, cotation: 0 }] };
    onChange(updated);
    setNewTexts({ ...newTexts, [quadrant]: "" });
  };

  const removeItem = (quadrant: keyof SwotData, index: number) => {
    const updated = { ...swot, [quadrant]: swot[quadrant].filter((_, i) => i !== index) };
    onChange(updated);
  };

  const updateCotation = (quadrant: keyof SwotData, index: number, cotation: number) => {
    const items = [...swot[quadrant]];
    items[index] = { ...items[index], cotation };
    onChange({ ...swot, [quadrant]: items });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((q) => (
        <div key={q.key} className={cn("rounded-lg border overflow-hidden", q.color)}>
          <div className={cn("px-4 py-2 font-semibold text-sm", q.headerColor)}>{q.label}</div>
          <div className="p-3 space-y-2 min-h-[120px]">
            {swot[q.key].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                <p className="flex-1 text-sm">{item.text}</p>
                <div className="flex items-center gap-0.5">
                  {COTATIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateCotation(q.key, i, c)}
                      className={cn(
                        "h-6 w-6 rounded text-xs font-bold transition-all",
                        item.cotation === c
                          ? c >= 1 ? "bg-green-500 text-white" : c <= -1 ? "bg-red-500 text-white" : "bg-gray-400 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {c > 0 ? `+${c}` : c}
                    </button>
                  ))}
                </div>
                <button onClick={() => removeItem(q.key, i)} className="text-gray-400 hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ajouter..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-300"
                value={newTexts[q.key]}
                onChange={(e) => setNewTexts({ ...newTexts, [q.key]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addItem(q.key)}
              />
              <button
                type="button"
                onClick={() => addItem(q.key)}
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
