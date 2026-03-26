"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { DEPARTEMENTS } from "@/data/departements";
import { getDepartementNom } from "@/data/departements";
import { Plus, Edit, UserX, UserCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "CONSEILLER", label: "Conseiller" },
  { value: "ADMIN", label: "Administrateur" },
];

const DEPT_OPTIONS = DEPARTEMENTS.map((d) => ({ value: d.code, label: `${d.nom} (${d.code})` }));

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "", role: "CONSEILLER", departement: "" });
  const [loading, setLoading] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      return res.json();
    },
  });

  const openCreate = () => {
    setEditUser(null);
    setForm({ nom: "", prenom: "", email: "", password: "", role: "CONSEILLER", departement: "" });
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setForm({ nom: user.nom, prenom: user.prenom, email: user.email, password: "", role: user.role, departement: user.departement });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editUser ? `/api/users/${editUser.id}` : "/api/users";
      const method = editUser ? "PUT" : "POST";
      const body = editUser ? { ...form, ...(form.password ? {} : { password: undefined }) } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast("error", data.error || "Erreur");
        return;
      }

      addToast("success", editUser ? "Utilisateur modifié" : "Utilisateur créé");
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      addToast("error", "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user: any) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    if (res.ok) {
      addToast("success", user.active ? "Utilisateur désactivé" : "Utilisateur réactivé");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Administration" }, { label: "Utilisateurs" }]} />
      <PageHeader
        title="Gestion des utilisateurs"
        actions={
          <Button variant="secondary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Département</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Projets</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{u.prenom} {u.nom}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><Badge variant={u.role === "ADMIN" ? "error" : "info"}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-gray-600">{getDepartementNom(u.departement)}</td>
                <td className="px-4 py-3 text-gray-600">{u._count?.projets || 0}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.active ? "success" : "default"}>{u.active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100" title="Modifier">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => toggleActive(u)} className="p-1.5 rounded hover:bg-gray-100" title={u.active ? "Désactiver" : "Activer"}>
                      {u.active ? <UserX className="h-4 w-4 text-gray-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom *" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            <Input label="Nom *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label={editUser ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editUser} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Rôle" options={ROLE_OPTIONS} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <Select label="Département *" options={DEPT_OPTIONS} placeholder="Choisir..." value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={loading}>{editUser ? "Modifier" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
