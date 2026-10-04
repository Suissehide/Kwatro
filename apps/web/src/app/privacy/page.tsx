import { CONTACT_EMAIL } from '@kwatro/design-system'
import type { Metadata } from 'next'
import { TextPage, ToFill } from '../text-page'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <TextPage title="Politique de confidentialité" updated="4 octobre 2026">
      <p>
        Cette page explique quelles données Kwatro collecte, pourquoi, combien de temps elles sont
        gardées ainsi que tes droits. Version courte : on collecte le strict nécessaire pour te
        trouver une table, on ne vend rien à personne, aucun cookie publicitaire.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        <ToFill>Raison sociale</ToFill>, éditeur de Kwatro (voir les{' '}
        <a href="/legal-notice">mentions légales</a>). Pour toute question ou pour exercer tes
        droits : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Données collectées et usages</h2>

      <h3>Ton compte</h3>
      <ul>
        <li>
          E-mail, mot de passe chiffré ou identifiant Apple / Google, nom transmis par Apple ou
          Google : pour te connecter. Base légale : exécution du contrat (les conditions
          d’utilisation).
        </li>
        <li>
          Date de naissance : pour vérifier l’âge minimum du service ainsi que celui de certains
          événements. Base légale : obligation légale (âge de consentement numérique) et exécution
          du contrat.
        </li>
        <li>
          Pour les 13-14 ans : le lien avec le compte du parent et la date de son accord. Base
          légale : obligation légale.
        </li>
      </ul>

      <h3>Ton profil</h3>
      <ul>
        <li>
          Pseudo, photo, jeux pratiqués, ambiance recherchée, disponibilités habituelles : pour que
          les autres joueurs sachent avec qui ils jouent.
        </li>
        <li>
          Ville, position (centre de la ville choisie ou position de ton appareil si tu la partages)
          et rayon de recherche : pour te montrer les lieux et soirées proches. Ta position n’est
          jamais suivie en continu.
        </li>
      </ul>
      <p>Base légale : exécution du contrat.</p>

      <h3>Ton activité</h3>
      <ul>
        <li>
          Rooms créées ou rejointes, inscriptions aux événements, passages dans les lieux
          partenaires, points d’expérience : pour faire fonctionner les parties, prévenir les
          organisateurs ainsi que pour ta progression.
        </li>
        <li>
          Sessions de connexion (adresse IP, type d’appareil et de navigateur) : pour garder ton
          compte sécurisé. Base légale : intérêt légitime (sécurité).
        </li>
      </ul>

      <h3>La liste d’attente du site</h3>
      <p>
        E-mail et ville (facultative) : uniquement pour te prévenir du lancement de Kwatro près de
        chez toi. Base légale : ton consentement, retirable à tout moment.
      </p>

      <h2>Ce que voient les autres</h2>
      <p>
        Les autres joueurs voient ton pseudo, ta photo une fois validée (sinon ton initiale), tes
        jeux, ton ambiance ainsi que ta participation aux rooms et événements publics. Ils ne voient
        jamais ton e-mail, ton nom, ta date de naissance ni ta position.
      </p>

      <h2>Durées de conservation</h2>
      <ul>
        <li>
          Compte : tant qu’il est actif. À sa suppression, tout ce qui t’identifie (e-mail, nom,
          pseudo, photo, date de naissance, ville, position) est effacé immédiatement. Seul
          l’historique anonyme des parties et des passages dans les lieux est conservé (statistiques
          et facturation des lieux).
        </li>
        <li>Sessions de connexion : jusqu’à leur expiration ou ta déconnexion.</li>
        <li>Liste d’attente : jusqu’au lancement dans ta ville, au plus tard 3 ans.</li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>Tes données ne sont ni vendues ni louées. Elles sont traitées par :</p>
      <ul>
        <li>
          OVHcloud (France) : hébergement du site, de l’app, de la base de données ainsi que des
          photos de profil ;
        </li>
        <li>Resend : envoi des e-mails (confirmation, mot de passe oublié, informations) ;</li>
        <li>
          Apple et Google : uniquement si tu choisis de te connecter avec eux, selon leurs propres
          politiques ;
        </li>
        <li>Géoplateforme de l’IGN (France) : recherche de ta ville, sans donnée te concernant.</li>
      </ul>
      <p>
        Resend étant basé aux États-Unis, ce transfert hors de l’Union européenne est encadré par
        les clauses contractuelles types de la Commission européenne.
      </p>

      <h2>Cookies et mesure d’audience</h2>
      <p>
        Kwatro ne dépose aucun cookie publicitaire ni traceur tiers. Le seul cookie utilisé garde ta
        session ouverte une fois connecté : il est indispensable au service, il ne demande donc pas
        de consentement. La mesure d’audience (Umami) est anonyme, sans cookie : elle compte les
        visites sans te suivre d’un site à l’autre.
      </p>

      <h2>Tes droits</h2>
      <p>Tu peux à tout moment :</p>
      <ul>
        <li>accéder à tes données ou en obtenir une copie (portabilité) ;</li>
        <li>les corriger, la plupart directement depuis ton profil ;</li>
        <li>les effacer, en supprimant ton compte depuis l’app ;</li>
        <li>t’opposer à un traitement ou en demander la limitation ;</li>
        <li>retirer ton consentement (liste d’attente) ;</li>
        <li>définir ce que deviennent tes données après ton décès.</li>
      </ul>
      <p>
        Écris à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : on répond sous un mois. Si
        la réponse ne te convient pas, tu peux saisir la{' '}
        <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
      </p>

      <h2>Mineurs</h2>
      <p>
        Kwatro est interdit aux moins de 13 ans. Entre 13 et 14 ans, l’inscription nécessite
        l’accord d’un parent, qui peut exercer les droits ci-dessus pour le compte de son enfant.
      </p>
    </TextPage>
  )
}
