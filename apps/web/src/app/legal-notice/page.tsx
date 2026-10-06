import { CONTACT_EMAIL } from '@lucko/design-system'
import type { Metadata } from 'next'
import { TextPage, ToFill } from '../text-page'

export const metadata: Metadata = {
  title: 'Mentions légales',
  alternates: { canonical: '/legal-notice' },
}

export default function LegalNoticePage() {
  return (
    <TextPage title="Mentions légales" updated="4 octobre 2026">
      <h2>Éditeur</h2>
      <p>
        Le site lucko.fr et l’application Lucko sont édités par :
        <br />
        <ToFill>Raison sociale</ToFill>, <ToFill>forme juridique et capital</ToFill>
        <br />
        Siège : <ToFill>adresse</ToFill>
        <br />
        SIRET / RCS : <ToFill>numéro</ToFill>
        <br />
        TVA intracommunautaire : <ToFill>numéro</ToFill>
        <br />
        Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>Directeur de la publication</h2>
      <p>
        <ToFill>Prénom et nom</ToFill>
      </p>

      <h2>Hébergeur</h2>
      <p>
        OVH SAS, 2 rue Kellermann, 59100 Roubaix, France
        <br />
        Téléphone : 1007 · <a href="https://www.ovhcloud.com">ovhcloud.com</a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque Lucko, son logo, ses textes, illustrations et le code du site comme de l’app sont
        protégés. Toute reproduction sans autorisation écrite est interdite. Les noms de jeux cités
        appartiennent à leurs éditeurs respectifs. Les informations publiées par les lieux (photos,
        descriptions, événements) restent leur propriété.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement de tes données est décrit dans la{' '}
        <a href="/privacy">politique de confidentialité</a>.
      </p>
    </TextPage>
  )
}
