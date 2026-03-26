export interface DiagCritere {
  id: string;
  label: string;
  thematique: string;
}

export const DIAG_THEMATIQUES = [
  {
    id: "offres",
    label: "Offres produits/services",
    criteres: [
      { id: "etendue_gamme", label: "Étendue de la gamme" },
      { id: "prestations_associees", label: "Prestations associées" },
      { id: "avantages_concurrentiels", label: "Avantages concurrentiels" },
      { id: "politique_prix", label: "Politique de prix" },
      { id: "saisonnalite_ventes", label: "Saisonnalité des ventes" },
      { id: "innovation_differenciation", label: "Innovation et différenciation" },
      { id: "diversification_clients", label: "Diversification clients" },
      { id: "attentes_utilisateurs", label: "Attentes utilisateurs finaux" },
      { id: "segmentation_marche", label: "Segmentation marché" },
      { id: "canaux_distribution", label: "Canaux de distribution" },
      { id: "normes_reglementations", label: "Normes et réglementations dans les pays visés" },
      { id: "conditions_acces", label: "Conditions d'accès aux marchés" },
    ],
  },
  {
    id: "environnement",
    label: "Environnement marchés/clients",
    criteres: [
      { id: "connaissance_pays", label: "Connaissance des pays cibles" },
      { id: "veille_concurrentielle", label: "Veille concurrentielle" },
      { id: "positionnement_concurrence", label: "Positionnement vs concurrence locale" },
      { id: "presence_salons", label: "Présence sur salons internationaux" },
      { id: "references_clients", label: "Références clients export" },
      { id: "notoriete_internationale", label: "Notoriété internationale" },
    ],
  },
  {
    id: "ressources",
    label: "Ressources",
    criteres: [
      { id: "situation_financiere", label: "Situation financière" },
      { id: "ebe", label: "EBE" },
      { id: "budget_export", label: "Budget alloué pour l'export" },
      { id: "outils_communication", label: "Outils de communication pour l'export" },
    ],
  },
  {
    id: "hommes",
    label: "Hommes/Compétences",
    criteres: [
      { id: "motivation_dirigeant", label: "Motivation du dirigeant" },
      { id: "competences_export", label: "Compétences export en interne" },
      { id: "maitrise_langues", label: "Maîtrise des langues étrangères" },
      { id: "logistique_internationale", label: "Maîtrise de la logistique internationale" },
      { id: "securisation_paiements", label: "Sécurisation des paiements internationaux" },
    ],
  },
] as const;

export const DIAG_NOTES = [
  { value: 0, label: "Non évalué", color: "#9CA3AF" },
  { value: 1, label: "Faible", color: "#EF4444" },
  { value: 2, label: "Insuffisant", color: "#F97316" },
  { value: 3, label: "Satisfaisant", color: "#84CC16" },
  { value: 4, label: "Excellent", color: "#22C55E" },
] as const;

export const OAF_TYPES_ACTION = [
  "Mission de prospection individuelle",
  "Mission collective",
  "Salon",
  "Envoi d'échantillons",
  "Formation",
  "Recrutement agent-distributeur",
  "E-commerce",
  "Étude de marché",
] as const;

export const OAF_STATUTS = [
  { value: "PREVU", label: "Prévu", color: "#3B82F6" },
  { value: "EN_COURS", label: "En cours", color: "#F59E0B" },
  { value: "REALISE", label: "Réalisé", color: "#22C55E" },
] as const;
