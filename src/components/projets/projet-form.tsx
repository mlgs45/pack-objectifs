"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { projetSchema, ProjetInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { TipTapEditor } from "@/components/forms/tiptap-editor";
import { Card, CardContent } from "@/components/ui/card";
import { FLAT_SECTEURS } from "@/data/secteurs";
import { PAYS } from "@/data/pays";

interface ProjetFormProps {
  defaultValues?: any;
  defaultEntrepriseId?: string;
  onSubmit: (data: ProjetInput) => Promise<void>;
}

const TYPE_OPTIONS = [
  { value: "EXPORT", label: "Export" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "IMPLANTATION", label: "Implantation" },
];

export function ProjetForm({ defaultValues, defaultEntrepriseId, onSubmit }: ProjetFormProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [secteurClient, setSecteurClient] = useState<string[]>(defaultValues?.secteurClient || []);
  const [paysExportEnCours, setPaysExportEnCours] = useState<string[]>(defaultValues?.paysExportEnCours || []);
  const [paysExportCibles, setPaysExportCibles] = useState<string[]>(defaultValues?.paysExportCibles || []);
  const [utilisateurs, setUtilisateurs] = useState<string[]>(
    defaultValues?.utilisateurs?.map((u: any) => u.userId || u.user?.id) || []
  );

  const { data: entreprises } = useQuery({
    queryKey: ["entreprises-minimal"],
    queryFn: async () => {
      const res = await fetch("/api/entreprises?limit=1000");
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users-minimal"],
    queryFn: async () => {
      const res = await fetch("/api/users?minimal=true");
      return res.json();
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProjetInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(projetSchema) as any,
    defaultValues: {
      titre: defaultValues?.titre || "",
      type: defaultValues?.type || "EXPORT",
      entrepriseId: defaultValues?.entrepriseId || defaultEntrepriseId || "",
    },
  });

  const onFormSubmit = async (data: ProjetInput) => {
    setLoading(true);
    try {
      await onSubmit({ ...data, description, secteurClient, paysExportEnCours, paysExportCibles, utilisateurs });
    } finally {
      setLoading(false);
    }
  };

  const entrepriseOptions = (entreprises || []).map((e: any) => ({
    value: e.id,
    label: e.raisonSociale,
  }));

  const userOptions = (users || []).map((u: any) => ({
    value: u.id,
    label: `${u.prenom} ${u.nom}`,
  }));

  const paysOptions = PAYS.map((p) => ({ value: p.code, label: p.nom }));
  const secteurOptions = FLAT_SECTEURS.map((s) => ({ value: s, label: s }));

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Titre du projet *" error={errors.titre?.message} {...register("titre")} />
            <Select label="Type *" options={TYPE_OPTIONS} error={errors.type?.message} {...register("type")} />
            <div className="md:col-span-2">
              <Select
                label="Entreprise *"
                options={entrepriseOptions}
                placeholder="Sélectionner une entreprise..."
                error={errors.entrepriseId?.message}
                {...register("entrepriseId")}
              />
            </div>
          </div>

          <TipTapEditor label="Description" content={description} onChange={setDescription} />

          <MultiSelect label="Secteurs client" options={secteurOptions} value={secteurClient} onChange={setSecteurClient} />
          <MultiSelect label="Pays d'export en cours" options={paysOptions} value={paysExportEnCours} onChange={setPaysExportEnCours} />
          <MultiSelect label="Pays d'export cibles" options={paysOptions} value={paysExportCibles} onChange={setPaysExportCibles} />
          <MultiSelect label="Conseillers assignés" options={userOptions} value={utilisateurs} onChange={setUtilisateurs} />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              {defaultValues ? "Enregistrer" : "Créer le projet"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
