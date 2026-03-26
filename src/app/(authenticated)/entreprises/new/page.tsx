"use client";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { EntrepriseForm } from "@/components/entreprises/entreprise-form";
import { useToast } from "@/components/ui/toast";

export default function NewEntreprisePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/entreprises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création");
    const entreprise = await res.json();
    addToast("success", "Entreprise créée avec succès");
    router.push(`/entreprises/${entreprise.id}`);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Entreprises", href: "/entreprises" }, { label: "Nouvelle entreprise" }]} />
      <PageHeader title="Nouvelle entreprise" />
      <EntrepriseForm onSubmit={handleSubmit} />
    </div>
  );
}
