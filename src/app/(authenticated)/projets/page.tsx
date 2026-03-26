"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FolderOpen } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { DEPARTEMENTS } from "@/data/departements";
import { debounce, formatDate } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "EXPORT", label: "Export" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "IMPLANTATION", label: "Implantation" },
];

const DEPT_OPTIONS = [
  { value: "", label: "Tous les départements" },
  ...DEPARTEMENTS.map((d) => ({ value: d.code, label: `${d.nom} (${d.code})` })),
];

const typeBadgeVariant: Record<string, "info" | "warning" | "success"> = {
  EXPORT: "info",
  SOURCING: "warning",
  IMPLANTATION: "success",
};

export default function ProjetsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState("");
  const [departement, setDepartement] = useState("");

  const debouncedSetSearch = useCallback(
    debounce((val: string) => { setDebouncedSearch(val); setPage(1); }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["projets", page, debouncedSearch, type, departement],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(type && { type }),
        ...(departement && { departement }),
      });
      const res = await fetch(`/api/projets?${params}`);
      return res.json();
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: "Projets" }]} />
      <PageHeader
        title="Projets"
        description="Gestion des projets export"
        actions={
          <Button variant="secondary" size="sm" onClick={() => router.push("/projets/new")}>
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={search}
              onChange={(e) => { setSearch(e.target.value); debouncedSetSearch(e.target.value); }}
            />
          </div>
          <Select options={TYPE_OPTIONS} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} />
          <Select options={DEPT_OPTIONS} value={departement} onChange={(e) => { setDepartement(e.target.value); setPage(1); }} />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Entreprise</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Conseillers</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Prestations</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Modifié le</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        Aucun projet trouvé
                      </td>
                    </tr>
                  )}
                  {data?.data?.map((p: any) => (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/projets/${p.id}`)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{p.titre}</td>
                      <td className="px-4 py-3 text-gray-600">{p.entreprise?.raisonSociale}</td>
                      <td className="px-4 py-3"><Badge variant={typeBadgeVariant[p.type]}>{p.type}</Badge></td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.utilisateurs?.map((u: any) => `${u.user.prenom} ${u.user.nom}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p._count?.prestations || 0}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
