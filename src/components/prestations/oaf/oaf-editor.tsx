"use client";
import { useState, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { useToast } from "@/components/ui/toast";
import { OAF_TYPES_ACTION, OAF_STATUTS } from "@/data/diag-export";
import { PAYS } from "@/data/pays";
import { Plus, Trash2, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OafAction {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  montantPrevisionnel: number;
  montantRealise: number;
  commentaire: string;
}

interface OafPays {
  code: string;
  nom: string;
  ca: number;
  actions: OafAction[];
}

interface Props {
  prestationId: string;
  oaf: any;
  onUpdate: () => void;
}

export function OafEditor({ prestationId, oaf, onUpdate }: Props) {
  const { addToast } = useToast();
  const [dateDebut, setDateDebut] = useState(oaf?.dateDebut?.split("T")[0] || "");
  const [dateFin, setDateFin] = useState(oaf?.dateFin?.split("T")[0] || "");
  const [paysActions, setPaysActions] = useState<OafPays[]>(oaf?.paysActions || []);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedPays, setExpandedPays] = useState<Set<string>>(new Set(paysActions.map((p: OafPays) => p.code)));
  const [showAddPays, setShowAddPays] = useState(false);
  const [newPaysCode, setNewPaysCode] = useState("");

  const save = useCallback(async (data: { dateDebut?: string; dateFin?: string; paysActions?: OafPays[] }) => {
    setSaving(true);
    try {
      await fetch(`/api/prestations/${prestationId}/oaf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setLastSaved(new Date());
    } catch {
      addToast("error", "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [prestationId, addToast]);

  const savePeriod = () => {
    save({ dateDebut: dateDebut || undefined, dateFin: dateFin || undefined });
  };

  const savePaysActions = (updated: OafPays[]) => {
    setPaysActions(updated);
    save({ paysActions: updated });
  };

  const addPays = () => {
    if (!newPaysCode) return;
    const pays = PAYS.find((p) => p.code === newPaysCode);
    if (!pays) return;
    if (paysActions.some((p) => p.code === newPaysCode)) {
      addToast("error", "Ce pays est déjà ajouté");
      return;
    }
    const updated = [...paysActions, { code: pays.code, nom: pays.nom, ca: 0, actions: [] }];
    savePaysActions(updated);
    setExpandedPays((prev) => { const next = new Set(prev); next.add(pays.code); return next; });
    setShowAddPays(false);
    setNewPaysCode("");
  };

  const removePays = (code: string) => {
    if (!confirm("Supprimer ce pays et toutes ses actions ?")) return;
    savePaysActions(paysActions.filter((p) => p.code !== code));
  };

  const updatePaysCa = (code: string, ca: number) => {
    const updated = paysActions.map((p) => p.code === code ? { ...p, ca } : p);
    savePaysActions(updated);
  };

  const addAction = (paysCode: string) => {
    const newAction: OafAction = {
      id: Math.random().toString(36).slice(2),
      type: OAF_TYPES_ACTION[0],
      dateDebut: "",
      dateFin: "",
      statut: "PREVU",
      montantPrevisionnel: 0,
      montantRealise: 0,
      commentaire: "",
    };
    const updated = paysActions.map((p) =>
      p.code === paysCode ? { ...p, actions: [...p.actions, newAction] } : p
    );
    savePaysActions(updated);
  };

  const updateAction = (paysCode: string, actionId: string, field: string, value: any) => {
    const updated = paysActions.map((p) => {
      if (p.code !== paysCode) return p;
      return {
        ...p,
        actions: p.actions.map((a) => a.id === actionId ? { ...a, [field]: value } : a),
      };
    });
    savePaysActions(updated);
  };

  const removeAction = (paysCode: string, actionId: string) => {
    const updated = paysActions.map((p) => {
      if (p.code !== paysCode) return p;
      return { ...p, actions: p.actions.filter((a) => a.id !== actionId) };
    });
    savePaysActions(updated);
  };

  const togglePays = (code: string) => {
    setExpandedPays((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  // Totals
  const totalPrevisionnel = paysActions.reduce((sum, p) => sum + p.actions.reduce((s, a) => s + (a.montantPrevisionnel || 0), 0), 0);
  const totalRealise = paysActions.reduce((sum, p) => sum + p.actions.reduce((s, a) => s + (a.montantRealise || 0), 0), 0);

  const typeOptions = OAF_TYPES_ACTION.map((t) => ({ value: t, label: t }));
  const statutOptions = OAF_STATUTS.map((s) => ({ value: s.value, label: s.label }));
  const paysOptions = PAYS.map((p) => ({ value: p.code, label: p.nom }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />
      </div>

      {/* Period + Totals */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Date début" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} onBlur={savePeriod} />
            <Input label="Date fin" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} onBlur={savePeriod} />
            <div className="bg-primary-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Budget prévisionnel</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalPrevisionnel)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Budget réalisé</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(totalRealise)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add pays */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setShowAddPays(!showAddPays)}>
          <Plus className="h-4 w-4" />
          Ajouter un pays
        </Button>
        {showAddPays && (
          <div className="flex items-center gap-2">
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={newPaysCode}
              onChange={(e) => setNewPaysCode(e.target.value)}
            >
              <option value="">Sélectionner un pays...</option>
              {paysOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <Button size="sm" onClick={addPays}>Ajouter</Button>
          </div>
        )}
      </div>

      {/* Pays blocks */}
      {paysActions.map((pays) => {
        const paysPrev = pays.actions.reduce((s, a) => s + (a.montantPrevisionnel || 0), 0);
        const paysReal = pays.actions.reduce((s, a) => s + (a.montantRealise || 0), 0);
        const isExpanded = expandedPays.has(pays.code);

        return (
          <Card key={pays.code}>
            <CardContent>
              {/* Pays header */}
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-2" onClick={() => togglePays(pays.code)}>
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{pays.nom}</h3>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className="flex items-center gap-4 text-sm">
                  <span>Prévu: <strong>{formatCurrency(paysPrev)}</strong></span>
                  <span>Réalisé: <strong className="text-green-600">{formatCurrency(paysReal)}</strong></span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">CA pays:</label>
                    <input
                      type="number"
                      className="w-28 text-sm border border-gray-300 rounded px-2 py-1"
                      value={pays.ca || ""}
                      onChange={(e) => updatePaysCa(pays.code, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button onClick={() => removePays(pays.code)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <>
                  {/* Actions table */}
                  {pays.actions.length > 0 && (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 font-medium text-gray-600">Type</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-600">Période</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-600">Statut</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-600">Prévu (€)</th>
                            <th className="text-right py-2 px-2 font-medium text-gray-600">Réalisé (€)</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-600">Commentaire</th>
                            <th className="py-2 px-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pays.actions.map((action) => {
                            const statut = OAF_STATUTS.find((s) => s.value === action.statut);
                            return (
                              <tr key={action.id} className="border-b border-gray-100">
                                <td className="py-2 px-2">
                                  <select
                                    className="text-xs border border-gray-200 rounded px-1 py-1 w-full"
                                    value={action.type}
                                    onChange={(e) => updateAction(pays.code, action.id, "type", e.target.value)}
                                  >
                                    {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="flex gap-1">
                                    <input type="date" className="text-xs border border-gray-200 rounded px-1 py-1" value={action.dateDebut} onChange={(e) => updateAction(pays.code, action.id, "dateDebut", e.target.value)} />
                                    <input type="date" className="text-xs border border-gray-200 rounded px-1 py-1" value={action.dateFin} onChange={(e) => updateAction(pays.code, action.id, "dateFin", e.target.value)} />
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <select
                                    className="text-xs border rounded px-1 py-1"
                                    style={{ borderColor: statut?.color, color: statut?.color }}
                                    value={action.statut}
                                    onChange={(e) => updateAction(pays.code, action.id, "statut", e.target.value)}
                                  >
                                    {statutOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                </td>
                                <td className="py-2 px-2">
                                  <input type="number" className="text-xs border border-gray-200 rounded px-1 py-1 w-24 text-right" value={action.montantPrevisionnel || ""} onChange={(e) => updateAction(pays.code, action.id, "montantPrevisionnel", parseFloat(e.target.value) || 0)} />
                                </td>
                                <td className="py-2 px-2">
                                  <input type="number" className="text-xs border border-gray-200 rounded px-1 py-1 w-24 text-right" value={action.montantRealise || ""} onChange={(e) => updateAction(pays.code, action.id, "montantRealise", parseFloat(e.target.value) || 0)} />
                                </td>
                                <td className="py-2 px-2">
                                  <input type="text" className="text-xs border border-gray-200 rounded px-1 py-1 w-full" placeholder="..." value={action.commentaire} onChange={(e) => updateAction(pays.code, action.id, "commentaire", e.target.value)} />
                                </td>
                                <td className="py-2 px-2">
                                  <button onClick={() => removeAction(pays.code, action.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" onClick={() => addAction(pays.code)}>
                    <Plus className="h-4 w-4" />
                    Ajouter une action
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      {paysActions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Ajoutez un pays cible pour commencer</p>
        </div>
      )}
    </div>
  );
}
