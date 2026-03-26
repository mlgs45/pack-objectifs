"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { ProjetForm } from "@/components/projets/projet-form";
import { useToast } from "@/components/ui/toast";

export default function NewProjetPage() {
  return (
    <Suspense>
      <NewProjetContent />
    </Suspense>
  );
}

function NewProjetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const defaultEntrepriseId = searchParams.get("entrepriseId") || "";

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/projets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création");
    const projet = await res.json();
    addToast("success", "Projet créé avec succès");
    router.push(`/projets/${projet.id}`);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Projets", href: "/projets" }, { label: "Nouveau projet" }]} />
      <PageHeader title="Nouveau projet" />
      <ProjetForm onSubmit={handleSubmit} defaultEntrepriseId={defaultEntrepriseId} />
    </div>
  );
}
