# Kwatro

Trouver des joueurs et des lieux pour jouer aux TCG et aux jeux de société, près de chez soi.

Monorepo TypeScript : app mobile (Expo), site public (Next.js), API (NestJS + PostgreSQL/PostGIS via Prisma), code partagé.

```
kwatro/
├── apps/
│   ├── api/        → API NestJS, Prisma (schéma, migrations, seed)        http://localhost:3000
│   ├── web/        → site public Next.js (SEO : ville, lieux, événements)   http://localhost:3010
│   └── mobile/     → app Expo iOS / Android (+ back-office lieu)            Expo : http://localhost:8081
├── packages/
│   ├── shared/         → types, schémas Zod, constantes, règles (Kwote…)
│   └── design-system/  → design system « Plateau pop » (tokens + composants RN, mobile et web)   catalogue : /design-system
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
pnpm db:seed                 # jeux, lieux, événements, rooms et comptes de test
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
| `pnpm api:generate` | Régénérer l'OpenAPI et le client typé (`packages/api-client`) après un changement de route |

## API : ajouter une route

Documentation interactive en dev : http://localhost:3000/docs (OpenAPI brut : `/openapi.json`).

1. **Schémas dans `packages/shared`** (Zod) : ce que l'API reçoit et ce qu'elle renvoie, partagés avec l'app.
2. **Contrôleur** : `@ZodBody(schema)` valide le corps (400 détaillé sinon), `@ZodResponse(schema)` documente la réponse **et retire tout champ non déclaré** (rien ne fuit par erreur). Voir `apps/api/src/common/zod.ts`.
3. **Permissions** : toute route exige un utilisateur connecté par défaut ; `@Public()` pour l'ouvrir, `@Roles('ADMIN')` pour la restreindre, `@CurrentUser()` pour lire l'utilisateur (`apps/api/src/auth/`). Les règles fines (mineurs, staff d'un lieu, hôte d'une room) vont dans des guards dédiés, avec des tests.
4. `pnpm api:generate` (la CI échoue si le client n'est pas à jour), puis côté app une requête ou une mutation TanStack Query dans `apps/mobile/src/queries/` (voir `CONTRIBUTING.md`, « App : données de l'API »).

> **Connexion** : Better Auth (`apps/api/src/auth/better-auth.ts`), routes sous `/api/auth/*` (inscription et connexion e-mail + mot de passe, Apple, Google), session en cookie stockée dans Postgres ; côté app, `authClient` (`apps/mobile/src/lib/auth.ts`). Apple et Google ne s'activent que si leurs variables sont renseignées (voir `.env.example`). Après une première connexion Apple / Google, l'app demande la date de naissance (`POST /me/birth-date`).
>
> En dev, l'en-tête `x-dev-user-id: <id d'un User>` connecte aussi un compte du seed (`DEV_AUTH_HEADER=true`, refusé en production). Bouton « Authorize » dans `/docs`. Le seed (fictif, dates recalculées à chaque `pnpm db:seed`) crée 5 lieux bordelais, une vingtaine d'événements, des rooms à venir et passées, et des comptes de test qui se connectent dans l'app par e-mail :
>
> | E-mail | Mot de passe | Id (`x-dev-user-id`) | Pour tester |
> |---|---|---|---|
> | `player@kwatro.dev` | `Player123!` | `joueur-demo` | Joueur complet : profil, Kwote, parties à venir et historique |
> | `admin@kwatro.dev` | `Admin123!` | `admin-demo` | Admin Kwatro |
> | `staff@kwatro.dev` | `Staff123!` | `staff-demo` | Gérant du Dé Fêlé |
> | `mineur@kwatro.dev` | `Mineur123!` | `mineur-demo` | Joueur de 16 ans |
> | `nouveau@kwatro.dev` | `Nouveau123!` | `nouveau-demo` | Compte neuf : l'app ouvre l'onboarding |
>
> Les autres joueurs (`maya@kwatro.dev`, `sam@kwatro.dev`…) n'ont pas de mot de passe.

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
├── app/Dockerfile                → version web de l'app Expo, servie par nginx (+ nginx.conf)
├── dokploy/
│   └── docker-compose.dokploy.yml → déploiement Dokploy
├── .env.example                  → variables du déploiement Dokploy
└── scripts/restore-db-dump.sh    → restaurer une sauvegarde dans la base locale
```

**En local**
- `pnpm db:up` : profil `db`, PostgreSQL/PostGIS (port `5469`, modifiable avec `POSTGRES_PORT`) et Mailpit (http://localhost:8025). L'API et le site tournent avec `pnpm dev`.
- `pnpm docker:up` : profils `db` + `backend` + `frontend`, l'API (port 3000) et le site (port 3010) avec les images de production, pour vérifier un build avant de pousser.
- `pnpm db:restore <fichier>` : remplace la base locale par une sauvegarde (par ex. téléchargée depuis Dokploy).

**Déploiement avec Dokploy** : deux services Compose sur le même fichier, `kwatro-staging` et `kwatro-production`.
1. Dokploy › Create Service › **Compose** › dépôt `Suissehide/Kwatro`, branche `main`, *Compose Path* `./deploy/dokploy/docker-compose.dokploy.yml`. Désactiver **Autodeploy** : c'est la CI qui déclenche les déploiements.
2. Onglet **Environment** : recopier `deploy/.env.example` avec les vraies valeurs, propres à chaque environnement (`APP_IMAGE_NAME=kwatro-staging` pour le staging, secrets et domaines distincts).
3. Onglet **Domains** : un domaine pour `api` (port 3000), un pour `web` (port 3000) et un pour `app` (port 80), HTTPS activé. Le domaine de l'app doit figurer dans `CORS_ORIGINS`.
4. Les migrations Prisma en attente s'appliquent au démarrage de l'API.
5. Les variables `NEXT_PUBLIC_*` et `EXPO_PUBLIC_*` sont figées au build : relancer un Deploy après les avoir changées.
6. Sauvegardes : le service `postgres-backup` fait un `pg_dump` quotidien (7 jours, 4 semaines, 6 mois) dans le volume `postgres-backups`. Copie hors serveur à ajouter.

**CI/CD** (`.github/workflows/deploy.yml`)
- Staging : déployé automatiquement à chaque CI verte sur `main`.
- Production : Actions › **Deploy** › *Run workflow* sur `main`.
- Configuration GitHub (Settings › Environments) : deux environnements `staging` et `production` (ajouter des *required reviewers* sur `production` si besoin), chacun avec les variables `DOKPLOY_URL` (ex. `https://dokploy.exemple.fr`) et `DOKPLOY_COMPOSE_ID` (dans l'URL du service Dokploy) et le secret `DOKPLOY_API_KEY` (Dokploy › Settings › Profile › API/CLI).

**Apps iOS / Android (EAS)** : build et envoi aux stores dans le cloud d'Expo, rien à installer sur le serveur.
- Une seule fois, depuis `apps/mobile` : `npx eas-cli login`, `npx eas-cli init` (lie le projet, indispensable aux push), puis `npx eas-cli update:configure` (URL des mises à jour OTA).
- URL de l'API par environnement EAS (`preview` → API de staging, `production` → API de prod) : `npx eas-cli env:create --environment production --name EXPO_PUBLIC_API_URL --value https://api.exemple.fr --visibility plaintext` (idem pour `EXPO_PUBLIC_SITE_URL`).
- Identifiants des stores pour `--auto-submit` : `npx eas-cli credentials` (clé API App Store Connect, compte de service Google Play).
- GitHub : secret `EXPO_TOKEN` (expo.dev › Access tokens) au niveau du dépôt.
- `.github/workflows/mobile.yml` : mise à jour OTA du canal `preview` après chaque CI verte sur `main` ; Actions › **Mobile** › *Run workflow* pour la production, `update` (OTA, quelques minutes, JS seulement) ou `build` (nouveau binaire envoyé à TestFlight et au test interne Play Store).
- Un nouveau `build` est nécessaire dès que le code natif change (module natif, permission, plugin) : la *runtime version* (empreinte du natif) empêche une OTA d'atteindre un binaire incompatible.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Tickets : espace Notion Kwatro. Documentation : vault Obsidian Qwetle, `05-Technique/TCG/`.
