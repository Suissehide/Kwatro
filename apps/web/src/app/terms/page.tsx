import type { Metadata } from 'next'
import { TextPage } from '../text-page'

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <TextPage title="Conditions d’utilisation" updated="4 octobre 2026">
      <p>
        Ces conditions encadrent l’utilisation du site lucko.fr et de l’application Lucko. En créant
        un compte, tu les acceptes. L’éditeur est présenté dans les{' '}
        <a href="/legal-notice">mentions légales</a>.
      </p>

      <h2>1. Le service</h2>
      <p>
        Lucko aide à trouver où jouer : soirées jeux de société, tournois TCG, joueurs disponibles
        près de chez toi. Lucko met en relation des joueurs avec des lieux (bars à jeux, boutiques,
        associations). Lucko n’organise pas les soirées : chaque lieu reste responsable de son
        accueil, de ses règles, de ses tarifs (droit de jeu, consommation minimum) comme des
        événements qu’il publie.
      </p>
      <p>Le service est gratuit pour les joueurs.</p>

      <h2>2. Ton compte</h2>
      <ul>
        <li>
          Il faut avoir au moins 13 ans. Entre 13 et 14 ans, le compte doit être relié à celui d’un
          parent, qui donne son accord.
        </li>
        <li>
          Tu crées ton compte avec ton e-mail ou via Apple / Google. Tes informations doivent être
          exactes, en particulier ta date de naissance : certains événements sont réservés à un âge
          minimum.
        </li>
        <li>Un compte par personne. Tu es responsable de ce qui est fait avec ton compte.</li>
        <li>Tu peux supprimer ton compte à tout moment depuis l’app (« Supprimer mon compte »).</li>
      </ul>

      <h2>3. Règles de conduite</h2>
      <p>Sur Lucko, on joue ensemble. Tu t’engages à :</p>
      <ul>
        <li>
          choisir un pseudo et une photo corrects : pas d’insulte, de contenu choquant ni
          d’usurpation d’identité. Les photos sont vérifiées avant d’être visibles par les autres
          joueurs ;
        </li>
        <li>
          respecter les autres joueurs comme le personnel des lieux, en ligne comme sur place ;
        </li>
        <li>ne pas utiliser Lucko à des fins commerciales, de démarchage ou de spam ;</li>
        <li>ne pas tenter de perturber le service ni d’accéder aux données d’autres comptes.</li>
      </ul>

      <h2>4. Rooms et inscriptions</h2>
      <p>
        Rejoindre une room ou s’inscrire à un événement, c’est prévenir les autres que tu viens. Si
        tu ne peux plus venir, désinscris-toi pour libérer ta place. Les conditions propres à chaque
        événement (âge minimum, nombre de places, liste d’attente, inscription chez l’organisateur)
        s’appliquent.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        Lucko fait son possible pour que le service soit disponible et que les informations soient à
        jour, sans pouvoir le garantir. Les horaires, événements, tarifs et descriptions sont
        fournis par les lieux. Lucko ne répond pas du déroulé des soirées, des échanges entre
        joueurs ni des achats effectués dans les lieux.
      </p>

      <h2>6. Suspension et suppression</h2>
      <p>
        En cas de manquement à ces conditions, Lucko peut masquer un contenu, suspendre ou supprimer
        un compte, après t’avoir prévenu sauf urgence (sécurité des joueurs, contenu illégal).
      </p>

      <h2>7. Tes données</h2>
      <p>
        Leur utilisation est détaillée dans la <a href="/privacy">politique de confidentialité</a>.
      </p>

      <h2>8. Évolution des conditions</h2>
      <p>
        Ces conditions peuvent évoluer avec le service. En cas de changement important, tu en es
        informé dans l’app ou par e-mail avant son entrée en vigueur.
      </p>

      <h2>9. Droit applicable et litiges</h2>
      <p>
        Ces conditions sont soumises au droit français. En cas de désaccord, écris-nous d’abord : on
        cherche une solution amiable. Tu peux aussi recourir gratuitement à un médiateur de la
        consommation. À défaut, les tribunaux français sont compétents.
      </p>
    </TextPage>
  )
}
