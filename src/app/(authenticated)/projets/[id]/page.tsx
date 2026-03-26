"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Trash2 } from "lucide-react";
import { ProjetEntrepriseTab } from "@/components/projets/tabs/entreprise-tab";
import { ProjetInfoTab } from "@/components/projets/tabs/info-tab";
import { ProjetUsersTab } from "@/components/projets/tabs/users-tab";
import { ProjetDocumentsTab } from "@/components/projets/tabs/documents-tab";
import { ProjetPrestationsTab } from "@/components/projets/tabs/prestations-tab";

export default function ProjetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: projet, isLoading } = useQuery({
    queryKey: ["projet", id],
    queryFn: async () => {
      const res = await fetch(`/api/projets/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const handleDelete = async () => {
    if (!confirm("Supprimer ce projet et toutes ses prestations ?")) return;
    const res = await fetch(`/api/projets/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Projet supprimé");
      router.push("/projets");
    }
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["projet", id] });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (!projet) return <div>Projet non trouvé</div>;

  const tabs = [
    { id: "entreprise", label: "L'entreprise", content: <ProjetEntrepriseTab entreprise={projet.entreprise} /> },
    { id: "projet", label: "Le projet", content: <ProjetInfoTab projet={projet} onUpdate={refresh} /> },
    { id: "utilisateurs", label: "Les utilisateurs", content: <ProjetUsersTab projet={projet} onUpdate={refresh} /> },
    { id: "documents", label: "Les documents", content: <ProjetDocumentsTab projetId={projet.id} documents={projet.documents} onUpdate={refresh} /> },
    { id: "prestations", label: "Les prestations", content: <ProjetPrestationsTab projet={projet} onUpdate={refresh} /> },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Projets", href: "/projets" }, { label: projet.titre }]} />
      <PageHeader
        title={projet.titre}
        description={`${projet.entreprise.raisonSociale} — ${projet.type}`}
        actions={
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        }
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
