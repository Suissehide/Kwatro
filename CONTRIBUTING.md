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

## Base de données

- Ne jamais modifier une migration déjà fusionnée : en créer une nouvelle.
- Nommer les migrations clairement : `pnpm db:migrate --name ajout_tournois`.
- Aucune donnée personnelle réelle dans les seeds.

## Secrets

- Jamais de secret dans le code ni dans Git. Les variables sont décrites dans `.env.example` ; les vraies valeurs sont partagées via le gestionnaire de mots de passe de l'équipe.
