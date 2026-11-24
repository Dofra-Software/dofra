import type { LegalLocale } from './types'

// Traducción fiel de es.ts (versión jurídica de referencia). Mantener el mismo orden de secciones y bloques.
const EMAIL = '[info@dofrasoftware.com](mailto:info@dofrasoftware.com)'
const SITE = '[www.dofrasoftware.com](https://www.dofrasoftware.com)'
const UPDATED = '24 novembre 2026'

export const legalFr: LegalLocale = {
  ui: {
    kicker: 'INFORMATIONS LÉGALES',
    updatedLabel: 'Dernière mise à jour :',
    toc: 'Sommaire',
    backHome: 'Retour à l’accueil',
    backTop: 'Retour en haut',
    newTab: 's’ouvre dans un nouvel onglet',
    translationNote: 'Ceci est une traduction de la version espagnole, qui constitue la version juridique de référence, sans préjudice des droits reconnus par la législation applicable.',
  },
  footer: {
    navLabel: 'Informations légales',
    terms: 'Conditions générales',
    privacy: 'Politique de confidentialité',
    cookies: 'Politique relative aux cookies',
    requestsLabel: 'Droits des consommateurs',
    withdrawal: 'BOTÓN DE ARREPENTIMIENTO',
    cancellation: 'BOTÓN DE BAJA DE SERVICIO',
    withdrawalHint: 'Bouton de rétractation',
    cancellationHint: 'Bouton de résiliation de service',
  },
  contact: {
    consent: 'J’ai lu la [Politique de confidentialité](/privacidad) et j’autorise le traitement de mes données personnelles pour la gestion de ma demande et des communications qui s’y rapportent.',
    processedBy: 'Le formulaire est traité au moyen de Google Apps Script.',
  },
  requests: {
    intro: 'Vous n’avez pas besoin de vous inscrire, de créer un compte ni d’indiquer le motif de votre demande.',
    requiredNote: 'Les champs marqués d’un * sont obligatoires.',
    name: 'Nom et prénom',
    email: 'Adresse e-mail associée au contrat',
    reference: 'Numéro de devis ou de contrat (facultatif)',
    details: 'Informations complémentaires (facultatif)',
    privacyNotice: 'Les données fournies seront utilisées pour identifier et traiter votre demande et respecter les obligations légales correspondantes. Plus d’informations dans la [Politique de confidentialité](/privacidad).',
    sending: 'Envoi en cours…',
    successTitle: 'Nous avons bien reçu votre demande.',
    successId: 'Numéro de demande',
    successType: 'Type de demande',
    successDate: 'Date de réception',
    successEmail: 'Nous vous avons envoyé un e-mail reprenant ces informations à l’adresse indiquée.',
    successPending: 'Votre demande a bien été enregistrée, mais l’e-mail de confirmation n’a pas pu vous être envoyé pour le moment. Il sera renvoyé automatiquement sous peu.',
    successKeep: 'Conservez ces informations comme preuve du dépôt de votre demande.',
    successNotFinal: 'Nous traiterons votre demande conformément aux conditions contractuelles et aux droits prévus par la législation applicable.',
    error: 'Votre demande n’a pas pu être enregistrée. Réessayez dans quelques minutes ou écrivez-nous à [info@dofrasoftware.com](mailto:info@dofrasoftware.com) en indiquant vos coordonnées et le service souscrit.',
    newRequest: 'Envoyer une autre demande',
    withdrawal: {
      kicker: 'BOUTON DE RÉTRACTATION',
      title: 'Demande de rétractation',
      description: 'Utilisez ce formulaire pour demander la révocation d’un contrat, conformément aux droits prévus par la législation applicable.',
      service: 'Service ou projet souscrit',
      submit: 'Envoyer la demande',
      typeName: 'Rétractation',
    },
    cancellation: {
      kicker: 'BOUTON DE RÉSILIATION DES SERVICES',
      title: 'Demande de résiliation de service',
      description: 'Utilisez ce formulaire pour demander la résiliation d’un service souscrit auprès de Dofra Software.',
      service: 'Service que vous souhaitez résilier',
      submit: 'Demander la résiliation',
      typeName: 'Résiliation de service',
    },
  },
  docs: {
    terms: {
      title: 'Conditions générales',
      description: 'Conditions générales d’utilisation du site de Dofra Software : services, devis, contractualisation, propriété intellectuelle et droits des consommateurs.',
      updated: UPDATED,
      sections: [
        { title: 'Identification', blocks: [
          'Le présent site web est exploité par Franca Recchia et Victoria Recchia, qui exercent leurs activités professionnelles sous le nom commercial Dofra Software, ci-après DOFRA.',
          'Lieu d’activité : Nueva Córdoba, Córdoba Capital, Argentine.',
          `Contact : ${EMAIL}.`,
          `Site web : ${SITE}.`,
        ] },
        { title: 'Objet et champ d’application', blocks: [
          'Le site a pour objet de présenter les services de DOFRA, de fournir des informations sur ses projets et de faciliter la prise de contact avec des clients potentiels.',
          'Les présentes conditions régissent l’utilisation du site institutionnel et ne remplacent pas les contrats particuliers relatifs aux services effectivement souscrits.',
          'Les applications, plateformes et démonstrations peuvent être soumises à des conditions spécifiques.',
        ] },
        { title: 'Services', blocks: [
          'DOFRA propose des services de conception et de développement web, de développement logiciel, d’applications, d’automatisations, d’intégrations et de solutions numériques sur mesure.',
          'Elle peut également proposer des services complémentaires d’hébergement, de maintenance, de support technique et de mise à jour.',
          'Les fonctionnalités, prestations, délais et conditions financières sont déterminés individuellement selon le projet souscrit.',
        ] },
        { title: 'Demandes de devis', blocks: [
          'Les informations publiées sur le site ont un caractère informatif, sans préjudice des effets contraignants que la législation applicable attribue aux offres et à la publicité.',
          'L’envoi d’une demande ou d’une demande de devis n’emporte pas, à lui seul, la souscription de services et ne crée aucune obligation de paiement.',
          'DOFRA peut évaluer la faisabilité technique, la disponibilité, le périmètre et les conditions du projet avant d’émettre une proposition commerciale.',
        ] },
        { title: 'Contractualisation', blocks: [
          'La contractualisation est formalisée par l’acceptation du devis correspondant et des accords contractuels applicables.',
          'Les conditions particulières précisent les livrables, fonctionnalités, délais, prix, taxes, modalités de paiement, révisions et services supplémentaires.',
          'L’acceptation peut être donnée par tout moyen électronique ou écrit admis par la loi.',
          'Les informations obligatoires relatives au prestataire et au contrat sont communiquées au client avant tout engagement contractuel.',
        ] },
        { title: 'Prix et facturation', blocks: [
          'Les prix des services sont déterminés selon le devis correspondant.',
          'Sauf mention expresse, les devis n’incluent pas les services supplémentaires, renouvellements de nom de domaine, infrastructures externes, licences, hébergement ou maintenance qui n’ont pas été expressément souscrits.',
          'La facturation est assurée par Franca Recchia ou Victoria Recchia, selon la responsable de la prestation et les conditions du projet.',
        ] },
        { title: 'Développement, révisions et livraisons', blocks: [
          'Le démarrage et les délais d’exécution dépendent des conditions convenues, notamment de la réception des contenus, informations, accès et acomptes le cas échéant.',
          'Les révisions et modifications incluses sont celles prévues dans le devis ou le contrat.',
          'Les demandes qui dépassent le périmètre souscrit peuvent nécessiter un nouveau devis et une modification du calendrier, après information et acceptation du client.',
          'Ce qui précède ne limite ni les garanties légales ni les corrections exigibles en cas de défauts imputables à DOFRA.',
        ] },
        { title: 'Hébergement, maintenance et support', blocks: [
          'Les services d’hébergement, de maintenance, de mise à jour et de support technique sont régis par les conditions particulières souscrites.',
          'Le développement d’un projet n’implique pas la fourniture gratuite et illimitée dans le temps de ces services.',
          'Lorsque l’hébergement est lié à la maintenance souscrite, la fin de celle-ci peut affecter la continuité de l’hébergement conformément aux conditions convenues, dans le respect des périodes réglées, des notifications correspondantes et des droits prévus par la loi.',
        ] },
        { title: 'Propriété intellectuelle', blocks: [
          'Les contenus originaux du site, son identité visuelle, ses designs, développements, textes, ressources graphiques et autres éléments propres sont protégés par la législation applicable en matière de propriété intellectuelle.',
          'Les droits relatifs aux contenus de tiers appartiennent à leurs titulaires respectifs.',
          'Toute reproduction, distribution, commercialisation ou utilisation abusive des contenus protégés du site sans autorisation est interdite, sauf dans les cas permis par la loi.',
          'La titularité, la cession, la licence d’utilisation et l’éventuelle remise du code source des projets développés pour des clients sont fixées par les accords correspondants.',
        ] },
        { title: 'Portfolio et démonstrations', blocks: [
          'Le site peut présenter des projets propres, des réalisations pour des clients, des propositions conceptuelles et des démonstrations fonctionnelles.',
          'Les démonstrations peuvent utiliser des données fictives ou illustratives et ne représentent pas nécessairement des systèmes destinés à une utilisation en production immédiate.',
          'Les projets de clients sont présentés conformément aux autorisations et aux droits correspondants.',
        ] },
        { title: 'Obligations des utilisateurs', blocks: [
          'Les utilisateurs doivent utiliser le site de manière licite et respectueuse.',
          'Ils ne peuvent pas tenter d’accéder sans autorisation aux systèmes, en perturber le fonctionnement, introduire du code malveillant, effectuer des envois automatisés abusifs, fournir des informations frauduleuses ni porter atteinte aux droits de tiers.',
          'L’utilisateur doit disposer des autorisations nécessaires concernant les contenus et informations qu’il fournit.',
        ] },
        { title: 'Services et liens de tiers', blocks: [
          'Le site peut contenir des liens vers des plateformes externes et utiliser des services technologiques de tiers.',
          'Ces tiers peuvent disposer de leurs propres conditions et politiques.',
          'DOFRA ne contrôle pas le fonctionnement indépendant de ces plateformes, sans préjudice des responsabilités qui lui incombent légalement au titre des services souscrits.',
        ] },
        { title: 'Disponibilité et sécurité', blocks: [
          'DOFRA s’efforce d’assurer le bon fonctionnement du site et d’appliquer des mesures de sécurité raisonnables.',
          'Des interruptions temporaires peuvent survenir en raison d’opérations de maintenance, de mises à jour, d’incidents techniques, de services externes ou d’autres circonstances.',
          'Cela n’exclut pas les obligations ni les responsabilités légalement exigibles.',
        ] },
        { title: 'Résultats commerciaux', blocks: [
          'Sauf engagement expressément souscrit, DOFRA ne garantit aucun résultat financier, référencement dans les moteurs de recherche, nombre de visites, ventes, réservations, acquisition de clients ni rentabilité commerciale.',
          'DOFRA répond des prestations technologiques qu’elle a assumées et des obligations légalement applicables.',
        ] },
        { title: 'Responsabilité', blocks: [
          'La responsabilité de DOFRA et des utilisateurs est déterminée conformément aux obligations assumées, aux circonstances de chaque cas et à la législation applicable.',
          'Les présentes conditions n’excluent ni ne limitent les responsabilités qui ne peuvent légalement être exclues ou limitées.',
        ] },
        { title: 'Protection des données personnelles', blocks: [
          'Le traitement des données personnelles est régi par la [Politique de confidentialité](/privacidad) de DOFRA.',
          'Les informations relatives au stockage local et aux autres technologies utilisées par le site figurent dans la [Politique relative aux cookies et au stockage local](/cookies).',
        ] },
        { title: 'Droits des consommateurs', blocks: [
          'Lorsqu’il existe une relation de consommation, la loi argentine 24.240 de défense du consommateur, le Code civil et commercial de la Nation argentine et les autres normes impératives sont applicables.',
          'Les droits d’information, de garantie, de révocation, de rétractation et de résiliation applicables seront respectés.',
          'Aucune disposition des présentes conditions ne peut être interprétée comme une renonciation à des droits auxquels le consommateur ne peut renoncer.',
          `Les demandes relatives à ces droits peuvent être adressées à ${EMAIL}, sans préjudice des autres mécanismes obligatoires qui doivent être mis à disposition.`,
          'Les demandes de rétractation et de résiliation de services peuvent également être présentées directement au moyen du [Bouton de rétractation](/arrepentimiento) et du [Bouton de résiliation des services](/baja-de-servicio), sans inscription préalable.',
        ] },
        { title: 'Modifications', blocks: [
          'DOFRA peut mettre à jour les présentes conditions pour tenir compte de l’évolution de ses services, de son fonctionnement ou de la législation.',
          'Les modifications n’altèrent pas unilatéralement les conditions des contrats déjà conclus, sauf dans les cas permis par la loi.',
        ] },
        { title: 'Droit applicable et juridiction', blocks: [
          'Les présentes conditions sont interprétées conformément à la législation argentine applicable.',
          'Dans les relations commerciales où la loi le permet, la compétence des tribunaux de Córdoba, en Argentine, peut être convenue.',
          'Les règles impératives de compétence et de juridiction sont respectées, en particulier celles destinées à protéger les consommateurs.',
        ] },
        { title: 'Contact', blocks: [
          `Pour toute question relative aux présentes conditions générales, les utilisateurs peuvent écrire à ${EMAIL}.`,
        ] },
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      description: 'Comment Dofra Software traite les données personnelles collectées sur son site, à quelles fins et comment exercer les droits d’accès, de rectification et de suppression.',
      updated: UPDATED,
      sections: [
        { title: 'Responsables du traitement', blocks: [
          `Franca Recchia et Victoria Recchia, qui exercent leur activité professionnelle sous la marque Dofra Software, ci-après DOFRA, sont responsables du traitement des données personnelles collectées au moyen du site institutionnel ${SITE}.`,
          'Lieu d’activité : Nueva Córdoba, Córdoba Capital, Argentine.',
          `Adresse e-mail : ${EMAIL}.`,
        ] },
        { title: 'Champ d’application', blocks: [
          'La présente politique s’applique au site institutionnel de DOFRA et aux communications liées à ses services.',
          'Les applications, plateformes et solutions développées par DOFRA peuvent disposer de leurs propres politiques de confidentialité et conditions spécifiques.',
        ] },
        { title: 'Données personnelles collectées', blocks: [
          'DOFRA peut traiter les données suivantes :',
          { list: [
            'Nom et données d’identification fournies par l’utilisateur.',
            'Adresse e-mail et numéro de téléphone, lorsqu’ils sont fournis.',
            'Informations professionnelles ou commerciales.',
            'Type de projet et budget estimé.',
            'Préférences de langue et contenu des demandes.',
            'Informations techniques de connexion nécessaires au fonctionnement et à la sécurité du site.',
            'Données nécessaires à la contractualisation, à la facturation et à la fourniture des services.',
            'Données figurant dans les demandes de rétractation et de résiliation de services, comme le service souscrit et la référence du devis ou du contrat.',
          ] },
          'L’utilisateur doit s’abstenir de fournir, au moyen du formulaire de contact, des informations sensibles, des identifiants ou des données de tiers sans autorisation.',
        ] },
        { title: 'Finalités du traitement', blocks: [
          'Les données peuvent être utilisées pour :',
          { list: [
            'Répondre aux demandes et aux demandes d’information.',
            'Établir des devis et des propositions commerciales.',
            'Gérer les relations précontractuelles et contractuelles.',
            'Fournir les services et assurer le support technique.',
            'Recevoir, enregistrer et traiter les demandes de rétractation et de résiliation de services, et envoyer les confirmations et communications qui s’y rapportent.',
            'Respecter les obligations légales, fiscales et administratives, y compris celles prévues par la réglementation en matière de défense du consommateur.',
            'Protéger la sécurité des systèmes et prévenir les usages abusifs.',
          ] },
          'Le traitement est effectué avec le consentement correspondant ou lorsque la loi l’autorise.',
        ] },
        { title: 'Communications commerciales', blocks: [
          'À l’heure actuelle, DOFRA ne réalise pas de campagnes de newsletters ni d’envois publicitaires périodiques au moyen de son site institutionnel.',
          'Si elle intègre ultérieurement ces activités, elle sollicitera les autorisations nécessaires et proposera des moyens gratuits et simples de ne plus recevoir de communications promotionnelles.',
          'Le consentement aux communications publicitaires sera distinct de celui nécessaire au traitement des demandes ou à la fourniture des services.',
        ] },
        { title: 'Informations fournies par les utilisateurs', blocks: [
          'Les champs signalés comme obligatoires sont nécessaires au traitement des demandes.',
          'Des informations insuffisantes peuvent empêcher DOFRA de répondre de manière adéquate ou de fournir les services demandés.',
          'L’utilisateur doit fournir des informations exactes, à jour et obtenues de manière légitime.',
        ] },
        { title: 'Prestataires technologiques et destinataires', blocks: [
          'DOFRA fait appel à des prestataires technologiques pour le fonctionnement de son site et la gestion de ses communications, notamment :',
          { list: [
            'GitHub Pages, pour l’hébergement du site institutionnel.',
            'Google Apps Script, pour le traitement des demandes envoyées au moyen du formulaire de contact.',
            'Les services de messagerie et de communication nécessaires à la gestion des demandes et des relations commerciales.',
          ] },
          { when: 'turnstile', block: 'Cloudflare Turnstile, de Cloudflare, Inc., pour vérifier que les envois des formulaires ne sont pas automatisés. Ce service n’est chargé que lorsqu’un formulaire est rempli et peut traiter l’adresse IP ainsi que des données techniques du navigateur et de l’appareil.' },
          { when: 'registry', block: 'Les demandes de rétractation et de résiliation de services sont reçues au moyen de Google Apps Script et enregistrées dans une feuille de calcul Google Sheets privée, à laquelle seules les responsables de DOFRA ont accès.' },
          'Le prestataire d’hébergement peut traiter des informations techniques de connexion, telles que les adresses IP et les journaux d’accès.',
          'Les données peuvent être communiquées à des prestataires lorsque cela est nécessaire aux finalités indiquées, ainsi qu’aux autorités compétentes en cas d’obligation légale.',
          'DOFRA ne commercialise pas de données personnelles.',
        ] },
        { title: 'Transferts internationaux', blocks: [
          'Le recours à certains prestataires technologiques peut impliquer le traitement de données personnelles en dehors de l’Argentine.',
          'Le cas échéant, DOFRA doit disposer des mécanismes légalement admis pour ces transferts, conformément à la loi 25.326 et à sa réglementation complémentaire.',
        ] },
        { title: 'Cookies et stockage local', blocks: [
          'Le site institutionnel n’utilise actuellement ni cookies de suivi, ni outils de publicité personnalisée, ni systèmes d’analyse d’audience.',
          'Il utilise le stockage local du navigateur pour conserver la préférence de langue.',
          { when: 'turnstile', block: 'Lorsqu’un formulaire est rempli, Cloudflare Turnstile peut déposer des cookies techniques strictement nécessaires à la vérification de sécurité, qui ne sont pas utilisés à des fins publicitaires ni d’analyse d’audience.' },
          'Pour plus d’informations, l’utilisateur peut consulter la [Politique relative aux cookies et au stockage local](/cookies).',
        ] },
        { title: 'Conservation des données', blocks: [
          'Les données sont conservées pendant la durée nécessaire à l’accomplissement des finalités pour lesquelles elles ont été collectées, au respect des obligations légales, à la gestion des relations contractuelles et à l’exercice ou à la défense de droits.',
          'Les registres des demandes de rétractation et de résiliation de services sont conservés pendant la durée nécessaire pour justifier du respect des obligations légales et contractuelles correspondantes.',
          'Une fois ces finalités accomplies, les données sont supprimées ou anonymisées, le cas échéant.',
        ] },
        { title: 'Sécurité et confidentialité', blocks: [
          'DOFRA adopte des mesures techniques et organisationnelles raisonnables et appropriées pour protéger les données personnelles contre tout accès non autorisé, perte, altération ou divulgation indue.',
          'Le recours à des services technologiques ne permet pas de garantir l’absence totale d’incidents de sécurité, sans préjudice des responsabilités légalement exigibles.',
        ] },
        { title: 'Droits de la personne concernée', blocks: [
          'La personne concernée peut exercer ses droits d’accès, de rectification, de mise à jour et de suppression de ses données personnelles, conformément à la législation en vigueur.',
          `Les demandes peuvent être adressées à ${EMAIL}.`,
          'DOFRA peut demander les informations raisonnablement nécessaires pour vérifier l’identité du demandeur.',
          'Le droit d’accès peut être exercé gratuitement à des intervalles d’au moins six mois, sauf justification d’un intérêt légitime.',
          'Les demandes d’accès sont traitées dans le délai légal de dix jours calendaires. Les demandes de rectification, de mise à jour ou de suppression sont traitées dans le délai légal de cinq jours ouvrables, le cas échéant.',
          'La personne concernée peut demander le retrait ou le blocage de ses données utilisées à des fins publicitaires.',
          'L’Agence d’accès à l’information publique (Agencia de Acceso a la Información Pública), autorité de contrôle de la loi 25.326, est compétente pour traiter les plaintes et réclamations relatives au non-respect des règles de protection des données personnelles.',
        ] },
        { title: 'Liens externes', blocks: [
          'Le site peut contenir des liens vers des plateformes et services externes soumis à leurs propres politiques de confidentialité.',
          'DOFRA ne contrôle pas les traitements indépendants réalisés par ces tiers, sans préjudice des responsabilités qui lui incombent légalement.',
        ] },
        { title: 'Mises à jour', blocks: [
          'DOFRA peut modifier la présente politique pour tenir compte d’évolutions réglementaires, technologiques ou opérationnelles.',
          'Lorsqu’une modification nécessite un nouveau consentement, celui-ci sera sollicité conformément à la législation applicable.',
        ] },
        { title: 'Législation applicable', blocks: [
          'La présente politique est régie par la loi argentine 25.326 relative à la protection des données personnelles, le décret 1558/2001 et les autres normes argentines applicables.',
        ] },
      ],
    },
    cookies: {
      title: 'Politique relative aux cookies et au stockage local',
      description: 'Technologies de stockage du site de Dofra Software : aucun cookie ni outil d’analyse ; uniquement un stockage local pour mémoriser la langue.',
      updated: UPDATED,
      sections: [
        { title: 'Champ d’application', blocks: [
          `La présente politique décrit les technologies de stockage utilisées sur le site institutionnel ${SITE}, exploité sous la marque Dofra Software, ci-après DOFRA.`,
          'Elle ne couvre pas les applications, démonstrations, plateformes indépendantes ni les sites web de tiers accessibles au moyen de liens.',
        ] },
        { title: 'Utilisation de cookies', blocks: [
          { when: 'noTurnstile', block: 'À l’heure actuelle, le site institutionnel de DOFRA n’utilise ni cookies propres ou de tiers, ni outils de suivi publicitaire, ni profils de navigation, ni systèmes d’analyse d’audience.' },
          { when: 'turnstile', block: 'À l’heure actuelle, le site institutionnel de DOFRA n’utilise ni cookies propres, ni outils de suivi publicitaire, ni profils de navigation, ni systèmes d’analyse d’audience.' },
          { when: 'turnstile', block: 'Lorsque l’utilisateur remplit un formulaire, le service Cloudflare Turnstile, de Cloudflare, Inc., peut utiliser des cookies techniques tiers strictement nécessaires pour vérifier que l’envoi n’est pas automatisé. Ces cookies ne sont pas utilisés à des fins publicitaires ni d’analyse d’audience, et leur durée et leur fonctionnement sont régis par la politique de Cloudflare en matière de cookies.' },
        ] },
        { title: 'Stockage local', blocks: [
          'Le site utilise la technologie localStorage du navigateur pour conserver la préférence de langue et faciliter la navigation lors des visites suivantes.',
          'Technologie utilisée :',
          { list: [
            'Identifiant : dofra-lang.',
            'Fournisseur : Dofra Software.',
            'Finalité : mémoriser la langue du site.',
            'Durée : jusqu’à ce que l’utilisateur supprime les données stockées dans son navigateur.',
            'Type : stockage local de préférences.',
          ] },
          'Ces informations restent stockées localement sur l’appareil et ne sont pas utilisées pour identifier l’utilisateur ni pour établir des profils commerciaux.',
        ] },
        { title: 'Gestion du stockage', blocks: [
          'L’utilisateur peut supprimer ou restreindre le stockage local dans les paramètres de son navigateur.',
          'Sa suppression n’empêche pas l’accès au site, mais peut entraîner le retour à la langue par défaut.',
        ] },
        { title: 'Services et liens externes', blocks: [
          'Le site utilise des services technologiques externes pour son hébergement et pour traiter les demandes envoyées au moyen du formulaire de contact.',
          { when: 'turnstile', block: 'Lorsqu’un formulaire est rempli, le site utilise Cloudflare Turnstile pour empêcher les envois automatisés.' },
          'Le traitement des données personnelles associé à ces services est décrit dans la [Politique de confidentialité](/privacidad) de DOFRA.',
          'Les sites externes accessibles au moyen de liens peuvent appliquer leurs propres politiques en matière de cookies et de confidentialité.',
        ] },
        { title: 'Modifications', blocks: [
          'DOFRA peut mettre à jour la présente politique à la suite d’évolutions technologiques, opérationnelles ou réglementaires.',
          'Si des technologies nécessitant un consentement sont introduites, les mécanismes correspondants seront mis en place conformément à la législation applicable.',
        ] },
        { title: 'Contact', blocks: [
          `Pour toute question relative à la présente politique, l’utilisateur peut écrire à ${EMAIL}.`,
        ] },
      ],
    },
  },
}
