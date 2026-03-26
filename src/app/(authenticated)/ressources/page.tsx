"use client";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Search, Upload, FileText, Download, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { useCallback } from "react";

export default function RessourcesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [titre, setTitre] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const debouncedSetSearch = useCallback(
    debounce((val: string) => setDebouncedSearch(val), 300),
    []
  );

  const { data: documents, isLoading } = useQuery({
    queryKey: ["ressources", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ isRessource: "true" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/documents?${params}`);
      return res.json();
    },
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !titre) {
      addToast("error", "Fichier et titre requis");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("titre", titre);
    formData.append("commentaire", commentaire);
    formData.append("isRessource", "true");

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      addToast("success", "Ressource ajoutée");
      setTitre("");
      setCommentaire("");
      setShowUpload(false);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["ressources"] });
    } catch {
      addToast("error", "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Ressource supprimée");
      queryClient.invalidateQueries({ queryKey: ["ressources"] });
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Ressources" }]} />
      <PageHeader
        title="Ressources documentaires"
        description="Bibliothèque partagée de documents"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4" />
            Ajouter une ressource
          </Button>
        }
      />

      {showUpload && (
        <Card className="mb-6">
          <CardContent className="space-y-3">
            <Input label="Titre *" value={titre} onChange={(e) => setTitre(e.target.value)} />
            <Input label="Commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
            <input type="file" ref={fileRef} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpload} loading={uploading}>Envoyer</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou commentaire..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={search}
            onChange={(e) => { setSearch(e.target.value); debouncedSetSearch(e.target.value); }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.map((doc: any) => (
          <Card key={doc.id}>
            <CardContent className="flex items-start gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.titre}</p>
                {doc.commentaire && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{doc.commentaire}</p>}
                <p className="text-xs text-gray-400 mt-1">{doc.fichierNom} • {formatDate(doc.createdAt)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <a href={doc.fichierUrl} target="_blank" className="p-1.5 rounded hover:bg-gray-100">
                  <Download className="h-4 w-4 text-gray-500" />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune ressource trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
