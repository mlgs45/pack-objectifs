"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Download, Building2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { DEPARTEMENTS } from "@/data/departements";
import { FLAT_SECTEURS } from "@/data/secteurs";
import { debounce } from "@/lib/utils";

const EXPORTATEUR_OPTIONS = [
  { value: "", label: "Tous les niveaux" },
  { value: "PRIMO", label: "Primo" },
  { value: "P0", label: "P0" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
];

const DEPT_OPTIONS = [
  { value: "", label: "Tous les départements" },
  ...DEPARTEMENTS.map((d) => ({ value: d.code, label: `${d.nom} (${d.code})` })),
];

const SECTEUR_OPTIONS = [
  { value: "", label: "Tous les secteurs" },
  ...FLAT_SECTEURS.map((s) => ({ value: s, label: s })),
];

export default function EntreprisesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departement, setDepartement] = useState("");
  const [secteur, setSecteur] = useState("");
  const [exportateur, setExportateur] = useState("");

  const debouncedSetSearch = useCallback(
    debounce((val: string) => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["entreprises", page, debouncedSearch, departement, secteur, exportateur],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(departement && { departement }),
        ...(secteur && { secteur }),
        ...(exportateur && { exportateur }),
      });
      const res = await fetch(`/api/entreprises?${params}`);
      return res.json();
    },
  });

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (departement) params.set("departement", departement);
    window.open(`/api/entreprises/export?${params}`, "_blank");
  };

  const exportateurBadge = (niveau: string) => {
    const variants: Record<string, "default" | "info" | "warning" | "success"> = {
      PRIMO: "default",
      P0: "info",
      P1: "warning",
      P2: "success",
    };
    return <Badge variant={variants[niveau] || "default"}>{niveau}</Badge>;
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Entreprises" }]} />
      <PageHeader
        title="Entreprises"
        description="Gestion des entreprises clientes"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/entreprises/new")}>
              <Plus className="h-4 w-4" />
              Nouvelle entreprise
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, SIRET, ville..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
            />
          </div>
          <Select options={DEPT_OPTIONS} value={departement} onChange={(e) => { setDepartement(e.target.value); setPage(1); }} />
          <Select options={SECTEUR_OPTIONS} value={secteur} onChange={(e) => { setSecteur(e.target.value); setPage(1); }} />
          <Select options={EXPORTATEUR_OPTIONS} value={exportateur} onChange={(e) => { setExportateur(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Raison sociale</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">SIRET</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Département</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ville</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Exportateur</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Projets</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        Aucune entreprise trouvée
                      </td>
                    </tr>
                  )}
                  {data?.data?.map((e: any) => (
                    <tr
                      key={e.id}
                      onClick={() => router.push(`/entreprises/${e.id}`)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{e.raisonSociale}</td>
                      <td className="px-4 py-3 text-gray-600">{e.siret || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{e.departement}</td>
                      <td className="px-4 py-3 text-gray-600">{e.ville || "—"}</td>
                      <td className="px-4 py-3">{exportateurBadge(e.exportateur)}</td>
                      <td className="px-4 py-3 text-gray-600">{e._count?.projets || 0}</td>
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
