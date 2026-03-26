"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { EntrepriseForm } from "@/components/entreprises/entreprise-form";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
import { FolderOpen, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EntrepriseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: entreprise, isLoading } = useQuery({
    queryKey: ["entreprise", id],
    queryFn: async () => {
      const res = await fetch(`/api/entreprises/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/entreprises/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur modification");
    queryClient.invalidateQueries({ queryKey: ["entreprise", id] });
    addToast("success", "Entreprise modifiée avec succès");
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cette entreprise et tous ses projets ?")) return;
    const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Entreprise supprimée");
      router.push("/entreprises");
    } else {
      addToast("error", "Erreur lors de la suppression");
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  if (!entreprise) return <div>Entreprise non trouvée</div>;

  return (
    <div>
      <Breadcrumb items={[{ label: "Entreprises", href: "/entreprises" }, { label: entreprise.raisonSociale }]} />
      <PageHeader
        title={entreprise.raisonSociale}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => router.push(`/projets/new?entrepriseId=${id}`)}>
              <FolderOpen className="h-4 w-4" />
              Nouveau projet
            </Button>
            {session?.user?.role === "ADMIN" && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EntrepriseForm defaultValues={entreprise} onSubmit={handleSubmit} />
        </div>

        <div>
          <Card>
            <CardTitle>Projets ({entreprise.projets?.length || 0})</CardTitle>
            <CardContent className="mt-4 space-y-3">
              {entreprise.projets?.length === 0 && (
                <p className="text-sm text-gray-500">Aucun projet pour cette entreprise</p>
              )}
              {entreprise.projets?.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projets/${p.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">{p.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{p.type}</Badge>
                    <span className="text-xs text-gray-500">{p.prestations?.length || 0} prestation(s)</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
