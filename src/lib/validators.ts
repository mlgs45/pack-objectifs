import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const entrepriseSchema = z.object({
  raisonSociale: z.string().min(1, "Raison sociale requise"),
  siret: z.string().optional().nullable(),
  dateCreation: z.string().optional().nullable(),
  effectif: z.coerce.number().int().optional().nullable(),
  effectifExport: z.coerce.number().int().optional().nullable(),
  ca: z.coerce.number().optional().nullable(),
  caExport: z.coerce.number().optional().nullable(),
  activite: z.string().optional().nullable(),
  secteurs: z.array(z.string()).default([]),
  exportateur: z.enum(["PRIMO", "P0", "P1", "P2"]).default("PRIMO"),
  implantations: z.array(z.string()).default([]),
  ville: z.string().optional().nullable(),
  codePostal: z.string().optional().nullable(),
  departement: z.string().min(1, "Département requis"),
});

export const projetSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  type: z.enum(["EXPORT", "SOURCING", "IMPLANTATION"]),
  description: z.string().optional().nullable(),
  entrepriseId: z.string().min(1, "Entreprise requise"),
  secteurClient: z.array(z.string()).default([]),
  paysExportEnCours: z.array(z.string()).default([]),
  paysExportCibles: z.array(z.string()).default([]),
  utilisateurs: z.array(z.string()).default([]),
});

export const prestationSchema = z.object({
  type: z.enum(["DIAG_EXPORT", "OBJECTIF_MARCHE", "OAF"]),
  projetId: z.string().min(1, "Projet requis"),
});

export const userSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum").optional(),
  role: z.enum(["ADMIN", "CONSEILLER"]).default("CONSEILLER"),
  departement: z.string().min(1, "Département requis"),
});

export const documentSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  commentaire: z.string().optional().nullable(),
  projetId: z.string().optional().nullable(),
  isRessource: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EntrepriseInput = z.infer<typeof entrepriseSchema>;
export type ProjetInput = z.infer<typeof projetSchema>;
export type PrestationInput = z.infer<typeof prestationSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
