"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DiagQuestionnaire } from "@/components/prestations/diag/questionnaire";
import { DiagRestitution } from "@/components/prestations/diag/restitution";

export default function DiagExportPage() {
  const { id } = useParams();

  const { data: prestation, isLoading } = useQuery({
    queryKey: ["prestation", id],
    queryFn: async () => {
      const res = await fetch(`/api/prestations/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (!prestation) return <div>Prestation non trouvée</div>;

  const tabs = [
    {
      id: "questionnaire",
      label: "Questionnaire",
      content: <DiagQuestionnaire prestationId={prestation.id} diagExport={prestation.diagExport} />,
    },
    {
      id: "restitution",
      label: "Restitution",
      content: (
        <DiagRestitution
          prestationId={prestation.id}
          diagExport={prestation.diagExport}
          entreprise={prestation.projet?.entreprise}
          projet={prestation.projet}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Projets", href: "/projets" },
          { label: prestation.projet?.titre || "Projet", href: `/projets/${prestation.projetId}` },
          { label: "Diag'Export" },
        ]}
      />
      <PageHeader
        title="Diag'Export®"
        description={`${prestation.projet?.entreprise?.raisonSociale} — ${prestation.projet?.titre}`}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
