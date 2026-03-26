"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { DEPARTEMENTS } from "@/data/departements";
import { Download, BarChart3, Building2, FileCheck, FolderOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const DEPT_OPTIONS = [
  { value: "", label: "Tous les départements" },
  ...DEPARTEMENTS.map((d) => ({ value: d.code, label: `${d.nom} (${d.code})` })),
];

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "EXPORT", label: "Export" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "IMPLANTATION", label: "Implantation" },
];

const COLORS = ["#1B3A6B", "#E8441A", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];

function KpiCard({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function StatistiquesPage() {
  const [departement, setDepartement] = useState("");
  const [type, setType] = useState("");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", departement, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departement) params.set("departement", departement);
      if (type) params.set("type", type);
      const res = await fetch(`/api/stats?${params}`);
      return res.json();
    },
  });

  const exportCSV = (view: string) => {
    const params = new URLSearchParams({ view });
    if (departement) params.set("departement", departement);
    window.open(`/api/stats/export?${params}`, "_blank");
  };

  const prestationsView = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Select options={DEPT_OPTIONS} value={departement} onChange={(e) => setDepartement(e.target.value)} />
          <Select options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV("prestations")}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={FolderOpen} value={stats?.totalProjets || 0} label="Projets" color="bg-primary" />
        <KpiCard icon={FileCheck} value={stats?.totalPrestations || 0} label="Prestations" color="bg-accent" />
        <KpiCard icon={Building2} value={stats?.totalEntreprises || 0} label="Entreprises" color="bg-success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="px-6 pt-6 text-base">Projets par type</CardTitle>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={(stats?.projetsByType || []).map((item: any) => ({ name: item.type, value: item._count }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  dataKey="value" label={({ name, value }) => `${name} (${value})`}
                >
                  {(stats?.projetsByType || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="px-6 pt-6 text-base">Entreprises par département</CardTitle>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(stats?.entreprisesByDept || []).map((item: any) => ({ name: item.departement, count: item._count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Entreprises" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const entreprisesView = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select options={DEPT_OPTIONS} value={departement} onChange={(e) => setDepartement(e.target.value)} />
        <Button variant="outline" size="sm" onClick={() => exportCSV("entreprises")}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardTitle className="px-6 pt-6 text-base">Répartition par département</CardTitle>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(stats?.entreprisesByDept || []).map((item: any) => ({ name: item.departement, count: item._count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Entreprises" fill="#E8441A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "prestations", label: "Par prestations", content: isLoading ? <TableSkeleton /> : prestationsView },
    { id: "entreprises", label: "Par entreprises", content: isLoading ? <TableSkeleton /> : entreprisesView },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Statistiques" }]} />
      <PageHeader title="Statistiques & Reporting" description="Vue d'ensemble de l'activité" />
      <Tabs tabs={tabs} />
    </div>
  );
}
