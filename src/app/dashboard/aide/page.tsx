import {
  Rocket,
  Bot,
  Users,
  FileText,
  Wrench,
  Sparkles,
  Mail,
} from "lucide-react";
import { ListPageHeader } from "@/components/list-page-header";

/**
 * Page Aide & FAQ — documentation utilisateur statique de Nautilus.
 *
 * Pas de back : tout le contenu est rédigé en français accessible.
 * Couvre les 6 cas d'usage principaux : navigation, recherche IA, clients/bateaux,
 * devis, OR → facture, et UX (mode sombre, mobile).
 */
export default function AidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Aide & FAQ"
        subtitle="Tout ce qu'il faut savoir pour utiliser Nautilus au quotidien"
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-8">
        {/* 1. Démarrer */}
        <Section icon={Rocket} title="1. Démarrer avec Nautilus">
          <Question q="Qu'est-ce que Nautilus ?">
            Nautilus est un logiciel de gestion d&apos;atelier nautique. Vous
            enregistrez vos clients, leurs bateaux, vous chiffrez des devis,
            vous suivez les ordres de réparation et vous générez vos factures
            au format PDF — le tout depuis une interface simple.
          </Question>
          <Question q="Pour qui c'est fait ?">
            Pour les acteurs d&apos;un <strong>atelier nautique</strong>.
            En V1, Nautilus s&apos;utilise principalement par le{" "}
            <strong>chef d&apos;atelier</strong>{" "}
            qui pilote l&apos;activité (clients, bateaux, devis, OR,
            factures). Le modèle d&apos;accès supporte aussi le{" "}
            <strong>mécano</strong>{" "}
            (recherche IA et mise à jour de statut d&apos;OR) et le{" "}
            <strong>client final</strong>{" "}
            (consultation de ses devis et factures) — les écrans
            correspondants seront activés en version commerciale RANKIA,
            avec une aide adaptée à chaque rôle. Conçu par un ancien
            mécanicien nautique, le produit est pensé pour le terrain :
            interface lisible en plein soleil et utilisable sur mobile.
          </Question>
          <Question q="Comment naviguer dans l'application ?">
            La barre latérale à gauche (sur ordinateur) regroupe tous les
            modules : Accueil, Clients, Bateaux, Devis, Ordres de réparation,
            Factures, Administration et Aide. Sur mobile ou tablette, le bouton
            menu ☰ en haut à gauche ouvre la même navigation.
          </Question>
        </Section>

        {/* 2. Recherche IA */}
        <Section icon={Bot} title="2. Le moteur de recherche IA">
          <Question q="Comment poser une question à l'agent IA ?">
            Sur la page Accueil ou via le menu <strong>Recherche IA</strong>,
            tapez votre question en français comme si vous parliez à un
            collègue. Par exemple : <em>« le bateau de Martin »</em>. L&apos;agent
            comprend la question, va chercher la réponse dans la base et vous
            l&apos;affiche.
          </Question>
          <Question q="Quels types de questions fonctionnent bien ?">
            Voici quelques exemples concrets qui marchent :
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><em>« le bateau de Martin »</em></li>
              <li><em>« les OR en cours »</em></li>
              <li><em>« la dernière facture »</em></li>
              <li><em>« les devis de Sophie Martin »</em></li>
              <li><em>« tous les Yamaha 200 CV »</em></li>
              <li><em>« la facture FAC-2026-0042 »</em></li>
              <li><em>« combien de clients j&apos;ai ? »</em></li>
            </ul>
          </Question>
          <Question q="Comment fonctionnent les OR urgents ?">
            L&apos;urgence est un <strong>statut que vous activez manuellement</strong>{" "}
            sur un ordre de réparation au moment de sa création (case « Urgent »).
            L&apos;agent IA ne devine donc rien : il filtre simplement les OR
            que vous avez marqués comme urgents et qui ne sont pas encore
            facturés. Vous pouvez alors demander : <em>« les OR urgents »</em>{" "}
            ou <em>« qu&apos;est-ce qui presse ? »</em>.
          </Question>
          <Question q="Pourquoi l'agent refuse parfois de répondre ?">
            Nautilus refuse poliment quatre types de demandes pour la sécurité
            de vos données :
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><strong>credentials</strong>{" "}— toute demande de mot de passe ou de clé</li>
              <li><strong>manipulation</strong>{" "}— toute tentative de détourner l&apos;agent</li>
              <li><strong>hors domaine</strong>{" "}— questions sans rapport avec l&apos;atelier</li>
              <li><strong>abus</strong>{" "}— contenu inapproprié</li>
            </ul>
            Si vous voyez un bandeau rouge, c&apos;est normal — votre question
            est tracée en interne pour audit.
          </Question>
        </Section>

        {/* 3. Clients et bateaux */}
        <Section icon={Users} title="3. Gérer les clients et bateaux">
          <Question q="Comment créer un client ?">
            Allez dans <strong>Clients</strong>{" "}
            dans le menu, puis cliquez sur <strong>+ Nouveau client</strong>{" "}
            en haut à droite. Remplissez le nom et le prénom (obligatoires),
            et autant d&apos;informations que vous souhaitez ajouter (email,
            téléphone, adresse, type particulier ou professionnel).
          </Question>
          <Question q="Comment lier un bateau à un client ?">
            Une fois le client créé, allez dans <strong>Bateaux</strong>{" "}→{" "}
            <strong>+ Nouveau bateau</strong>. Sélectionnez le client
            propriétaire dans la liste, puis renseignez la marque, le modèle,
            l&apos;immatriculation, les informations moteur. Un client peut
            avoir autant de bateaux que nécessaire.
          </Question>
          <Question q="Comment modifier ou supprimer ?">
            Cliquez sur la fiche client ou bateau pour ouvrir le détail, puis
            utilisez les boutons d&apos;action en haut de la page. La
            suppression est protégée : si un bateau a des devis, il ne peut
            pas être supprimé directement.
          </Question>
        </Section>

        {/* 4. Devis */}
        <Section icon={FileText} title="4. Créer et gérer un devis">
          <Question q="Comment créer un devis ?">
            Allez dans <strong>Devis</strong>{" "}→ <strong>+ Nouveau devis</strong>.
            Choisissez le client, puis le bateau concerné (optionnel — un devis
            peut être pré-vente, sans bateau associé). Ajoutez ensuite vos
            lignes de devis : pièces, main-d&apos;œuvre, prestations. Le calcul
            HT, TVA et TTC se fait automatiquement.
          </Question>
          <Question q="Quels sont les statuts d'un devis ?">
            Un devis passe par 4 états :
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><strong>Brouillon</strong>{" "}— vous éditez encore le devis</li>
              <li><strong>Envoyé</strong>{" "}— le devis a été transmis au client</li>
              <li><strong>Validé</strong>{" "}— le client a accepté → un OR est créé automatiquement</li>
              <li><strong>Refusé</strong>{" "}— le client a refusé</li>
            </ul>
          </Question>
          <Question q="Comment générer le PDF du devis ?">
            Ouvrez le devis et cliquez sur le bouton <strong>PDF</strong>. Le
            fichier est généré côté serveur à la demande et téléchargé
            instantanément. Comme le PDF n&apos;est pas stocké, il reflète
            toujours la dernière version du devis.
          </Question>
        </Section>

        {/* 5. OR → Facture */}
        <Section icon={Wrench} title="5. Du devis à la facture">
          <Question q="Comment passe-t-on d'un devis à une facture ?">
            Quand vous validez un devis lié à un bateau, Nautilus crée
            automatiquement un <strong>Ordre de réparation (OR)</strong>. Ce
            dernier représente le travail à effectuer côté atelier. Une fois
            le travail terminé, vous passez l&apos;OR au statut{" "}
            <strong>Facturé</strong>: un numéro de facture séquentiel est
            généré (format <code>FAC-AAAA-XXXX</code>) et le PDF de facture
            devient disponible.
          </Question>
          <Question q="Quels sont les statuts d'un OR et où les voir ?">
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><strong>Créé</strong>{" "}— l&apos;OR vient d&apos;être ouvert</li>
              <li><strong>En cours</strong>{" "}— le mécano travaille sur le bateau</li>
              <li><strong>Terminé</strong>{" "}— le travail est fini, en attente de facturation</li>
              <li><strong>Facturé</strong>{" "}— la facture est générée et disponible en PDF</li>
            </ul>
            <p className="mt-3">
              Le statut s&apos;affiche sous forme de <strong>badge coloré</strong>{" "}
              dans la liste des ordres de réparation (menu{" "}
              <strong>Ordres de réparation</strong>) et en haut de la fiche
              de chaque OR (bloc <strong>STATUT</strong>). Pour le faire
              évoluer, ouvrez la fiche : un <strong>gros bouton bleu</strong>{" "}
              juste sous la description du statut propose la transition
              suivante (« Démarrer l&apos;intervention » quand l&apos;OR est
              Créé, « Marquer comme terminé » quand il est En cours,
              « Facturer (génère la facture) » quand il est Terminé). Le
              bouton change automatiquement selon l&apos;étape en cours.
            </p>
            <p className="mt-3">
              <strong>À noter :</strong>{" "}le statut suit un{" "}
              <strong>workflow strict</strong>{" "}(Créé → En cours → Terminé →
              Facturé). On ne peut pas sauter d&apos;étape ni revenir en
              arrière. C&apos;est volontaire : une fois l&apos;OR Facturé, le
              numéro de facture a déjà été émis et envoyé au client — le
              faire repasser à un statut antérieur créerait une incohérence
              comptable.
            </p>
          </Question>
          <Question q="Comment modifier un OR après création ?">
            Sur la fiche d&apos;un OR (tant qu&apos;il n&apos;est pas{" "}
            <strong>Facturé</strong>), un bouton{" "}
            <strong>Modifier</strong>{" "}en haut du bloc{" "}
            <strong>Informations OR</strong>{" "}ouvre un formulaire pour ajuster
            le type (Entretien, Réparation, Hivernage, Déshivernage,
            Dépannage), l&apos;urgence (Normal / Urgent), la description et
            les dates de début et de fin. Le <strong>mécano assigné</strong>{" "}
            se modifie séparément via le bouton{" "}
            <strong>Changer</strong>{" "}à droite de son nom. Le statut, lui,
            évolue via les boutons de transition. Une fois Facturé, l&apos;OR
            est clos et n&apos;est plus modifiable.
          </Question>
          <Question q="Où trouver les factures émises ?">
            Toutes les factures sont listées dans le menu <strong>Factures</strong>.
            Cliquez sur une facture pour la consulter ou{" "}
            <strong>télécharger son PDF</strong>, que vous transmettrez
            ensuite au client via votre messagerie habituelle.
            L&apos;envoi automatique par email n&apos;est pas inclus en V1 —
            il est prévu dans la version commerciale RANKIA.
          </Question>
        </Section>

        {/* 6. Astuces */}
        <Section icon={Sparkles} title="6. Astuces d'usage">
          <Question q="Basculer en mode sombre">
            Cliquez sur l&apos;icône <strong>soleil / lune</strong>{" "}
            en haut à droite de la page d&apos;accueil. Idéal pour travailler
            tard à l&apos;atelier ou pour ménager vos yeux en intérieur.
          </Question>
          <Question q="Utiliser Nautilus sur mobile">
            Nautilus s&apos;adapte automatiquement à votre téléphone ou
            tablette. Le menu se transforme en bouton ☰ en haut à gauche. La
            recherche IA est tout aussi rapide en mobilité — pratique pour
            consulter une fiche bateau directement sur le ponton.
          </Question>
          <Question q="Astuce — utiliser l'URL pour partager une question">
            Quand vous posez une question à la recherche IA, l&apos;URL se met
            à jour avec votre question (paramètre <code>?q=...</code>). Vous
            pouvez copier cette URL et la partager avec un collègue — il
            arrivera directement sur le même résultat.
          </Question>
        </Section>

        {/* 7. Contact */}
        <Section icon={Mail} title="7. Besoin d'aide ?">
          <Question q="Comment contacter le support ?">
            Nautilus est édité par <strong>RANKIA SASU</strong>. Pour toute
            question d&apos;utilisation, une suggestion ou un incident,
            écrivez à{" "}
            <a
              href="mailto:rgaillard.rankia@gmail.com?subject=Support%20Nautilus"
              className="font-mono font-semibold text-primary hover:underline"
            >
              rgaillard.rankia@gmail.com
            </a>
            . Précisez si possible le numéro de devis, d&apos;OR ou de
            facture concerné, ainsi qu&apos;une capture d&apos;écran en cas
            d&apos;anomalie — ça nous permet de vous répondre plus vite.
          </Question>
          <Question q="Et la suite ?">
            Une version commerciale plus complète est en préparation. Elle
            apportera la gestion multi-utilisateurs (avec rôles fins Client /
            Mécano / Chef d&apos;atelier), le scan OCR de plaque moteur,
            l&apos;envoi automatique des devis par email et plus encore. La
            roadmap est consultable depuis la page d&apos;administration.
          </Question>
        </Section>
      </main>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Rocket;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Question({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-1.5">{q}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </article>
  );
}
