"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Plus, FileCheck, Archive, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const PRESTATION_TYPE_OPTIONS = [
  { value: "DIAG_EXPORT", label: "Diag'Export" },
  { value: "OAF", label: "OAF" },
];

const typeLabels: Record<string, string> = {
  DIAG_EXPORT: "Diag'Export",
  OBJECTIF_MARCHE: "Objectif Marché",
  OAF: "OAF",
};

export function ProjetPrestationsTab({ projet, onUpdate }: { projet: any; onUpdate: () => void }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState("DIAG_EXPORT");
  const [creating, setCreating] = useState(false);

  const createPrestation = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/prestations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, projetId: projet.id }),
      });
      if (!res.ok) throw new Error();
      const prestation = await res.json();
      addToast("success", "Prestation créée");
      setShowCreate(false);
      onUpdate();
      // Navigate to the prestation
      if (newType === "DIAG_EXPORT") {
        router.push(`/prestations/${prestation.id}/diag`);
      } else if (newType === "OAF") {
        router.push(`/prestations/${prestation.id}/oaf`);
      }
    } catch {
      addToast("error", "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const archivePrestation = async (prestationId: string) => {
    const res = await fetch(`/api/prestations/${prestationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "ARCHIVE" }),
    });
    if (res.ok) {
      addToast("success", "Prestation archivée");
      onUpdate();
    }
  };

  const deletePrestation = async (prestationId: string) => {
    if (!confirm("Supprimer cette prestation ?")) return;
    const res = await fetch(`/api/prestations/${prestationId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Prestation supprimée");
      onUpdate();
    }
  };

  const navigateToPrestation = (p: any) => {
    if (p.type === "DIAG_EXPORT") router.push(`/prestations/${p.id}/diag`);
    else if (p.type === "OAF") router.push(`/prestations/${p.id}/oaf`);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Prestations ({projet.prestations.length})</h3>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-end gap-3">
            <Select label="Type de prestation" options={PRESTATION_TYPE_OPTIONS} value={newType} onChange={(e) => setNewType(e.target.value)} />
            <Button size="sm" onClick={createPrestation} loading={creating}>Créer</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
          </div>
        )}

        {projet.prestations.length === 0 && !showCreate && (
          <p className="text-sm text-gray-500 text-center py-8">Aucune prestation</p>
        )}

        <div className="space-y-2">
          {projet.prestations.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => navigateToPrestation(p)}
              >
                <FileCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{typeLabels[p.type]}</p>
                  <p className="text-xs text-gray-500">Créée le {formatDate(p.createdAt)}</p>
                </div>
                <Badge variant={p.statut === "EN_COURS" ? "success" : "default"}>
                  {p.statut === "EN_COURS" ? "En cours" : "Archivée"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {p.statut === "EN_COURS" && (
                  <button onClick={() => archivePrestation(p.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Archiver">
                    <Archive className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => deletePrestation(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
