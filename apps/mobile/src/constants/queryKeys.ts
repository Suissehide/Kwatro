// Clés TanStack Query : un objet par entité, un fichier par entité dans src/queries/.
// Une requête paramétrée ajoute ses paramètres après la clé : [AGENDA.GET, 'past'].
export const ME = {
  GET: 'me',
  UPDATE: 'update_me',
  SET_BIRTH_DATE: 'set_me_birth_date',
  DELETE: 'delete_me',
} as const

export const BLOCKS = {
  GET: 'blocks',
  UNBLOCK: 'unblock_player',
} as const

export const AGENDA = {
  GET: 'agenda',
} as const

export const EXPLORE = {
  TONIGHT: 'explore_tonight',
} as const

export const EVENT = {
  GET: 'event',
  REGISTER: 'register_event',
  UNREGISTER: 'unregister_event',
} as const

export const VENUE = {
  GET: 'venue',
} as const

export const GEOCODE = {
  SEARCH: 'geocode_search',
  REVERSE: 'geocode_reverse',
} as const
