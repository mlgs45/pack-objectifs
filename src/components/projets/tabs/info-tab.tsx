"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { TipTapEditor } from "@/components/forms/tiptap-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { FLAT_SECTEURS } from "@/data/secteurs";
import { PAYS } from "@/data/pays";

const TYPE_OPTIONS = [
  { value: "EXPORT", label: "Export" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "IMPLANTATION", label: "Implantation" },
];

export function ProjetInfoTab({ projet, onUpdate }: { projet: any; onUpdate: () => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [titre, setTitre] = useState(projet.titre);
  const [type, setType] = useState(projet.type);
  const [description, setDescription] = useState(projet.description || "");
  const [secteurClient, setSecteurClient] = useState<string[]>(projet.secteurClient || []);
  const [paysExportEnCours, setPaysExportEnCours] = useState<string[]>(projet.paysExportEnCours || []);
  const [paysExportCibles, setPaysExportCibles] = useState<string[]>(projet.paysExportCibles || []);

  const paysOptions = PAYS.map((p) => ({ value: p.code, label: p.nom }));
  const secteurOptions = FLAT_SECTEURS.map((s) => ({ value: s, label: s }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projets/${projet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre, type, description, secteurClient, paysExportEnCours, paysExportCibles,
          entrepriseId: projet.entrepriseId,
          utilisateurs: projet.utilisateurs.map((u: any) => u.userId),
        }),
      });
      if (!res.ok) throw new Error();
      addToast("success", "Projet mis à jour");
      onUpdate();
    } catch {
      addToast("error", "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
          <Select label="Type" options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <TipTapEditor label="Description" content={description} onChange={setDescription} />
        <MultiSelect label="Secteurs client" options={secteurOptions} value={secteurClient} onChange={setSecteurClient} />
        <MultiSelect label="Pays d'export en cours" options={paysOptions} value={paysExportEnCours} onChange={setPaysExportEnCours} />
        <MultiSelect label="Pays d'export cibles" options={paysOptions} value={paysExportCibles} onChange={setPaysExportCibles} />
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={loading}>Enregistrer</Button>
        </div>
      </CardContent>
    </Card>
  );
}
