"use client";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ProjetDocumentsTab({ projetId, documents, onUpdate }: { projetId: string; documents: any[]; onUpdate: () => void }) {
  const { addToast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [titre, setTitre] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    formData.append("projetId", projetId);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      addToast("success", "Document ajouté");
      setTitre("");
      setCommentaire("");
      setShowUpload(false);
      if (fileRef.current) fileRef.current.value = "";
      onUpdate();
    } catch {
      addToast("error", "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Document supprimé");
      onUpdate();
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Documents ({documents.length})</h3>
          <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {showUpload && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <Input label="Titre *" value={titre} onChange={(e) => setTitre(e.target.value)} />
            <Input label="Commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
            <input type="file" ref={fileRef} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpload} loading={uploading}>Envoyer</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {documents.length === 0 && !showUpload && (
          <p className="text-sm text-gray-500 text-center py-8">Aucun document</p>
        )}

        <div className="space-y-2">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{doc.titre}</p>
                  <p className="text-xs text-gray-500">
                    {doc.fichierNom} • {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={doc.fichierUrl}
                  target="_blank"
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
