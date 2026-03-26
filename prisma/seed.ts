import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.alerte.deleteMany();
  await prisma.historiqueModification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.diagExport.deleteMany();
  await prisma.oAF.deleteMany();
  await prisma.prestation.deleteMany();
  await prisma.projetUser.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("password123", 12);

  // === USERS ===
  const admin1 = await prisma.user.create({
    data: { nom: "Martin", prenom: "Pierre", email: "admin@cci-cvl.fr", password, role: "ADMIN", departement: "37" },
  });
  const admin2 = await prisma.user.create({
    data: { nom: "Dupont", prenom: "Marie", email: "marie.dupont@cci-cvl.fr", password, role: "ADMIN", departement: "45" },
  });
  const c1 = await prisma.user.create({
    data: { nom: "Bernard", prenom: "Jean", email: "jean.bernard@cci-cvl.fr", password, role: "CONSEILLER", departement: "18" },
  });
  const c2 = await prisma.user.create({
    data: { nom: "Petit", prenom: "Sophie", email: "sophie.petit@cci-cvl.fr", password, role: "CONSEILLER", departement: "28" },
  });
  const c3 = await prisma.user.create({
    data: { nom: "Robert", prenom: "Lucas", email: "lucas.robert@cci-cvl.fr", password, role: "CONSEILLER", departement: "36" },
  });
  const c4 = await prisma.user.create({
    data: { nom: "Richard", prenom: "Emma", email: "emma.richard@cci-cvl.fr", password, role: "CONSEILLER", departement: "41" },
  });
  const c5 = await prisma.user.create({
    data: { nom: "Moreau", prenom: "Thomas", email: "thomas.moreau@cci-cvl.fr", password, role: "CONSEILLER", departement: "45" },
  });

  console.log("✅ Users created");

  // === ENTREPRISES ===
  const e1 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Vins du Val de Loire SAS",
      siret: "12345678901234",
      effectif: 45,
      effectifExport: 8,
      ca: 5200000,
      caExport: 1560000,
      activite: "Production et négoce de vins de Loire",
      secteurs: ["Viticulture/Vins"],
      exportateur: "P1",
      implantations: ["GB", "BE", "DE"],
      ville: "Chinon",
      codePostal: "37500",
      departement: "37",
    },
  });
  const e2 = await prisma.entreprise.create({
    data: {
      raisonSociale: "TechPharma Industries",
      siret: "23456789012345",
      effectif: 120,
      effectifExport: 25,
      ca: 18000000,
      caExport: 7200000,
      activite: "Fabrication d'équipements pharmaceutiques",
      secteurs: ["Machines/Équipements industriels", "Santé/Medtech"],
      exportateur: "P2",
      implantations: ["US", "CN", "DE", "JP"],
      ville: "Orléans",
      codePostal: "45000",
      departement: "45",
    },
  });
  const e3 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Maison Beauce Cosmétiques",
      siret: "34567890123456",
      effectif: 22,
      effectifExport: 3,
      ca: 3100000,
      caExport: 310000,
      activite: "Cosmétiques bio et naturels",
      secteurs: ["Cosmétique/Beauté"],
      exportateur: "PRIMO",
      implantations: [],
      ville: "Chartres",
      codePostal: "28000",
      departement: "28",
    },
  });
  const e4 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Berry Mécanique Précision",
      siret: "45678901234567",
      effectif: 65,
      effectifExport: 12,
      ca: 8500000,
      caExport: 2550000,
      activite: "Usinage de précision pour l'aéronautique",
      secteurs: ["Mécanique/Métallurgie", "Aéronautique/Défense"],
      exportateur: "P1",
      implantations: ["DE", "IT"],
      ville: "Bourges",
      codePostal: "18000",
      departement: "18",
    },
  });
  const e5 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Sologne Numérique",
      siret: "56789012345678",
      effectif: 15,
      effectifExport: 4,
      ca: 1800000,
      caExport: 450000,
      activite: "Solutions SaaS pour l'industrie",
      secteurs: ["Numérique/Tech"],
      exportateur: "P0",
      implantations: ["BE"],
      ville: "Blois",
      codePostal: "41000",
      departement: "41",
    },
  });
  const e6 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Les Jardins de Touraine",
      siret: "67890123456789",
      effectif: 30,
      ca: 4200000,
      activite: "Production de semences et plants",
      secteurs: ["Semences/Agrofourniture", "Fruits/Légumes"],
      exportateur: "PRIMO",
      ville: "Tours",
      codePostal: "37000",
      departement: "37",
    },
  });
  const e7 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Châteauroux Textile",
      siret: "78901234567890",
      effectif: 50,
      effectifExport: 10,
      ca: 6000000,
      caExport: 1200000,
      activite: "Fabrication de textiles techniques",
      secteurs: ["Mode/Textile"],
      exportateur: "P1",
      implantations: ["MA", "TN"],
      ville: "Châteauroux",
      codePostal: "36000",
      departement: "36",
    },
  });
  const e8 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Énergie Beauce Environnement",
      siret: "89012345678901",
      effectif: 35,
      ca: 9500000,
      caExport: 1900000,
      activite: "Solutions de traitement des déchets industriels",
      secteurs: ["Énergie/Environnement"],
      exportateur: "P0",
      ville: "Dreux",
      codePostal: "28100",
      departement: "28",
    },
  });
  const e9 = await prisma.entreprise.create({
    data: {
      raisonSociale: "Loire Valley Gourmet",
      siret: "90123456789012",
      effectif: 18,
      effectifExport: 5,
      ca: 2800000,
      caExport: 840000,
      activite: "Produits gastronomiques et épicerie fine",
      secteurs: ["Alimentation/Boissons", "Agroalimentaire transformé"],
      exportateur: "P1",
      implantations: ["GB", "US", "JP"],
      ville: "Amboise",
      codePostal: "37400",
      departement: "37",
    },
  });
  const e10 = await prisma.entreprise.create({
    data: {
      raisonSociale: "FormaPro Conseil",
      siret: "01234567890123",
      effectif: 8,
      ca: 950000,
      activite: "Formation professionnelle et conseil en management",
      secteurs: ["Formation/Éducation", "Conseil/Audit"],
      exportateur: "PRIMO",
      ville: "Montargis",
      codePostal: "45200",
      departement: "45",
    },
  });

  console.log("✅ Entreprises created");

  // === PROJETS ===
  const p1 = await prisma.projet.create({
    data: {
      titre: "Développement export UK & Benelux",
      type: "EXPORT",
      description: "<p>Projet de développement commercial sur les marchés britannique et du Benelux pour les vins de Loire.</p>",
      entrepriseId: e1.id,
      secteurClient: ["Viticulture/Vins"],
      paysExportEnCours: ["GB"],
      paysExportCibles: ["BE", "NL", "LU"],
      createdBy: c5.id,
      utilisateurs: { create: [{ userId: c5.id }, { userId: admin1.id }] },
    },
  });
  const p2 = await prisma.projet.create({
    data: {
      titre: "Implantation bureau commercial Allemagne",
      type: "IMPLANTATION",
      description: "<p>Ouverture d'un bureau de représentation à Francfort pour développer le marché DACH.</p>",
      entrepriseId: e2.id,
      secteurClient: ["Machines/Équipements industriels"],
      paysExportEnCours: ["DE", "US"],
      paysExportCibles: ["AT", "CH"],
      createdBy: admin2.id,
      utilisateurs: { create: [{ userId: admin2.id }, { userId: c5.id }] },
    },
  });
  const p3 = await prisma.projet.create({
    data: {
      titre: "Primo export cosmétiques bio",
      type: "EXPORT",
      description: "<p>Accompagnement primo-export pour les gammes cosmétiques bio vers l'Europe du Sud.</p>",
      entrepriseId: e3.id,
      secteurClient: ["Cosmétique/Beauté"],
      paysExportEnCours: [],
      paysExportCibles: ["ES", "IT", "PT"],
      createdBy: c2.id,
      utilisateurs: { create: [{ userId: c2.id }] },
    },
  });
  const p4 = await prisma.projet.create({
    data: {
      titre: "Sourcing fournisseurs Asie",
      type: "SOURCING",
      description: "<p>Identification de fournisseurs en Asie pour les composants mécaniques.</p>",
      entrepriseId: e4.id,
      secteurClient: ["Mécanique/Métallurgie"],
      paysExportEnCours: ["DE"],
      paysExportCibles: ["CN", "VN", "TH"],
      createdBy: c1.id,
      utilisateurs: { create: [{ userId: c1.id }, { userId: c3.id }] },
    },
  });
  const p5 = await prisma.projet.create({
    data: {
      titre: "Expansion SaaS Europe",
      type: "EXPORT",
      description: "<p>Déploiement de la solution SaaS sur les marchés européens francophones et germanophones.</p>",
      entrepriseId: e5.id,
      secteurClient: ["Numérique/Tech"],
      paysExportEnCours: ["BE"],
      paysExportCibles: ["CH", "DE", "LU"],
      createdBy: c4.id,
      utilisateurs: { create: [{ userId: c4.id }] },
    },
  });

  console.log("✅ Projets created");

  // === PRESTATIONS ===
  // DiagExport for p3
  const prest1 = await prisma.prestation.create({
    data: {
      type: "DIAG_EXPORT",
      projetId: p3.id,
      createdBy: c2.id,
      diagExport: {
        create: {
          criteres: {
            etendue_gamme: { note: 3, commentaire: "Gamme complète de soins visage et corps" },
            prestations_associees: { note: 2, commentaire: "Échantillons disponibles, pas de service après-vente structuré" },
            avantages_concurrentiels: { note: 4, commentaire: "Certification bio, ingrédients locaux, packaging premium" },
            politique_prix: { note: 2, commentaire: "Prix élevé, nécessite un repositionnement pour certains marchés" },
            saisonnalite_ventes: { note: 3, commentaire: "Pic de ventes à Noël et fête des mères" },
            innovation_differenciation: { note: 4, commentaire: "Formulations uniques, brevets déposés" },
            diversification_clients: { note: 1, commentaire: "Dépendance forte au marché français" },
            attentes_utilisateurs: { note: 3, commentaire: "Bonne connaissance du marché bio français" },
            segmentation_marche: { note: 2, commentaire: "Segmentation à affiner pour l'international" },
            canaux_distribution: { note: 1, commentaire: "Pas de réseau de distribution à l'export" },
            normes_reglementations: { note: 2, commentaire: "Conformité EU OK, hors EU à vérifier" },
            conditions_acces: { note: 2, commentaire: "Études de marché nécessaires" },
            connaissance_pays: { note: 1, commentaire: "Très faible connaissance des marchés cibles" },
            veille_concurrentielle: { note: 2, commentaire: "Veille sommaire sur les concurrents internationaux" },
            positionnement_concurrence: { note: 3, commentaire: "Bon positionnement premium/bio" },
            presence_salons: { note: 1, commentaire: "Aucune participation à des salons internationaux" },
            references_clients: { note: 1, commentaire: "Pas de références export" },
            notoriete_internationale: { note: 1, commentaire: "Marque inconnue à l'international" },
            situation_financiere: { note: 3, commentaire: "Trésorerie saine, capacité d'investissement modérée" },
            ebe: { note: 3, commentaire: "EBE positif et stable" },
            budget_export: { note: 1, commentaire: "Aucun budget export dédié" },
            outils_communication: { note: 2, commentaire: "Site web en français uniquement" },
            motivation_dirigeant: { note: 4, commentaire: "Forte motivation et vision internationale" },
            competences_export: { note: 1, commentaire: "Aucune compétence export en interne" },
            maitrise_langues: { note: 2, commentaire: "Anglais courant du dirigeant, pas d'espagnol" },
            logistique_internationale: { note: 1, commentaire: "Aucune expérience logistique export" },
            securisation_paiements: { note: 1, commentaire: "Aucune connaissance des moyens de paiement internationaux" },
          },
          restitution: {
            swot: {
              forces: [
                { text: "Gamme bio certifiée avec formulations uniques", cotation: 2 },
                { text: "Motivation forte du dirigeant", cotation: 2 },
                { text: "Packaging premium et positionnement haut de gamme", cotation: 1 },
                { text: "Situation financière saine", cotation: 1 },
              ],
              faiblesses: [
                { text: "Aucune expérience export", cotation: -2 },
                { text: "Pas de budget export dédié", cotation: -2 },
                { text: "Site web non traduit", cotation: -1 },
                { text: "Pas de réseau de distribution internationale", cotation: -2 },
              ],
              opportunites: [
                { text: "Forte demande cosmétiques bio en Europe du Sud", cotation: 2 },
                { text: "Label Made in France très valorisé", cotation: 2 },
                { text: "Marché espagnol en croissance sur le bio", cotation: 1 },
              ],
              menaces: [
                { text: "Concurrence forte des marques italiennes bio", cotation: -1 },
                { text: "Réglementations variables selon les pays", cotation: -1 },
                { text: "Fluctuation des coûts matières premières", cotation: -1 },
              ],
            },
            preconisations: {
              offres: "<p>Adapter les contenances et le packaging pour les marchés sud-européens. Traduire les supports marketing en espagnol et italien.</p>",
              environnement: "<p>Réaliser des études de marché ciblées sur l'Espagne et l'Italie. Participer au salon Cosmoprof Bologna.</p>",
              ressources: "<p>Constituer un budget export de 50k€ minimum. Créer un site web multilingue.</p>",
              hommes: "<p>Recruter un VIE ou un assistant export. Former l'équipe aux incoterms et moyens de paiement internationaux.</p>",
            },
            commentaires: "<p>Entreprise avec un fort potentiel à l'export grâce à ses produits différenciants. L'accompagnement devra se concentrer sur la structuration de la démarche export et la formation de l'équipe. Un plan d'action sur 18 mois est recommandé.</p>",
          },
        },
      },
    },
  });

  // OAF for p1
  const prest2 = await prisma.prestation.create({
    data: {
      type: "OAF",
      projetId: p1.id,
      createdBy: c5.id,
      oaf: {
        create: {
          dateDebut: new Date("2025-01-01"),
          dateFin: new Date("2025-12-31"),
          paysActions: [
            {
              code: "GB",
              nom: "Royaume-Uni",
              ca: 450000,
              actions: [
                {
                  id: "a1",
                  type: "Mission de prospection individuelle",
                  dateDebut: "2025-02-15",
                  dateFin: "2025-02-20",
                  statut: "REALISE",
                  montantPrevisionnel: 5000,
                  montantRealise: 4800,
                  commentaire: "Rencontre importateurs Londres",
                },
                {
                  id: "a2",
                  type: "Salon",
                  dateDebut: "2025-05-12",
                  dateFin: "2025-05-15",
                  statut: "EN_COURS",
                  montantPrevisionnel: 12000,
                  montantRealise: 0,
                  commentaire: "London Wine Fair 2025",
                },
                {
                  id: "a3",
                  type: "Envoi d'échantillons",
                  dateDebut: "2025-03-01",
                  dateFin: "2025-03-15",
                  statut: "REALISE",
                  montantPrevisionnel: 2000,
                  montantRealise: 1850,
                  commentaire: "Échantillons pour 5 distributeurs londoniens",
                },
              ],
            },
            {
              code: "BE",
              nom: "Belgique",
              ca: 180000,
              actions: [
                {
                  id: "a4",
                  type: "Mission de prospection individuelle",
                  dateDebut: "2025-03-10",
                  dateFin: "2025-03-12",
                  statut: "REALISE",
                  montantPrevisionnel: 2500,
                  montantRealise: 2200,
                  commentaire: "Prospection Bruxelles et Anvers",
                },
                {
                  id: "a5",
                  type: "Recrutement agent-distributeur",
                  dateDebut: "2025-04-01",
                  dateFin: "2025-06-30",
                  statut: "EN_COURS",
                  montantPrevisionnel: 3000,
                  montantRealise: 500,
                  commentaire: "Recherche agent commercial Wallonie",
                },
              ],
            },
            {
              code: "NL",
              nom: "Pays-Bas",
              ca: 0,
              actions: [
                {
                  id: "a6",
                  type: "Étude de marché",
                  dateDebut: "2025-06-01",
                  dateFin: "2025-07-31",
                  statut: "PREVU",
                  montantPrevisionnel: 4000,
                  montantRealise: 0,
                  commentaire: "Étude de marché du vin bio aux Pays-Bas",
                },
                {
                  id: "a7",
                  type: "Mission collective",
                  dateDebut: "2025-09-15",
                  dateFin: "2025-09-18",
                  statut: "PREVU",
                  montantPrevisionnel: 3500,
                  montantRealise: 0,
                  commentaire: "Mission collective TFE Pays-Bas",
                },
              ],
            },
          ],
        },
      },
    },
  });

  // Additional prestations
  await prisma.prestation.create({
    data: { type: "OAF", projetId: p2.id, createdBy: admin2.id, oaf: { create: { paysActions: [] } } },
  });
  await prisma.prestation.create({
    data: { type: "DIAG_EXPORT", projetId: p4.id, createdBy: c1.id, diagExport: { create: { criteres: {} } } },
  });
  await prisma.prestation.create({
    data: { type: "DIAG_EXPORT", projetId: p5.id, createdBy: c4.id, diagExport: { create: { criteres: {} } } },
  });

  console.log("✅ Prestations created");

  // === HISTORIQUE ===
  await prisma.historiqueModification.create({
    data: { utilisateurId: c5.id, projetId: p1.id, action: "Création du projet", detail: { titre: p1.titre } },
  });
  await prisma.historiqueModification.create({
    data: { utilisateurId: c2.id, projetId: p3.id, action: "Création du projet", detail: { titre: p3.titre } },
  });
  await prisma.historiqueModification.create({
    data: { utilisateurId: c2.id, projetId: p3.id, prestationId: prest1.id, action: "Création prestation DIAG_EXPORT" },
  });

  console.log("✅ Historique created");
  console.log("🎉 Seeding complete!");
  console.log("");
  console.log("Test accounts:");
  console.log("  Admin:     admin@cci-cvl.fr / password123");
  console.log("  Admin 2:   marie.dupont@cci-cvl.fr / password123");
  console.log("  Conseiller: jean.bernard@cci-cvl.fr / password123");
  console.log("  Conseiller: sophie.petit@cci-cvl.fr / password123");
  console.log("  Conseiller: lucas.robert@cci-cvl.fr / password123");
  console.log("  Conseiller: emma.richard@cci-cvl.fr / password123");
  console.log("  Conseiller: thomas.moreau@cci-cvl.fr / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
