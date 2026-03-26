import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDepartementNom } from "@/data/departements";
import { getPaysNom } from "@/data/pays";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function ProjetEntrepriseTab({ entreprise }: { entreprise: any }) {
  if (!entreprise) return null;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{entreprise.raisonSociale}</h3>
          <Link href={`/entreprises/${entreprise.id}`} className="text-primary hover:underline text-sm flex items-center gap-1">
            Voir la fiche <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">SIRET :</span> <span className="font-medium">{entreprise.siret || "—"}</span></div>
          <div><span className="text-gray-500">Département :</span> <span className="font-medium">{getDepartementNom(entreprise.departement)}</span></div>
          <div><span className="text-gray-500">Ville :</span> <span className="font-medium">{entreprise.ville || "—"}</span></div>
          <div><span className="text-gray-500">Exportateur :</span> <Badge>{entreprise.exportateur}</Badge></div>
          {entreprise.ca && <div><span className="text-gray-500">CA :</span> <span className="font-medium">{formatCurrency(entreprise.ca)}</span></div>}
          {entreprise.caExport && <div><span className="text-gray-500">CA export :</span> <span className="font-medium">{formatCurrency(entreprise.caExport)}</span></div>}
          {entreprise.effectif && <div><span className="text-gray-500">Effectif :</span> <span className="font-medium">{entreprise.effectif}</span></div>}
          {entreprise.secteurs?.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Secteurs :</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {entreprise.secteurs.map((s: string) => <Badge key={s} variant="info">{s}</Badge>)}
              </div>
            </div>
          )}
          {entreprise.implantations?.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Implantations :</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {entreprise.implantations.map((c: string) => <Badge key={c}>{getPaysNom(c)}</Badge>)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
