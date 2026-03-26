"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getDepartementNom } from "@/data/departements";
import { UserPlus, X } from "lucide-react";

export function ProjetUsersTab({ projet, onUpdate }: { projet: any; onUpdate: () => void }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const currentUserIds = projet.utilisateurs.map((u: any) => u.user.id);

  const { data: allUsers } = useQuery({
    queryKey: ["users-minimal"],
    queryFn: async () => {
      const res = await fetch("/api/users?minimal=true");
      return res.json();
    },
  });

  const availableUsers = (allUsers || []).filter((u: any) => !currentUserIds.includes(u.id));

  const updateUsers = async (userIds: string[]) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projets/${projet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: projet.titre,
          type: projet.type,
          entrepriseId: projet.entrepriseId,
          utilisateurs: userIds,
        }),
      });
      if (!res.ok) throw new Error();
      addToast("success", "Conseillers mis à jour");
      onUpdate();
    } catch {
      addToast("error", "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const addUser = (userId: string) => {
    updateUsers([...currentUserIds, userId]);
    setShowAdd(false);
  };

  const removeUser = (userId: string) => {
    if (currentUserIds.length <= 1) {
      addToast("error", "Le projet doit avoir au moins un conseiller");
      return;
    }
    updateUsers(currentUserIds.filter((id: string) => id !== userId));
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Conseillers assignés ({projet.utilisateurs.length})</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <UserPlus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {showAdd && availableUsers.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
            {availableUsers.map((u: any) => (
              <button
                key={u.id}
                onClick={() => addUser(u.id)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-sm"
              >
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {u.prenom[0]}{u.nom[0]}
                </div>
                <div>
                  <p className="font-medium">{u.prenom} {u.nom}</p>
                  <p className="text-xs text-gray-500">{getDepartementNom(u.departement)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {projet.utilisateurs.map((pu: any) => (
            <div key={pu.user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                  {pu.user.prenom[0]}{pu.user.nom[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{pu.user.prenom} {pu.user.nom}</p>
                  <p className="text-xs text-gray-500">{pu.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => removeUser(pu.user.id)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
