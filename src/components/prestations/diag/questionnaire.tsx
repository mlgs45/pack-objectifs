"use client";
import { useState, useCallback } from "react";
import { DIAG_THEMATIQUES, DIAG_NOTES } from "@/data/diag-export";
import { Card, CardContent } from "@/components/ui/card";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { cn } from "@/lib/utils";

interface Props {
  prestationId: string;
  diagExport: any;
}

export function DiagQuestionnaire({ prestationId, diagExport }: Props) {
  const [criteres, setCriteres] = useState<Record<string, { note: number; commentaire: string }>>(
    diagExport?.criteres || {}
  );
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveCriteres = useCallback(async (updated: Record<string, any>) => {
    setSaving(true);
    try {
      await fetch(`/api/prestations/${prestationId}/diag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteres: updated }),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }, [prestationId]);

  const updateCritere = (critereId: string, field: "note" | "commentaire", value: number | string) => {
    const updated = {
      ...criteres,
      [critereId]: {
        ...criteres[critereId],
        note: criteres[critereId]?.note ?? 0,
        commentaire: criteres[critereId]?.commentaire ?? "",
        [field]: value,
      },
    };
    setCriteres(updated);
    saveCriteres(updated);
  };

  const getThematiqueProgress = (thematique: typeof DIAG_THEMATIQUES[number]) => {
    const rated = thematique.criteres.filter((c) => criteres[c.id]?.note > 0).length;
    return Math.round((rated / thematique.criteres.length) * 100);
  };

  const getThematiqueAverage = (thematique: typeof DIAG_THEMATIQUES[number]) => {
    const notes = thematique.criteres
      .map((c) => criteres[c.id]?.note || 0)
      .filter((n) => n > 0);
    if (notes.length === 0) return 0;
    return notes.reduce((a, b) => a + b, 0) / notes.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />
      </div>

      {DIAG_THEMATIQUES.map((thematique) => {
        const progress = getThematiqueProgress(thematique);
        const average = getThematiqueAverage(thematique);

        return (
          <Card key={thematique.id}>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{thematique.label}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Moyenne: {average.toFixed(1)}/4</span>
                  <span className="text-sm font-medium text-primary">{progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-4">
                {thematique.criteres.map((critere) => {
                  const current = criteres[critere.id] || { note: 0, commentaire: "" };

                  return (
                    <div key={critere.id} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">{critere.label}</label>
                        <div className="flex items-center gap-1">
                          {DIAG_NOTES.map((note) => (
                            <button
                              key={note.value}
                              type="button"
                              onClick={() => updateCritere(critere.id, "note", note.value)}
                              className={cn(
                                "h-8 w-8 rounded-full text-xs font-bold transition-all border-2",
                                current.note === note.value
                                  ? "scale-110 shadow-md"
                                  : "opacity-60 hover:opacity-100"
                              )}
                              style={{
                                backgroundColor: current.note === note.value ? note.color : "transparent",
                                borderColor: note.color,
                                color: current.note === note.value ? "white" : note.color,
                              }}
                              title={note.label}
                            >
                              {note.value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Commentaire (optionnel)..."
                        className="w-full text-sm border-0 border-b border-gray-200 px-0 py-1 focus:outline-none focus:border-primary placeholder:text-gray-300"
                        value={current.commentaire}
                        onChange={(e) => updateCritere(critere.id, "commentaire", e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
