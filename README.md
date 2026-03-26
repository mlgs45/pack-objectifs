# Pack Objectifs

Application web de gestion des projets export pour les conseillers CCI Centre Val-de-Loire (réseau Team France Export).

## Stack technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Query, Recharts
- **Backend** : Next.js API Routes, Prisma 5 ORM, PostgreSQL 16
- **Auth** : NextAuth.js v5 (credentials + JWT, sessions 7 jours)
- **Éditeur** : TipTap (texte riche)
- **Design** : Dashboard premium — sidebar sombre, glassmorphism, gradients, cards avec profondeur
- **Déploiement** : Docker multi-stage / Coolify sur VPS Hetzner

## Infrastructure de production

```
┌─────────────────────────────┐      ┌─────────────────────────────┐
│       compute-01            │      │         data-01             │
│    (135.181.45.69)          │      │    (204.168.200.103)        │
│                             │      │                             │
│  ┌───────────────────────┐  │      │  ┌───────────────────────┐  │
│  │  Coolify (port 8000)  │  │      │  │  PostgreSQL 16        │  │
│  │  + Proxy (80/443)     │  │      │  │  Pack Objectifs (:5433)│ │
│  └───────────────────────┘  │      │  └───────────────────────┘  │
│  ┌───────────────────────┐  │      │  ┌───────────────────────┐  │
│  │  Pack Objectifs App   │──┼──────┼─▶│  Supabase DB (:5432)  │  │
│  │  (Docker, port 3000)  │  │      │  │  (autre projet)       │  │
│  └───────────────────────┘  │      │  └───────────────────────┘  │
└─────────────────────────────┘      └─────────────────────────────┘
```

### Sécurité infrastructure

| Mesure | compute-01 | data-01 |
|--------|-----------|---------|
| **Firewall (ufw)** | Ports 22, 80, 443, 8000 | Port 22 ouvert, ports 5433/8000 limités à IP de compute-01 |
| **Fail2ban** | ✅ Actif (SSH anti brute-force) | ✅ Actif (SSH anti brute-force) |
| **Backups Hetzner** | ✅ Niveau serveur | ✅ Niveau serveur |
| **Backups PostgreSQL** | — | ✅ pg_dump quotidien à 3h (rotation 30 jours) |

### Déploiement Coolify

L'application est déployée via **Coolify** avec GitHub App (auto-deploy sur push `main`).

**Projet Coolify** : Pack Objectifs (2 ressources)
- **Application** (sur compute-01) : Dockerfile détecté automatiquement, port 3000
- **PostgreSQL 16** (sur data-01) : port 5433 (5432 occupé par Supabase)

**Variables d'environnement** configurées dans Coolify :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL vers data-01:5433 |
| `NEXTAUTH_SECRET` | Clé secrète JWT (générée avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL publique de l'application |
| `AUTH_TRUST_HOST` | `true` (requis pour NextAuth v5 derrière un proxy) |
| `UPLOAD_DIR` | `/app/uploads` |

**Storage persistant** : `/data/pack-objectifs/uploads` → `/app/uploads`

### Initialisation de la base après déploiement

Depuis `compute-01`, copier le schéma et exécuter Prisma via un conteneur temporaire :

```bash
# Récupérer le container ID
docker ps | grep bycra39bt8wlteqmjn71tbj5

# Copier le schéma
docker cp <CONTAINER_ID>:/app/prisma/schema.prisma /tmp/schema.prisma

# Créer les tables
docker run --rm \
  -e DATABASE_URL="<DATABASE_URL>" \
  -v /tmp/schema.prisma:/app/prisma/schema.prisma \
  -w /app node:20-alpine \
  sh -c "apk add --no-cache openssl && npm install prisma@5 && npx prisma db push"

# Peupler avec les données de test
docker cp <CONTAINER_ID>:/app/prisma/seed.ts /tmp/seed.ts
docker run --rm \
  -e DATABASE_URL="<DATABASE_URL>" \
  -v /tmp/schema.prisma:/app/prisma/schema.prisma \
  -v /tmp/seed.ts:/app/prisma/seed.ts \
  -w /app node:20-alpine \
  sh -c "apk add --no-cache openssl && npm install prisma@5 @prisma/client@5 tsx bcryptjs && npx prisma generate && npx tsx prisma/seed.ts"
```

### Backups PostgreSQL

Script de backup automatique sur `data-01` :

```bash
# Emplacement : /backups/backup-pack-objectifs.sh
# Cron : tous les jours à 3h du matin
# Rétention : 30 jours
# Stockage : /backups/postgresql/pack_objectifs_YYYYMMDD_HHMMSS.sql.gz
```

## Développement local

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm

### Installation

```bash
# Cloner le repo
git clone https://github.com/mlgs45/pack-objectifs.git
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

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@cci-cvl.fr | password123 |
| Admin | marie.dupont@cci-cvl.fr | password123 |
| Conseiller | jean.bernard@cci-cvl.fr | password123 |
| Conseiller | sophie.petit@cci-cvl.fr | password123 |
| Conseiller | lucas.robert@cci-cvl.fr | password123 |
| Conseiller | emma.richard@cci-cvl.fr | password123 |
| Conseiller | thomas.moreau@cci-cvl.fr | password123 |

### Commandes

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

## Sécurité applicative

L'application a été auditée et corrigée pour 20 vulnérabilités :

### Mesures en place

- **Authentification** : NextAuth.js v5, bcrypt, JWT 7 jours
- **Autorisation** : Vérification rôle (ADMIN/CONSEILLER) + assignation projet sur chaque endpoint
- **Anti-IDOR** : Les conseillers ne peuvent modifier que les projets/prestations auxquels ils sont assignés
- **Upload sécurisé** : Allowlist d'extensions, limite 10 Mo, noms de fichiers sanitisés
- **Anti path traversal** : Validation que le chemin fichier reste dans le dossier uploads
- **Validation entrées** : Zod sur tous les endpoints mutants (POST/PUT)
- **Politique mot de passe** : 8 caractères minimum
- **Headers sécurité** : X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- **Pagination bornée** : Maximum 100 résultats par requête

### Axes d'amélioration futurs

- Rate limiting sur le login (anti brute-force applicatif)
- CSRF tokens sur les formulaires
- HTTPS avec domaine dédié + Let's Encrypt via Coolify

## Modules

- **Authentification** : Login, profil, changement de mot de passe, sessions JWT
- **Entreprises** : CRUD, recherche, filtres (département, secteur, exportateur), export CSV
- **Projets** : CRUD avec 5 onglets (entreprise, infos, utilisateurs, documents, prestations)
- **Tableau de bord** : KPIs gradient, mes projets, autres projets filtrables
- **Diag'Export** : Questionnaire 27 critères (4 thématiques), notation colorée 0-4, auto-save, restitution SWOT, jauges, préconisations TipTap
- **OAF** : Actions par pays cibles, vue liste + timeline Gantt + graphiques Recharts (prévisionnel vs réalisé)
- **Statistiques** : Vues par prestations/entreprises, filtres, graphiques (pie, bar), export CSV
- **Ressources** : Bibliothèque documentaire partagée avec recherche
- **Notifications** : Badge cloche temps réel, historique des modifications, mark as read
- **Administration** : Gestion des utilisateurs, création/édition/activation (admin uniquement)

## Design system

- **Layout** : Sidebar sombre avec gradient, top bar glassmorphism, navigation mobile en bottom bar
- **Couleurs** : Primaire #1B3A6B (bleu marine CCI), Accent #E8441A (rouge corail)
- **Composants** : Cards avec profondeur et hover, boutons gradient, badges ring-inset, tabs en pills, inputs rounded-xl
- **Logo** : Team France Export (SVG, inversé en blanc dans la sidebar)

## Structure du projet

```
src/
├── app/
│   ├── (authenticated)/     # Routes protégées (sidebar + top bar)
│   │   ├── dashboard/
│   │   ├── entreprises/
│   │   ├── projets/
│   │   ├── prestations/
│   │   ├── statistiques/
│   │   ├── ressources/
│   │   ├── notifications/
│   │   ├── admin/
│   │   └── profil/
│   ├── api/                 # 19 API Routes protégées
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── ui/                  # 13 composants UI réutilisables
│   ├── layout/              # Sidebar, top bar, breadcrumb
│   ├── forms/               # TipTap editor
│   ├── entreprises/
│   ├── projets/
│   └── prestations/
├── data/                    # Données de référence (244 pays, secteurs, départements CVL)
├── lib/                     # Auth, Prisma, validators, authorization, historique
├── hooks/
└── types/
```
