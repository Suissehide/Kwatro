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
- **Pas d'émoji ni de glyphe Unicode comme pictogramme** (✓, ←, ▲, ◆, +…) dans l'interface : uniquement des icônes [Lucide](https://lucide.dev/icons) (`lucide-react-native` dans le design system et l'app Expo, `lucide-react` sur les pages HTML de `apps/web`).
- Toute règle métier importante a un **test** (ex. `packages/shared/src/kwote.test.ts`).

## App : données de l'API (TanStack Query)

Toute donnée qui vient de l'API passe par **TanStack Query** (cache partagé entre écrans, rechargement, persistance). Pas de `fetch` ni d'`api.GET` dans un écran, pas de `useEffect` + `useState` pour charger des données.

- **Un fichier par entité** dans `apps/mobile/src/queries/` (`useMe.ts`, `useAgenda.ts`, `useEvent.ts`, `useVenue.ts`, `useExplore.ts`, `useGeocode.ts`…), organisé en deux blocs :
  - `// * QUERIES` : un `xxxQueryOptions` (réutilisable par `fetchQuery`, `setQueryData`, `invalidateQueries`) et un hook `useXxxQuery()` pour les écrans ;
  - `// * MUTATIONS` : un hook `useXxxMutations()` qui renvoie les `useMutation` de l'entité et met le cache à jour : `setQueryData` avec la réponse puis `invalidateQueries` sur ce qui en dépend (ex. une inscription à un événement rafraîchit Mes parties et l'accueil, `useEvent.ts`).
- **Clés** : constantes dans `apps/mobile/src/constants/queryKeys.ts`, un objet par entité (`ME.GET`, `AGENDA.GET`…). Une requête paramétrée ajoute ses paramètres après la clé : `[AGENDA.GET, 'past']`.
- **Appels** : `unwrap(api.GET(…))` (`lib/queryClient.ts`) renvoie les données ou lève une `ApiError` avec le `status` et le `message` de l'API : un écran affiche `error.message`, ou teste `error instanceof ApiError && error.status === 409` pour un cas métier.
- **Services externes** (géocodage de l'IGN) : en requêtes aussi, avec `staleTime` infini ; hors d'un composant, `queryClient.fetchQuery(options)` profite du même cache (`findCity` dans `useGeocode.ts`).
- **Réglages communs** dans `lib/queryClient.ts` : données fraîches 30 s, pas de nouvel essai sur une erreur 4xx, rechargement quand l'app revient au premier plan.
- **Persistance** : seul le joueur connecté (`ME.GET`) est gardé entre deux lancements (AsyncStorage, `localStorage` sur le web), pour afficher le profil sans attendre. Ajouter une requête à la persistance se décide au cas par cas (`dehydrateOptions` dans `lib/queryClient.ts`) : pas de donnée d'un autre joueur.
- **Écran réservé aux joueurs connectés** : `useMeQuery({ required: true })` renvoie vers `/auth` sur un 401. Changement de compte : `forgetMe()` ; suppression du compte : le cache est vidé.
- La connexion elle-même (inscription, Apple, Google, déconnexion) reste dans `authClient` (Better Auth, `lib/auth.ts`).
- **État propre à l'app** (filtres, préférences, brouillons partagés entre écrans) : pas dans TanStack Query. Le jour où il en faut un global, prendre **Zustand** ; d'ici là, `useState` dans l'écran.

## App : formulaires (TanStack Form)

Tous les formulaires utilisent **TanStack Form**, sur le modèle de MediSync : pas de `useState` par champ ni de validation à la main.

- **Socle** : `apps/mobile/src/hooks/formContext.ts` (contextes) et `hooks/formConfig.tsx`, qui crée `useAppForm` et `withForm` avec les composants de champ du design system :
  - champs : `Text` (TextField), `Digits` (jour, mois, année), `Slider`, `Availability`, `MultiChoice` (cartes ou pastilles), `City` (ville + « Me localiser ») ;
  - formulaire : `SubmitButton` (grisé pendant l'envoi), `FormError` (erreur de tout le formulaire).
  - Un nouveau type de champ s'ajoute dans `formConfig.tsx`, en s'appuyant sur un composant du design system.
- **Écran** : `const form = useAppForm({ defaultValues, onSubmit })`, puis `<form.AppField name="pseudo" validators={…}>{(field) => <field.Text label="Pseudo" />}</form.AppField>` et `<form.AppForm><form.SubmitButton label="Enregistrer" /></form.AppForm>`.
- **Validation** : les schémas Zod de `packages/shared` se branchent directement (`validators={{ onSubmit: pseudoSchema }}`) : mêmes règles et mêmes messages que l'API. Validation à l'envoi ; l'erreur d'un champ s'efface dès qu'on le modifie.
- **Erreurs de l'API** dans `onSubmit` : `formApi.setErrorMap({ onSubmit: { fields: { pseudo: 'Ce pseudo est déjà pris.' } } })` pour un champ, `{ form: '…', fields: {} }` pour tout le formulaire (affichée par `FormError`).
- **Formulaire partagé entre écrans** : options et valeurs par défaut dans `src/forms/<nom>.form.ts` (`formOptions`), morceaux réutilisables en `withForm` (ex. `profile.form.ts`, `IdentityFields`, `WhereFields`, utilisés par Modifier le profil et l'onboarding).
- **Modifications non enregistrées** : `useStore(form.store, (s) => !s.isDefaultValue)` (revient à faux si on annule ses changements, contrairement à `isDirty`) ; après l'enregistrement, `formApi.reset(valeurs enregistrées)` en fait la nouvelle référence.

## Base de données

- Ne jamais modifier une migration déjà fusionnée : en créer une nouvelle.
- Nommer les migrations clairement : `pnpm db:migrate --name ajout_tournois`.
- Aucune donnée personnelle réelle dans les seeds.

## Secrets

- Jamais de secret dans le code ni dans Git. Les variables sont décrites dans `.env.example` ; les vraies valeurs sont partagées via le gestionnaire de mots de passe de l'équipe.
