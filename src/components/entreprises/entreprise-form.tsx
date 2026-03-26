"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrepriseSchema, EntrepriseInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent } from "@/components/ui/card";
import { DEPARTEMENTS } from "@/data/departements";
import { FLAT_SECTEURS } from "@/data/secteurs";
import { PAYS } from "@/data/pays";
import { useState } from "react";

interface EntrepriseFormProps {
  defaultValues?: any;
  onSubmit: (data: EntrepriseInput) => Promise<void>;
}

const DEPT_OPTIONS = DEPARTEMENTS.map((d) => ({ value: d.code, label: `${d.nom} (${d.code})` }));
const EXPORTATEUR_OPTIONS = [
  { value: "PRIMO", label: "Primo" },
  { value: "P0", label: "P0" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
];
const SECTEUR_OPTIONS = FLAT_SECTEURS.map((s) => ({ value: s, label: s }));
const PAYS_OPTIONS = PAYS.map((p) => ({ value: p.code, label: p.nom }));

export function EntrepriseForm({ defaultValues, onSubmit }: EntrepriseFormProps) {
  const [loading, setLoading] = useState(false);
  const [secteurs, setSecteurs] = useState<string[]>(defaultValues?.secteurs || []);
  const [implantations, setImplantations] = useState<string[]>(defaultValues?.implantations || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<EntrepriseInput>({
    resolver: zodResolver(entrepriseSchema) as any,
    defaultValues: {
      ...defaultValues,
      dateCreation: defaultValues?.dateCreation ? new Date(defaultValues.dateCreation).toISOString().split("T")[0] : "",
    },
  });

  const onFormSubmit = async (data: EntrepriseInput) => {
    setLoading(true);
    try {
      await onSubmit({ ...data, secteurs, implantations });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Raison sociale *" error={errors.raisonSociale?.message} {...register("raisonSociale")} />
            <Input label="SIRET" {...register("siret")} />
            <Input label="Date de création" type="date" {...register("dateCreation")} />
            <Select label="Département *" options={DEPT_OPTIONS} placeholder="Choisir..." error={errors.departement?.message} {...register("departement")} />
            <Input label="Ville" {...register("ville")} />
            <Input label="Code postal" {...register("codePostal")} />
            <Select label="Niveau exportateur" options={EXPORTATEUR_OPTIONS} {...register("exportateur")} />
            <Input label="Effectif total" type="number" {...register("effectif")} />
            <Input label="Effectif export" type="number" {...register("effectifExport")} />
            <Input label="CA (€)" type="number" step="0.01" {...register("ca")} />
            <Input label="CA export (€)" type="number" step="0.01" {...register("caExport")} />
          </div>

          <Textarea label="Activité" {...register("activite")} />

          <MultiSelect
            label="Secteurs d'activité"
            options={SECTEUR_OPTIONS}
            value={secteurs}
            onChange={setSecteurs}
            placeholder="Sélectionner des secteurs..."
          />

          <MultiSelect
            label="Pays d'implantation"
            options={PAYS_OPTIONS}
            value={implantations}
            onChange={setImplantations}
            placeholder="Sélectionner des pays..."
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              {defaultValues ? "Enregistrer les modifications" : "Créer l'entreprise"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
