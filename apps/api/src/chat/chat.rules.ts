/** Anti-flood : au plus 5 messages par joueur en 10 secondes, tous chats confondus. */
export const FLOOD = { messages: 5, windowMs: 10_000 }

/** Messages rapprochés : un seul push par salve (le précédent date de moins de 2 minutes). */
export const PUSH_GROUP_MS = 2 * 60_000

export const startsBurst = (previousAt: Date | null, now: Date) =>
  previousAt === null || now.getTime() - previousAt.getTime() >= PUSH_GROUP_MS

/**
 * Qui reçoit le push d'un message : les membres, sauf l'auteur, ceux qui ont le chat ouvert (déjà prévenus
 * par le socket), les joueurs bloqués dans un sens ou dans l'autre et ceux qui l'ont mis en sourdine.
 * Une annonce passe la sourdine.
 */
export function pushRecipients({
  memberIds,
  authorId,
  watching,
  blocked,
  muted,
  announcement,
}: {
  memberIds: string[]
  authorId: string
  watching: Set<string>
  blocked: Set<string>
  muted: Set<string>
  announcement: boolean
}) {
  return memberIds.filter(
    (id) =>
      id !== authorId && !watching.has(id) && !blocked.has(id) && (announcement || !muted.has(id)),
  )
}

/** Une partie commencée depuis moins de 12 h compte encore comme en cours (onglet Messages). */
export const ONGOING_MS = 12 * 60 * 60_000

/** Partie terminée : après sa fin, ou 12 h après son début si elle n'a pas d'heure de fin. */
export const isPast = (startsAt: Date, endsAt: Date | null, now: Date) =>
  (endsAt?.getTime() ?? startsAt.getTime() + ONGOING_MS) < now.getTime()

/** Onglet Messages : les chats écrits, du plus récent au plus ancien, puis les autres par date de partie. */
export function sortChats<T extends { startsAt: Date; last: { createdAt: Date } | null }>(
  chats: T[],
) {
  return [...chats].sort((a, b) =>
    a.last && b.last
      ? b.last.createdAt.getTime() - a.last.createdAt.getTime()
      : a.last
        ? -1
        : b.last
          ? 1
          : a.startsAt.getTime() - b.startsAt.getTime(),
  )
}
