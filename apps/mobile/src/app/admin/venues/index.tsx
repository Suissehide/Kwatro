import {
  Banner,
  Button,
  colors,
  EmptyState,
  ReviewCard,
  Segmented,
  SkeletonCard,
  StatusPill,
  Tag,
  TextField,
} from '@lucko/design-system'
import {
  type AdminVenue,
  type UpdateVenueInput,
  VENUE_TYPE_LABELS,
  type VenueStatus,
} from '@lucko/shared'
import { MapPinCheck } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { openAdminVenue } from '@/lib/admin'
import { hoursRows } from '@/lib/venue'
import { useAdminCatalogMutations, useAdminVenuesQuery } from '@/queries/useAdminCatalog'

const FILTERS: { label: string; status?: VenueStatus }[] = [
  { label: 'À valider', status: 'PENDING' },
  { label: 'Publiés', status: 'PUBLISHED' },
  { label: 'Tous' },
]

/** « Mar. 18 h – 1 h · Mer. … », jours fermés omis. */
const hoursLine = (hours: AdminVenue['openingHours']) =>
  hoursRows(hours)
    .filter((row) => !row.closed)
    .map((row) => `${row.day.slice(0, 3)}. ${row.value}`)
    .join(' · ') || 'Horaires non renseignés'

/**
 * Lieux proposés ou importés : vérifier adresse, horaires et accès des mineurs, puis publier ;
 * passage en partenaire (badge et avantage Lucko) ; événements du lieu.
 */
export default function AdminVenuesScreen() {
  const [filter, setFilter] = useState(0)
  const [q, setQ] = useState('')
  const venues = useAdminVenuesQuery({ q: q.trim(), status: FILTERS[filter]?.status })
  const { updateVenue } = useAdminCatalogMutations()
  const [perkFor, setPerkFor] = useState<AdminVenue | null>(null)

  return (
    <AdminScreen section="venues">
      <Segmented items={FILTERS.map((f) => f.label)} value={filter} onChange={setFilter} />
      <TextField
        label="Rechercher"
        placeholder="Nom, ville ou adresse"
        value={q}
        onChangeText={setQ}
      />
      {updateVenue.isError ? <Banner tone="err" message={updateVenue.error.message} /> : null}
      {venues.isError ? (
        <Banner
          tone="err"
          message="Impossible de charger les lieux."
          action="Réessayer"
          onAction={() => void venues.refetch()}
        />
      ) : !venues.data ? (
        <SkeletonCard />
      ) : venues.data.length === 0 ? (
        <EmptyState
          dashed
          icon={<MapPinCheck size={28} color={colors.ink} strokeWidth={2.5} />}
          title="Aucun lieu"
          text={filter === 0 ? 'Aucun lieu en attente de validation.' : 'Aucun lieu trouvé.'}
        />
      ) : (
        <View style={{ gap: 12 }}>
          {venues.data.map((venue) => {
            const update = (body: UpdateVenueInput) => updateVenue.mutate({ ...body, id: venue.id })
            return (
              <ReviewCard
                key={venue.id}
                title={venue.name}
                tags={
                  <>
                    {venue.status === 'PENDING' ? (
                      <StatusPill tone="warn" label="À valider" />
                    ) : (
                      <StatusPill tone="ok" label="Publié" />
                    )}
                    {venue.isPartner ? <Tag label="Partenaire" variant="partner" /> : null}
                  </>
                }
                meta={`${VENUE_TYPE_LABELS[venue.type]} · ${venue.address}, ${venue.city}`}
                body={[
                  hoursLine(venue.openingHours),
                  venue.acceptsUnaccompaniedMinors
                    ? 'Mineurs non accompagnés acceptés'
                    : 'Pas de mineurs non accompagnés',
                  venue.isPartner && venue.luckoPerk ? `Avantage : ${venue.luckoPerk}` : null,
                ]
                  .filter(Boolean)
                  .join('\n')}
                onPress={() => openAdminVenue(venue.id)}
                actions={
                  <>
                    {venue.status === 'PENDING' ? (
                      <Button
                        small
                        kind="venue"
                        label="Publier"
                        onPress={() => update({ status: 'PUBLISHED' })}
                      />
                    ) : (
                      <Button
                        small
                        kind="ghost"
                        label="Dépublier"
                        onPress={() => update({ status: 'PENDING' })}
                      />
                    )}
                    {venue.isPartner ? (
                      <Button
                        small
                        kind="ghost"
                        label="Retirer partenaire"
                        onPress={() => update({ isPartner: false })}
                      />
                    ) : (
                      <Button
                        small
                        kind="soft"
                        label="Passer partenaire"
                        onPress={() => setPerkFor(venue)}
                      />
                    )}
                    <Button
                      small
                      kind="ghost"
                      label={
                        venue.acceptsUnaccompaniedMinors
                          ? 'Refuser les mineurs'
                          : 'Accepter les mineurs'
                      }
                      onPress={() =>
                        update({
                          acceptsUnaccompaniedMinors: !venue.acceptsUnaccompaniedMinors,
                        })
                      }
                    />
                    <Button
                      small
                      kind="ink"
                      label="Événements"
                      onPress={() => openAdminVenue(venue.id)}
                    />
                  </>
                }
              />
            )
          })}
        </View>
      )}
      <ActionDialog
        key={perkFor?.id ?? 'closed'}
        visible={perkFor !== null}
        title={`${perkFor?.name ?? 'Ce lieu'} partenaire ?`}
        message="Badge Partenaire sur la fiche et en tête à distance égale dans Explorer."
        confirmLabel="Passer partenaire"
        label="Avantage Lucko (facultatif)"
        placeholder="-10 % sur les boosters avec le QR Lucko"
        initial={perkFor?.luckoPerk ?? ''}
        optional
        destructive={false}
        onCancel={() => setPerkFor(null)}
        onConfirm={async ({ text }) => {
          if (!perkFor) return
          await updateVenue.mutateAsync({
            id: perkFor.id,
            isPartner: true,
            luckoPerk: text || null,
          })
          setPerkFor(null)
        }}
      />
    </AdminScreen>
  )
}
