"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { OAF_STATUTS } from "@/data/diag-export";

interface Props {
  oaf: any;
}

export function OafTimeline({ oaf }: Props) {
  const paysActions = oaf?.paysActions || [];

  if (paysActions.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-sm">Aucune donnée à afficher</div>;
  }

  // Find overall date range
  const allDates: Date[] = [];
  paysActions.forEach((p: any) => {
    p.actions?.forEach((a: any) => {
      if (a.dateDebut) allDates.push(new Date(a.dateDebut));
      if (a.dateFin) allDates.push(new Date(a.dateFin));
    });
  });

  if (allDates.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-sm">Définissez des dates pour voir la timeline</div>;
  }

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  const getPosition = (dateStr: string) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return ((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
  };

  const getWidth = (start: string, end: string) => {
    if (!start || !end) return 5;
    return Math.max(2, getPosition(end) - getPosition(start));
  };

  const months: string[] = [];
  const current = new Date(minDate);
  while (current <= maxDate) {
    months.push(current.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }));
    current.setMonth(current.getMonth() + 1);
  }

  return (
    <div className="space-y-6">
      {paysActions.map((pays: any) => (
        <Card key={pays.code}>
          <CardTitle className="px-6 pt-4 text-base">{pays.nom}</CardTitle>
          <CardContent className="pt-4">
            {/* Month labels */}
            <div className="flex text-xs text-gray-400 mb-2 border-b border-gray-100 pb-1">
              {months.map((m, i) => (
                <span key={i} style={{ width: `${100 / months.length}%` }}>{m}</span>
              ))}
            </div>

            {/* Actions as bars */}
            <div className="space-y-2">
              {pays.actions?.map((action: any) => {
                const statut = OAF_STATUTS.find((s) => s.value === action.statut);
                const left = getPosition(action.dateDebut);
                const width = getWidth(action.dateDebut, action.dateFin);

                return (
                  <div key={action.id} className="relative h-8 flex items-center">
                    <div className="absolute text-xs text-gray-600 truncate" style={{ left: 0, width: "30%" }}>
                      {action.type}
                    </div>
                    <div className="absolute h-6 rounded-full" style={{
                      left: `${Math.max(30, left)}%`,
                      width: `${Math.min(width, 70)}%`,
                      backgroundColor: statut?.color || "#94A3B8",
                      opacity: 0.8,
                    }}>
                      <span className="text-[10px] text-white font-medium px-2 leading-6 truncate block">
                        {statut?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!pays.actions || pays.actions.length === 0) && (
                <p className="text-xs text-gray-400 py-2">Aucune action</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
