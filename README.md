# Pack Objectifs

Application web de gestion des projets export pour les conseillers CCI Centre Val-de-Loire (réseau Team France Export).

## Stack technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Query, Recharts
- **Backend** : Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth** : NextAuth.js v5 (credentials + JWT)
- **Éditeur** : TipTap (texte riche)
- **Déploiement** : Docker / Coolify sur VPS Hetzner

## Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd pack-objectifs

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma
npm run db:generate

# Appliquer le schéma sur la base de données
npm run db:push

# Peupler la base avec les données de test
npm run db:seed

# Lancer en développement
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/pack_objectifs` |
| `NEXTAUTH_SECRET` | Clé secrète pour JWT | Générer avec `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de l'application | `https://pack-objectifs.mondomaine.fr` |
| `UPLOAD_DIR` | Chemin pour les fichiers uploadés | `./uploads` |

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@cci-cvl.fr | password123 |
| Admin | marie.dupont@cci-cvl.fr | password123 |
| Conseiller | jean.bernard@cci-cvl.fr | password123 |
| Conseiller | sophie.petit@cci-cvl.fr | password123 |
| Conseiller | lucas.robert@cci-cvl.fr | password123 |
| Conseiller | emma.richard@cci-cvl.fr | password123 |
| Conseiller | thomas.moreau@cci-cvl.fr | password123 |

## Commandes

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Démarrer en production
npm run lint         # Linter
npm run db:generate  # Générer client Prisma
npm run db:push      # Appliquer le schéma
npm run db:migrate   # Créer une migration
npm run db:seed      # Peupler la base de données
npm run db:studio    # Interface Prisma Studio
```

## Déploiement avec Docker

```bash
# Build de l'image
docker build -t pack-objectifs .

# Lancer le conteneur
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/pack_objectifs" \
  -e NEXTAUTH_SECRET="votre-secret" \
  -e NEXTAUTH_URL="https://pack-objectifs.mondomaine.fr" \
  -e UPLOAD_DIR="/app/uploads" \
  -v pack-objectifs-uploads:/app/uploads \
  pack-objectifs
```

### Déploiement Coolify (Hetzner)

1. Créer un nouveau service "Docker" dans Coolify
2. Pointer vers le repository Git
3. Configurer les variables d'environnement
4. Le Dockerfile sera détecté automatiquement
5. Ajouter un volume persistant pour `/app/uploads`
6. Configurer le domaine et le certificat SSL

## Modules

- **Authentification** : Login, profil, gestion des sessions JWT
- **Entreprises** : CRUD, recherche, filtres, export CSV
- **Projets** : CRUD avec onglets (entreprise, infos, utilisateurs, documents, prestations)
- **Tableau de bord** : Mes projets, autres projets, KPIs
- **Diag'Export** : Questionnaire 27 critères, notation visuelle, auto-save, restitution SWOT, jauges, export PDF
- **OAF** : Actions par pays, timeline Gantt, graphiques prévisionnel/réalisé
- **Statistiques** : Filtres, graphiques Recharts, export CSV
- **Ressources** : Bibliothèque documentaire partagée
- **Notifications** : Alertes temps réel, historique des modifications
- **Administration** : Gestion des utilisateurs (admin uniquement)

## Structure du projet

```
src/
├── app/
│   ├── (authenticated)/     # Routes protégées
│   │   ├── dashboard/
│   │   ├── entreprises/
│   │   ├── projets/
│   │   ├── prestations/
│   │   ├── statistiques/
│   │   ├── ressources/
│   │   ├── notifications/
│   │   ├── admin/
│   │   └── profil/
│   ├── api/                 # API Routes
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── ui/                  # Composants UI réutilisables
│   ├── layout/              # Header, breadcrumb, etc.
│   ├── forms/               # TipTap editor
│   ├── entreprises/
│   ├── projets/
│   └── prestations/
├── data/                    # Données de référence (pays, secteurs, etc.)
├── lib/                     # Utilitaires (auth, prisma, validators)
├── hooks/
└── types/
```
