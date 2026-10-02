# @kwatro/design-system

Design system « Plateau pop » de Kwatro : tokens + composants React Native, utilisés tels quels par
l'app Expo (`apps/mobile`) et par le site Next.js (`apps/web`, via react-native-web).

Référence visuelle : handoff design « Kwatro MVP » (`Kwatro DS Plateau pop v2`). Catalogue vivant :
http://localhost:3010/design-system (web) et `/design-system` dans l'app Expo.

## Organisation (atomic design)

```
src/
├── tokens/      couleurs, polices (font()), typo, espacements, rayons, traits, ombres, z, grille…
├── atoms/       Typography, Button, IconButton, Tag, Chip, StatusPill, CountBadge, Avatar, DateBlock,
│                Toggle, Checkbox, Radio, ProgressSteps, Note, Skeleton, Spinner, Raised
├── molecules/   ScreenHeader, Segmented, TextField, Stepper, KwoteBadge, XpBar, ContentCard, ListRow,
│                RoomStatusTimeline, StatCard, ShareBar, Toast, Banner, ChatBubble, Pagination,
│                EmptyState, SkeletonCard
├── organisms/   DataTable, Accordion, BarChart, ConfirmDialog, BottomSheet,
│                PlayerTabBar / VenueTabBar, Sidebar
├── templates/   MobileScreen, WebSidebarLayout
└── catalogue/   vitrine de tous les composants (import séparé : @kwatro/design-system/catalogue)
```

Règle de dépendance : un niveau n'importe que les niveaux en dessous (atoms → tokens, molecules →
atoms + tokens…). **Les pages ne sont pas ici** : ce sont les écrans réels, ils vivent dans
`apps/mobile/src/app` et `apps/web/src/app` et assemblent templates + organismes avec les données de
l'API.

## Utilisation

```tsx
import { Button, ContentCard, Typography, colors } from '@kwatro/design-system'

<ContentCard kind="room" raised>
  <Typography variant="title">Pioneer du jeudi</Typography>
  <Button label="Rejoindre" />
</ContentCard>
```

- **Polices** : toujours via `font('body', 800)` / `font('mono', 700)` / `font('display')` ou
  `Typography`, jamais `fontFamily` + `fontWeight` à la main (sur iOS/Android chaque graisse est
  une police distincte). Côté Expo, `apps/mobile/src/app/_layout.tsx` les charge ; côté Next,
  `kwatro.css` les importe de Google Fonts.
- **Ombres** : pleines et sans flou, toujours via `<Raised>` (Android n'a pas d'ombre dure).
- **Couleurs** : `textOn(bg)` donne la couleur de texte lisible ; jamais de blanc sur `kwote`.
- **Accessibilité** : `IconButton`, `Toggle`, `Checkbox` exigent un `label` (lu par les lecteurs
  d'écran) ; `Checkbox hideLabel` pour une case seule.

## Web (Next.js)

`apps/web/next.config.ts` alias `react-native` → `react-native-web` et transpile ce paquet ;
`apps/web/src/app/rnw-styles.tsx` injecte les styles au rendu serveur. `kwatro.css` (variables
`--kw-*` et classes `.kw-*`) reste disponible pour les pages statiques en HTML/CSS pur.

## Ajouter un composant

1. Le ranger au bon niveau, un fichier par composant, et l'exporter dans l'`index.ts` du niveau.
2. N'utiliser que les tokens (pas de couleur ni de taille en dur hors spécification).
3. L'ajouter au catalogue (`src/catalogue/Catalogue.tsx`).
4. Toute logique non triviale (calcul, tri, pagination…) dans un fichier pur avec un test Vitest
   (ex. `molecules/pageList.ts`).
