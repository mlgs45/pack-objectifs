"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?page=${page}`);
      return res.json();
    },
  });

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = async (ids: string[]) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Notifications" }]} />
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        }
      />

      <div className="space-y-2">
        {data?.data?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune notification</p>
          </div>
        )}
        {data?.data?.map((alerte: any) => (
          <Card
            key={alerte.id}
            className={cn(!alerte.vue && "border-primary-200 bg-primary-50/30")}
            onClick={() => !alerte.vue && markRead([alerte.id])}
          >
            <CardContent className="flex items-center gap-4 py-3">
              {!alerte.vue && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{alerte.historique?.utilisateur?.prenom} {alerte.historique?.utilisateur?.nom}</span>
                  {" "}{alerte.historique?.action}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{getRelativeTime(alerte.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
