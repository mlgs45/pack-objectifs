"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OafEditor } from "@/components/prestations/oaf/oaf-editor";
import { OafTimeline } from "@/components/prestations/oaf/oaf-timeline";
import { OafCharts } from "@/components/prestations/oaf/oaf-charts";

export default function OafPage() {
  const { id } = useParams();

  const { data: prestation, isLoading, refetch } = useQuery({
    queryKey: ["prestation", id],
    queryFn: async () => {
      const res = await fetch(`/api/prestations/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (!prestation) return <div>Prestation non trouvée</div>;

  const oaf = prestation.oaf;

  const tabs = [
    { id: "liste", label: "Vue liste", content: <OafEditor prestationId={prestation.id} oaf={oaf} onUpdate={refetch} /> },
    { id: "timeline", label: "Vue timeline", content: <OafTimeline oaf={oaf} /> },
    { id: "charts", label: "Graphiques", content: <OafCharts oaf={oaf} /> },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Projets", href: "/projets" },
          { label: prestation.projet?.titre || "Projet", href: `/projets/${prestation.projetId}` },
          { label: "OAF" },
        ]}
      />
      <PageHeader
        title="Objectif Action Financement®"
        description={`${prestation.projet?.entreprise?.raisonSociale} — ${prestation.projet?.titre}`}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
