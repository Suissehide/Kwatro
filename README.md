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
├── docker-compose.yml  → local : PostgreSQL/PostGIS, Mailpit (+ profil « app » : API et site en conteneurs)
├── docker-compose.dokploy.yml → déploiement Dokploy (API, site, PostGIS, labels Traefik)
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
| `pnpm db:studio` | Explorer la base dans le navigateur |
| `pnpm db:down` | Arrêter les conteneurs |

## Base de données

- Schéma : `apps/api/prisma/schema.prisma`. Client Prisma généré dans `apps/api/src/generated/` (non versionné, régénéré par `pnpm db:generate`, lancé automatiquement par Turbo).
- **Toute modification du schéma passe par une migration** (`pnpm db:migrate --name ma_modif`) committée avec le code.
- PostGIS : la colonne `Venue.location` est de type `geography` (non géré nativement par Prisma) ; les requêtes géographiques passent par `$queryRaw`.

## Ajouter une dépendance

```bash
pnpm --filter @kwatro/api add nom-du-paquet
pnpm --filter @kwatro/mobile exec expo install nom-du-paquet   # côté Expo : toujours via expo install
```

## Docker

**En local**
- `pnpm db:up` : seulement PostgreSQL/PostGIS et Mailpit (http://localhost:8025) ; l'API et le site tournent avec `pnpm dev`.
- `pnpm docker:up` : en plus, l'API (port 3000) et le site (port 3001) construits avec les images de production, pour vérifier un déploiement avant de pousser.

**Déploiement avec Dokploy** (`docker-compose.dokploy.yml`)
1. Dokploy › Create Service › **Compose** › dépôt `Suissehide/Kwatro`, branche `main`, *Compose Path* `./docker-compose.dokploy.yml`.
2. Onglet **Environment** : recopier `.env.dokploy.example` avec les vraies valeurs (domaines, mot de passe Postgres, réseau / entrypoint / resolver Traefik du serveur).
3. DNS : `API_DOMAIN` et `WEB_DOMAIN` pointent vers le serveur.
4. **Deploy**. Les migrations Prisma en attente s'appliquent au démarrage de l'API (`prisma migrate deploy`).
5. Sauvegardes : activer les sauvegardes du volume `kwatro-postgres-data` (ou un `pg_dump` planifié) dans Dokploy.

Les domaines sont déclarés par des labels Traefik dans le fichier. Pour les gérer plutôt dans l'onglet *Domains* de Dokploy, supprimer ces labels.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Tickets : espace Notion Kwatro. Documentation : vault Obsidian Qwetle, `05-Technique/TCG/`.
