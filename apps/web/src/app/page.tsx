import { KWOTE_START, MIN_AGE } from '@kwatro/shared'

export default function HomePage() {
  return (
    <main>
      <h1>Kwatro</h1>
      <p>Où jouer ce soir à Bordeaux ? Bientôt disponible.</p>
      <p>
        <small>
          Dès {MIN_AGE} ans · Kwote de départ : {KWOTE_START}
        </small>
      </p>
    </main>
  )
}
