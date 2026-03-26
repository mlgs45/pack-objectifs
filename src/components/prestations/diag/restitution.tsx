"use client";
import { useState, useCallback } from "react";
import { DIAG_THEMATIQUES } from "@/data/diag-export";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/forms/tiptap-editor";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { DiagGauges } from "./gauges";
import { DiagSwot } from "./swot";
import { FileDown } from "lucide-react";

interface Props {
  prestationId: string;
  diagExport: any;
  entreprise: any;
  projet: any;
}

export function DiagRestitution({ prestationId, diagExport, entreprise, projet }: Props) {
  const criteres = diagExport?.criteres || {};
  const [restitution, setRestitution] = useState<any>(diagExport?.restitution || {
    swot: { forces: [], faiblesses: [], opportunites: [], menaces: [] },
    preconisations: {},
    commentaires: "",
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveRestitution = useCallback(async (data: any) => {
    setSaving(true);
    try {
      await fetch(`/api/prestations/${prestationId}/diag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restitution: data }),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }, [prestationId]);

  const updateRestitution = (field: string, value: any) => {
    const updated = { ...restitution, [field]: value };
    setRestitution(updated);
    saveRestitution(updated);
  };

  // Calculate averages per thématique
  const thematiquesScores = DIAG_THEMATIQUES.map((t) => {
    const notes = t.criteres.map((c) => criteres[c.id]?.note || 0).filter((n) => n > 0);
    const avg = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
    return { id: t.id, label: t.label, score: avg, max: 4 };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Header info */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Entreprise :</span>
              <p className="font-semibold">{entreprise?.raisonSociale}</p>
            </div>
            <div>
              <span className="text-gray-500">Projet :</span>
              <p className="font-semibold">{projet?.titre}</p>
            </div>
            <div>
              <span className="text-gray-500">Secteur :</span>
              <p className="font-semibold">{entreprise?.secteurs?.join(", ") || "\u2014"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gauges */}
      <Card>
        <CardTitle className="px-6 pt-6">Scores par thématique</CardTitle>
        <CardContent className="pt-4">
          <DiagGauges scores={thematiquesScores} />
        </CardContent>
      </Card>

      {/* SWOT */}
      <Card>
        <CardTitle className="px-6 pt-6">Analyse SWOT</CardTitle>
        <CardContent className="pt-4">
          <DiagSwot
            swot={restitution.swot || { forces: [], faiblesses: [], opportunites: [], menaces: [] }}
            onChange={(swot) => updateRestitution("swot", swot)}
          />
        </CardContent>
      </Card>

      {/* Preconisations per thématique */}
      <Card>
        <CardTitle className="px-6 pt-6">Préconisations par thématique</CardTitle>
        <CardContent className="pt-4 space-y-4">
          {DIAG_THEMATIQUES.map((t) => (
            <div key={t.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.label}</label>
              <TipTapEditor
                content={restitution.preconisations?.[t.id] || ""}
                onChange={(content) => {
                  const updated = { ...restitution.preconisations, [t.id]: content };
                  updateRestitution("preconisations", updated);
                }}
                placeholder={`Préconisations pour ${t.label}...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Commentaires généraux */}
      <Card>
        <CardTitle className="px-6 pt-6">Commentaires généraux</CardTitle>
        <CardContent className="pt-4">
          <TipTapEditor
            content={restitution.commentaires || ""}
            onChange={(content) => updateRestitution("commentaires", content)}
            placeholder="Commentaires généraux sur le diagnostic..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
