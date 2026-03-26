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
import { FolderOpen, Building2, FileCheck, TrendingUp, ArrowUpRight } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";

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

function KpiCard({ icon: Icon, value, label, gradient, shadow }: { icon: any; value: number | string; label: string; gradient: string; shadow: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg ${shadow}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-4 -mb-4" />
      <div className="relative">
        <Icon className="h-6 w-6 mb-3 opacity-80" />
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm opacity-70 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

function ProjetCard({ projet, onClick }: { projet: any; onClick: () => void }) {
  return (
    <Card onClick={onClick} hover>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{projet.entreprise?.raisonSociale}</p>
            <p className="font-semibold text-sm text-gray-900 truncate">{projet.titre}</p>
          </div>
          <Badge variant={typeBadgeVariant[projet.type]} className="ml-3 shrink-0">{projet.type}</Badge>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {projet.utilisateurs?.slice(0, 3).map((u: any, i: number) => (
              <div key={i} className="h-6 w-6 bg-gradient-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold -ml-1 first:ml-0 ring-2 ring-white">
                {u.user.prenom[0]}{u.user.nom[0]}
              </div>
            ))}
            <span className="text-[11px] text-gray-400 ml-1">{getRelativeTime(projet.updatedAt)}</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-300" />
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

  const myIds = new Set(myProjets?.data?.map((p: any) => p.id) || []);
  const filteredOther = (otherProjets?.data || []).filter((p: any) => !myIds.has(p.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bonjour {session?.user?.prenom}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard icon={FolderOpen} value={stats?.totalProjets || 0} label="Projets" gradient="bg-gradient-to-br from-primary to-primary-400" shadow="shadow-primary/20" />
        <KpiCard icon={Building2} value={stats?.totalEntreprises || 0} label="Entreprises" gradient="bg-gradient-to-br from-accent to-accent-400" shadow="shadow-accent/20" />
        <KpiCard icon={FileCheck} value={stats?.totalPrestations || 0} label="Prestations" gradient="bg-gradient-to-br from-emerald-500 to-emerald-400" shadow="shadow-emerald-500/20" />
        <KpiCard icon={TrendingUp} value={myProjets?.data?.length || 0} label="Mes projets" gradient="bg-gradient-to-br from-amber-500 to-amber-400" shadow="shadow-amber-500/20" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Mes projets */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Mes projets</h2>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">{myProjets?.data?.length || 0}</span>
          </div>
          {loadingMy ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : myProjets?.data?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">Aucun projet assigné</p>
              </CardContent>
            </Card>
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Autres projets</h2>
            <Select
              options={TYPE_OPTIONS}
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              className="w-36 !py-1.5 !text-xs"
            />
          </div>
          {loadingOther ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : filteredOther.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">Aucun autre projet</p>
              </CardContent>
            </Card>
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
