export const SECTEURS = {
  "B2C": [
    "Mode/Textile",
    "Cosmétique/Beauté",
    "Alimentation/Boissons",
    "Maison/Décoration",
    "Sport/Loisirs",
    "Santé/Bien-être",
    "Bijouterie/Luxe",
  ],
  "B2B Industrie": [
    "Mécanique/Métallurgie",
    "Électronique/Électrique",
    "Chimie/Matériaux",
    "Énergie/Environnement",
    "BTP/Construction",
    "Aéronautique/Défense",
    "Automobile/Transport",
    "Machines/Équipements industriels",
  ],
  "B2B Services": [
    "Conseil/Audit",
    "Numérique/Tech",
    "Formation/Éducation",
    "Logistique/Transport",
    "Finance/Assurance",
    "Santé/Medtech",
    "Architecture/Ingénierie",
  ],
  "B2B Agro": [
    "Viticulture/Vins",
    "Céréales/Grandes cultures",
    "Élevage/Produits laitiers",
    "Fruits/Légumes",
    "Semences/Agrofourniture",
    "Équipements agricoles",
    "Agroalimentaire transformé",
  ],
} as const;

export type SecteurFamille = keyof typeof SECTEURS;

export const ALL_SECTEURS = Object.entries(SECTEURS).flatMap(([famille, secteurs]) =>
  secteurs.map((s) => ({ famille, secteur: s }))
);

export const FLAT_SECTEURS = Object.values(SECTEURS).flat();
