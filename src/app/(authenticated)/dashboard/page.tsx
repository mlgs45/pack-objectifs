"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Building2, FileCheck, TrendingUp } from "lucide-react";
import { formatDate, getRelativeTime } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "EXPORT", label: "Export" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "IMPLANTATION", label: "Implantation" },
];

const typeBadgeVariant: Record<string, "info" | "warning" | "success"> = {
  EXPORT: "info",
  SOURCING: "warning",
  IMPLANTATION: "success",
};

function KpiCard({ icon: Icon, value, label, color }: { icon: any; value: number | string; label: string; color: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </Card>
  );
}

function ProjetCard({ projet, onClick }: { projet: any; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="hover:border-primary-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">{projet.entreprise?.raisonSociale}</p>
            <p className="font-semibold text-sm text-gray-900 truncate">{projet.titre}</p>
          </div>
          <Badge variant={typeBadgeVariant[projet.type]} className="ml-2 shrink-0">{projet.type}</Badge>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{projet.utilisateurs?.map((u: any) => `${u.user.prenom} ${u.user.nom}`).join(", ")}</span>
          <span>{getRelativeTime(projet.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">{projet._count?.prestations || 0} prestation(s)</span>
          <span className="text-xs text-gray-400">&bull;</span>
          <span className="text-xs text-gray-400">{projet._count?.documents || 0} document(s)</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [otherType, setOtherType] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      return res.json();
    },
  });

  const { data: myProjets, isLoading: loadingMy } = useQuery({
    queryKey: ["my-projets"],
    queryFn: async () => {
      const res = await fetch("/api/projets?mine=true&limit=50");
      return res.json();
    },
  });

  const { data: otherProjets, isLoading: loadingOther } = useQuery({
    queryKey: ["other-projets", otherType],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (otherType) params.set("type", otherType);
      const res = await fetch(`/api/projets?${params}`);
      return res.json();
    },
  });

  // Filter out "my" projects from "other" list
  const myIds = new Set(myProjets?.data?.map((p: any) => p.id) || []);
  const filteredOther = (otherProjets?.data || []).filter((p: any) => !myIds.has(p.id));

  return (
    <div>
      <Breadcrumb items={[{ label: "Tableau de bord" }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bonjour {session?.user?.prenom} 👋
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={FolderOpen} value={stats?.totalProjets || 0} label="Projets" color="bg-primary" />
        <KpiCard icon={Building2} value={stats?.totalEntreprises || 0} label="Entreprises" color="bg-accent" />
        <KpiCard icon={FileCheck} value={stats?.totalPrestations || 0} label="Prestations" color="bg-success" />
        <KpiCard icon={TrendingUp} value={myProjets?.data?.length || 0} label="Mes projets" color="bg-warning" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Mes projets */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes projets</h2>
          {loadingMy ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : myProjets?.data?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun projet assign&eacute;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjets?.data?.map((p: any) => (
                <ProjetCard key={p.id} projet={p} onClick={() => router.push(`/projets/${p.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Autres projets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Autres projets</h2>
            <Select
              options={TYPE_OPTIONS}
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              className="w-40"
            />
          </div>
          {loadingOther ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : filteredOther.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun autre projet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOther.slice(0, 20).map((p: any) => (
                <ProjetCard key={p.id} projet={p} onClick={() => router.push(`/projets/${p.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
