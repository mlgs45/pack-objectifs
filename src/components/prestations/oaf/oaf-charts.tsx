"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  oaf: any;
}

export function OafCharts({ oaf }: Props) {
  const paysActions = oaf?.paysActions || [];

  if (paysActions.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-sm">Aucune donnée à afficher</div>;
  }

  // Data for prévisionnel vs réalisé by pays
  const chartData = paysActions.map((pays: any) => ({
    name: pays.nom,
    previsionnel: pays.actions?.reduce((s: number, a: any) => s + (a.montantPrevisionnel || 0), 0) || 0,
    realise: pays.actions?.reduce((s: number, a: any) => s + (a.montantRealise || 0), 0) || 0,
    ca: pays.ca || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="px-6 pt-6">Budget prévisionnel vs réalisé par pays</CardTitle>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="previsionnel" name="Prévisionnel" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realise" name="Réalisé" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary table */}
      <Card>
        <CardTitle className="px-6 pt-6">Récapitulatif</CardTitle>
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Pays</th>
                <th className="text-right py-2 font-medium text-gray-600">Nb actions</th>
                <th className="text-right py-2 font-medium text-gray-600">Prévisionnel</th>
                <th className="text-right py-2 font-medium text-gray-600">Réalisé</th>
                <th className="text-right py-2 font-medium text-gray-600">CA</th>
                <th className="text-right py-2 font-medium text-gray-600">Taux réalisation</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row: any) => {
                const taux = row.previsionnel > 0 ? (row.realise / row.previsionnel * 100) : 0;
                return (
                  <tr key={row.name} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2 text-right">{paysActions.find((p: any) => p.nom === row.name)?.actions?.length || 0}</td>
                    <td className="py-2 text-right">{formatCurrency(row.previsionnel)}</td>
                    <td className="py-2 text-right text-green-600">{formatCurrency(row.realise)}</td>
                    <td className="py-2 text-right">{formatCurrency(row.ca)}</td>
                    <td className="py-2 text-right">
                      <span className={taux >= 75 ? "text-green-600" : taux >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {taux.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{paysActions.reduce((s: number, p: any) => s + (p.actions?.length || 0), 0)}</td>
                <td className="py-2 text-right">{formatCurrency(chartData.reduce((s: number, r: any) => s + r.previsionnel, 0))}</td>
                <td className="py-2 text-right text-green-600">{formatCurrency(chartData.reduce((s: number, r: any) => s + r.realise, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(chartData.reduce((s: number, r: any) => s + r.ca, 0))}</td>
                <td className="py-2 text-right">—</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
