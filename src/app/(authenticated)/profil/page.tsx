"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getDepartementNom } from "@/data/departements";
import { User, Mail, Building, Shield } from "lucide-react";

export default function ProfilPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const user = session?.user;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("error", "Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      addToast("error", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        addToast("error", data.error || "Erreur lors du changement de mot de passe");
      } else {
        addToast("success", "Mot de passe modifié avec succès");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      addToast("error", "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Mon profil" }]} />
      <PageHeader title="Mon profil" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Informations personnelles</CardTitle>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">{user.prenom} {user.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Département</p>
                <p className="font-medium">{getDepartementNom(user.departement)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium">{user.role === "ADMIN" ? "Administrateur" : "Conseiller"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-4">Changer le mot de passe</CardTitle>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                type="password"
                label="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading}>
                Modifier le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
