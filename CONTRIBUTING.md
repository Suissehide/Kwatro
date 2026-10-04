# Contribuer à Kwatro

## Flux de travail

1. Prendre un ticket dans Notion (base 🎫 Tickets), le passer en **En cours** et s'assigner.
2. Créer une branche depuis `main` : `type/KWT-<n>-description-courte`
   ex. `feat/KWT-56-creer-une-room`, `fix/KWT-80-chat-notifications`
3. Commits au format **Conventional Commits** (vérifié par un hook) :
   `feat(api): créer une room`, `fix(mobile): …`, `chore: …`, `docs: …`, `refactor: …`, `test: …`
4. Ouvrir une Pull Request vers `main`, lier le ticket, passer le ticket en **En revue**.
5. La CI doit être verte (Biome, typecheck, tests, build) et **une relecture** est nécessaire avant de fusionner.
6. Fusion en *squash merge*, puis ticket en **Terminé**.

`main` doit toujours rester déployable : pas de commit direct dessus.

## Qualité du code

- **Biome** formate et lint tout le monorepo. Le hook `pre-commit` corrige automatiquement les fichiers modifiés ; en cas de doute : `pnpm check:fix`.
- **TypeScript strict** partout ; pas de `any` sans commentaire qui l'explique.
- Les **types et schémas partagés** (Zod) vont dans `packages/shared` : l'API valide avec les mêmes schémas que l'app.
- **La logique métier sensible reste dans l'API** : QR Kwatro, venues facturables, Kwote, XP, factures, règles mineurs. Jamais calculée côté app.
- Toute règle métier importante a un **test** (ex. `packages/shared/src/kwote.test.ts`).

## App : données de l'API (TanStack Query)

Toute donnée qui vient de l'API passe par **TanStack Query** (cache partagé entre écrans, rechargement, persistance). Pas de `fetch` ni d'`api.GET` dans un écran, pas de `useEffect` + `useState` pour charger des données.

- **Un fichier par entité** dans `apps/mobile/src/queries/` (`useMe.ts`, `useAgenda.ts`, `useExplore.ts`…), organisé en deux blocs :
  - `// * QUERIES` : un `xxxQueryOptions` (réutilisable par `fetchQuery`, `setQueryData`, `invalidateQueries`) et un hook `useXxxQuery()` pour les écrans ;
  - `// * MUTATIONS` : un hook `useXxxMutations()` qui renvoie les `useMutation` de l'entité et met le cache à jour (`setQueryData` avec la réponse, ou `invalidateQueries`).
- **Clés** : constantes dans `apps/mobile/src/constants/queryKeys.ts`, un objet par entité (`ME.GET`, `AGENDA.GET`…). Une requête paramétrée ajoute ses paramètres après la clé : `[AGENDA.GET, 'past']`.
- **Appels** : `unwrap(api.GET(…))` (`lib/queryClient.ts`) renvoie les données ou lève une `ApiError` avec le `status` : un écran teste `error instanceof ApiError && error.status === 409` pour un cas métier.
- **Réglages communs** dans `lib/queryClient.ts` : données fraîches 30 s, pas de nouvel essai sur une erreur 4xx, rechargement quand l'app revient au premier plan.
- **Persistance** : seul le joueur connecté (`ME.GET`) est gardé entre deux lancements (AsyncStorage, `localStorage` sur le web), pour afficher le profil sans attendre. Ajouter une requête à la persistance se décide au cas par cas (`dehydrateOptions` dans `lib/queryClient.ts`) : pas de donnée d'un autre joueur.
- **Écran réservé aux joueurs connectés** : `useMeQuery({ required: true })` renvoie vers `/auth` sur un 401. Changement de compte : `forgetMe()` ; suppression du compte : le cache est vidé.
- La connexion elle-même (inscription, Apple, Google, déconnexion) reste dans `authClient` (Better Auth, `lib/auth.ts`).
- **État propre à l'app** (filtres, préférences, brouillons partagés entre écrans) : pas dans TanStack Query. Le jour où il en faut un global, prendre **Zustand** ; d'ici là, `useState` dans l'écran.

## Base de données

- Ne jamais modifier une migration déjà fusionnée : en créer une nouvelle.
- Nommer les migrations clairement : `pnpm db:migrate --name ajout_tournois`.
- Aucune donnée personnelle réelle dans les seeds.

## Secrets

- Jamais de secret dans le code ni dans Git. Les variables sont décrites dans `.env.example` ; les vraies valeurs sont partagées via le gestionnaire de mots de passe de l'équipe.
