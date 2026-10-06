# Lucko

Trouver des joueurs et des lieux pour jouer aux TCG et aux jeux de société, près de chez soi.

Monorepo TypeScript : app mobile (Expo), site public (Next.js), API (NestJS + PostgreSQL/PostGIS via Prisma), code partagé.

```
lucko/
├── apps/
│   ├── api/        → API NestJS, Prisma (schéma, migrations, seed)        http://localhost:3000
│   ├── web/        → site public Next.js (SEO : ville, lieux, événements)   http://localhost:3010
│   └── mobile/     → app Expo iOS / Android (+ back-office lieu)            Expo : http://localhost:8081
├── packages/
│   ├── shared/         → types, schémas Zod, constantes, règles (LK…)
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
> | `player@lucko.dev` | `Player123!` | `joueur-demo` | Joueur complet : profil, LK, parties à venir et historique |
> | `admin@lucko.dev` | `Admin123!` | `admin-demo` | Admin Lucko |
> | `staff@lucko.dev` | `Staff123!` | `staff-demo` | Gérant du Dé Fêlé |
> | `mineur@lucko.dev` | `Mineur123!` | `mineur-demo` | Joueur de 16 ans |
> | `nouveau@lucko.dev` | `Nouveau123!` | `nouveau-demo` | Compte neuf : l'app ouvre l'onboarding |
>
> Les autres joueurs (`maya@lucko.dev`, `sam@lucko.dev`…) n'ont pas de mot de passe.

## API : temps réel

Socket.IO sur le même port que l'API (`apps/api/src/realtime/realtime.gateway.ts`). Contrat Zod dans `packages/shared/src/schemas/realtime.ts`.

- **Connexion** : réservée aux joueurs connectés, refusée sinon (`connect_error` « Connexion requise »). Sur le web, le cookie de session part tout seul ; sur téléphone, l'app l'envoie dans `auth.cookie` (et `auth.devUserId` en dev, comme `x-dev-user-id`).
- **Canaux** : `{ type, id }`, avec `type` dans `room`, `event`, `room-chat` ou `event-chat` (chat, KWT-80).

| Message | Sens | Charge utile | Effet |
|---|---|---|---|
| `watch` | app → API | `{ type, id }` | Suivre un canal. Accusé `true`, ou `false` si le joueur n'y a pas droit |
| `unwatch` | app → API | `{ type, id }` | Ne plus suivre |
| `changed` | API → app | `{ type, id }` | La fiche a changé : l'app la recharge par HTTP |
| `chat:message` | API → app | `{ channel, message }` | Nouveau message (pas envoyé aux joueurs bloqués par l'auteur ou qui l'ont bloqué) |
| `chat:deleted` | API → app | `{ channel, messageId }` | Message supprimé |
| `chat:typing` | app → API → app | `{ channel }` puis `{ channel, pseudo }` | Saisie en cours, relayée aux autres lecteurs |

- **Droits** : une room seulement pour son hôte et ses joueurs (acceptés, en attente, liste d'attente), règles mineurs comprises. Un joueur qui part, est retiré ou refusé quitte le canal. Un événement pour tout joueur connecté qui peut le voir (âge minimum).
- `changed` ne porte aucune donnée : la fiche dépend de qui la lit (pseudos, candidatures). Les services l'émettent après le commit : `this.realtime.changed({ type: 'room', id })`.
- **Chat** : membres seulement (hôte et joueurs acceptés d'une room, inscrits et staff du lieu d'un événement), même règle que l'API HTTP (`apps/api/src/chat/chat.access.ts`). Quitter la room retire aussi du chat. L'envoi passe par HTTP (`POST /chats/:type/:id/messages`), le socket ne fait que diffuser.
- **Côté app** : `useRealtime(channel, queryKey, enabled)` (`apps/mobile/src/lib/realtime.ts`), déjà branché dans `useRoomQuery` et `useEventQuery` ; `useChannel` pour écouter d'autres événements (chat).
- **Nouveau canal** (chat, tournois) : ajouter le type à `channelSchema`, sa règle d'accès dans `canWatch`, puis émettre depuis le service.
- Une seule instance d'API : pour en lancer plusieurs, ajouter l'adaptateur Redis (`@socket.io/redis-adapter`), sinon un message émis par une instance n'atteint pas les clients des autres.

## Base de données

- Schéma : `apps/api/prisma/schema.prisma`. Client Prisma généré dans `apps/api/src/generated/` (non versionné). Depuis Prisma 7, `migrate dev` ne régénère plus le client tout seul : les scripts `db:migrate`, `db:seed` et `pnpm dev` le font pour toi ; sinon `pnpm db:generate`.
- **Toute modification du schéma passe par une migration** (`pnpm db:migrate --name ma_modif`) committée avec le code.
- PostGIS : la colonne `Venue.location` est de type `geography` (non géré nativement par Prisma) ; les requêtes géographiques passent par `$queryRaw`.

## Ajouter une dépendance

```bash
pnpm --filter @lucko/api add nom-du-paquet
pnpm --filter @lucko/mobile exec expo install nom-du-paquet   # côté Expo : toujours via expo install
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
- `pnpm docker:up` : profils `db` + `backend` + `frontend`, l'API (port 3000) et le site (port 3010) avec les images de production, pour vérifier un build avant de pousser.
- `pnpm db:restore <fichier>` : remplace la base locale par une sauvegarde (par ex. téléchargée depuis Dokploy).

**Déploiement avec Dokploy**
1. Dokploy › Create Service › **Compose** › dépôt `Suissehide/Kwatro`, branche `main`, *Compose Path* `./deploy/dokploy/docker-compose.dokploy.yml`.
2. Onglet **Environment** : recopier `deploy/.env.example` avec les vraies valeurs.
3. Onglet **Domains** : un domaine pour `api` (port 3000) et un pour `web` (port 3000), HTTPS activé.
4. **Deploy**. Les migrations Prisma en attente s'appliquent au démarrage de l'API.
5. Sauvegardes : le service `postgres-backup` fait un `pg_dump` quotidien (7 jours, 4 semaines, 6 mois) dans le volume `postgres-backups`. Copie hors serveur à ajouter.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Tickets : espace Notion Lucko. Documentation : vault Obsidian Qwetle, `05-Technique/TCG/`.
