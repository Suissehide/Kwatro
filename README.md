# Kwatro

Trouver des joueurs et des lieux pour jouer aux TCG et aux jeux de société, près de chez soi.

Monorepo TypeScript : app mobile (Expo), site public (Next.js), API (NestJS + PostgreSQL/PostGIS via Prisma), code partagé.

```
kwatro/
├── apps/
│   ├── api/        → API NestJS, Prisma (schéma, migrations, seed)        http://localhost:3000
│   ├── web/        → site public Next.js (SEO : ville, lieux, événements)   http://localhost:3001
│   └── mobile/     → app Expo iOS / Android (+ back-office lieu)            Expo : http://localhost:8081
├── packages/
│   └── shared/     → types, schémas Zod, constantes, règles (Kwote…)
├── deploy/             → tout Docker : stack locale, Dockerfiles, déploiement Dokploy, scripts
├── biome.json          → lint + format (remplace ESLint et Prettier)
├── turbo.json          → orchestration des tâches
└── lefthook.yml        → hooks Git (Biome + format des commits)
```

## Prérequis

- **Node.js 22** (`nvm use` lit `.nvmrc`)
- **pnpm** via Corepack : `corepack enable` (la version est fixée dans `package.json`)
- **Docker** (pour PostgreSQL en local)
- Pour l'app : **Expo Go** sur ton téléphone, ou un simulateur iOS / émulateur Android
- VS Code : installer les extensions recommandées (Biome, Prisma, Expo)

## Démarrer

```bash
corepack enable
pnpm install                 # installe tout + les hooks Git
cp .env.example .env         # variables locales (ne jamais committer .env)
pnpm db:up                   # lance PostgreSQL/PostGIS et Mailpit
pnpm db:migrate              # crée/applique les migrations
pnpm db:seed                 # jeux, formats et un lieu de démo
pnpm dev                     # API + site + Expo en parallèle
```

Lancer une seule app : `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:mobile`.

Vérifier que tout marche : http://localhost:3000/health doit répondre `{"status":"ok","database":"up"}`, et http://localhost:3000/games lister les jeux.

> Sur un téléphone physique, mets l'IP locale de ton ordinateur dans `EXPO_PUBLIC_API_URL` (pas `localhost`).

## Commandes utiles

| Commande | Rôle |
|---|---|
| `pnpm check` / `pnpm check:fix` | Lint + format Biome (vérifier / corriger) |
| `pnpm typecheck` | Vérification TypeScript de tous les paquets |
| `pnpm test` | Tests (Vitest) |
| `pnpm build` | Build de tout le monorepo |
| `pnpm db:migrate` | Nouvelle migration après modification de `apps/api/prisma/schema.prisma` |
| `pnpm db:reset` | Repartir d'une base vide (migrations + seed) |
| `pnpm db:studio` | Explorer la base dans le navigateur |
| `pnpm db:down` | Arrêter les conteneurs |
| `pnpm db:restore <fichier>` | Restaurer une sauvegarde dans la base locale |

## Base de données

- Schéma : `apps/api/prisma/schema.prisma`. Client Prisma généré dans `apps/api/src/generated/` (non versionné). Depuis Prisma 7, `migrate dev` ne régénère plus le client tout seul : les scripts `db:migrate`, `db:seed` et `pnpm dev` le font pour toi ; sinon `pnpm db:generate`.
- **Toute modification du schéma passe par une migration** (`pnpm db:migrate --name ma_modif`) committée avec le code.
- PostGIS : la colonne `Venue.location` est de type `geography` (non géré nativement par Prisma) ; les requêtes géographiques passent par `$queryRaw`.

## Ajouter une dépendance

```bash
pnpm --filter @kwatro/api add nom-du-paquet
pnpm --filter @kwatro/mobile exec expo install nom-du-paquet   # côté Expo : toujours via expo install
```

## Docker

Tout ce qui concerne Docker est dans `deploy/` :

```
deploy/
├── compose.yaml                  → stack locale (profils db, backend, frontend)
├── api/Dockerfile                → image de production de l'API (+ Dockerfile.dockerignore)
├── web/Dockerfile                → image de production du site (+ Dockerfile.dockerignore)
├── dokploy/
│   └── docker-compose.dokploy.yml → déploiement Dokploy
├── .env.example                  → variables du déploiement Dokploy
└── scripts/restore-db-dump.sh    → restaurer une sauvegarde dans la base locale
```

**En local**
- `pnpm db:up` : profil `db`, PostgreSQL/PostGIS (port `5469`, modifiable avec `POSTGRES_PORT`) et Mailpit (http://localhost:8025). L'API et le site tournent avec `pnpm dev`.
- `pnpm docker:up` : profils `db` + `backend` + `frontend`, l'API (port 3000) et le site (port 3001) avec les images de production, pour vérifier un build avant de pousser.
- `pnpm db:restore <fichier>` : remplace la base locale par une sauvegarde (par ex. téléchargée depuis Dokploy).

**Déploiement avec Dokploy**
1. Dokploy › Create Service › **Compose** › dépôt `Suissehide/Kwatro`, branche `main`, *Compose Path* `./deploy/dokploy/docker-compose.dokploy.yml`.
2. Onglet **Environment** : recopier `deploy/.env.example` avec les vraies valeurs.
3. Onglet **Domains** : un domaine pour `api` (port 3000) et un pour `web` (port 3000), HTTPS activé.
4. **Deploy**. Les migrations Prisma en attente s'appliquent au démarrage de l'API.
5. Sauvegardes : le service `postgres-backup` fait un `pg_dump` quotidien (7 jours, 4 semaines, 6 mois) dans le volume `postgres-backups`. Copie hors serveur à ajouter.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Tickets : espace Notion Kwatro. Documentation : vault Obsidian Qwetle, `05-Technique/TCG/`.
