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
