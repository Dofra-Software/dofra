import type { LegalLocale } from './types'

// Traducción fiel de es.ts (versión jurídica de referencia). Mantener el mismo orden de secciones y bloques.
const EMAIL = '[info@dofrasoftware.com](mailto:info@dofrasoftware.com)'
const SITE = '[www.dofrasoftware.com](https://www.dofrasoftware.com)'
const UPDATED = 'November 24, 2026'

export const legalEn: LegalLocale = {
  ui: {
    kicker: 'LEGAL INFORMATION',
    updatedLabel: 'Last updated:',
    toc: 'Contents',
    backHome: 'Back to home',
    backTop: 'Back to top',
    newTab: 'opens in a new tab',
    translationNote: 'This is a translation of the Spanish version, which is the legal reference version, without prejudice to the rights granted by applicable law.',
  },
  footer: {
    navLabel: 'Legal information',
    terms: 'Terms and conditions',
    privacy: 'Privacy policy',
    cookies: 'Cookie policy',
    requestsLabel: 'Consumer rights',
    withdrawal: 'BOTÓN DE ARREPENTIMIENTO',
    cancellation: 'BOTÓN DE BAJA DE SERVICIO',
    withdrawalHint: 'Withdrawal button',
    cancellationHint: 'Service cancellation button',
  },
  contact: {
    consent: 'I have read the [Privacy Policy](/privacidad) and I authorize the processing of my personal data to handle my inquiry and the communications related to it.',
    processedBy: 'The form is processed by Google Apps Script.',
  },
  requests: {
    intro: 'You do not need to register, create an account or give a reason for your request.',
    requiredNote: 'Fields marked with * are required.',
    name: 'Full name',
    email: 'Email address associated with the contract',
    reference: 'Quote or contract number (optional)',
    details: 'Additional information (optional)',
    privacyNotice: 'The data provided will be used to identify and handle your request and to comply with the corresponding legal obligations. More information in the [Privacy policy](/privacidad).',
    sending: 'Sending…',
    successTitle: 'We have received your request.',
    successId: 'Request number',
    successType: 'Type of request',
    successDate: 'Date received',
    successEmail: 'We have sent an email with these details to the address you provided.',
    successPending: 'Your request has been registered, but we could not send you the confirmation email at this time. It will be resent automatically shortly.',
    successKeep: 'Keep this information as proof of submission.',
    successNotFinal: 'We will handle your request in accordance with the contractual terms and the rights provided by applicable law.',
    error: 'We could not register your request. Please try again in a few minutes or email us at [info@dofrasoftware.com](mailto:info@dofrasoftware.com) with your details and the contracted service.',
    newRequest: 'Submit another request',
    withdrawal: {
      kicker: 'WITHDRAWAL BUTTON',
      title: 'Withdrawal request',
      description: 'Use this form to request the revocation of a contract, in accordance with the rights provided by applicable law.',
      service: 'Contracted service or project',
      submit: 'Submit request',
      typeName: 'Withdrawal',
    },
    cancellation: {
      kicker: 'SERVICE CANCELLATION BUTTON',
      title: 'Service cancellation request',
      description: 'Use this form to request the cancellation of a service contracted with Dofra Software.',
      service: 'Service you wish to cancel',
      submit: 'Request cancellation',
      typeName: 'Service cancellation',
    },
  },
  docs: {
    terms: {
      title: 'Terms and conditions',
      description: 'Terms and conditions of use of the Dofra Software website: services, quotes, contracting, intellectual property and consumer rights.',
      updated: UPDATED,
      sections: [
        { title: 'Identification', blocks: [
          'This website is operated by Franca Recchia and Victoria Recchia, who carry out their professional activities under the trade name Dofra Software, hereinafter DOFRA.',
          'Place of business: Nueva Córdoba, Córdoba Capital, Argentina.',
          `Contact: ${EMAIL}.`,
          `Website: ${SITE}.`,
        ] },
        { title: 'Purpose and scope', blocks: [
          'The purpose of the site is to present DOFRA’s services, provide information about its projects and make it easier for potential clients to get in touch.',
          'These terms govern the use of the institutional website and do not replace the specific contracts for the services actually contracted.',
          'Applications, platforms and demos may be subject to specific terms.',
        ] },
        { title: 'Services', blocks: [
          'DOFRA offers web design and development, software development, applications, automation, integrations and custom digital solutions.',
          'It may also offer complementary hosting, maintenance, technical support and update services.',
          'Features, services, timelines and financial terms will be determined individually according to the contracted project.',
        ] },
        { title: 'Quote requests', blocks: [
          'The information published on the site is for information purposes, without prejudice to the binding effects that applicable law attributes to offers and advertising.',
          'Sending an inquiry or a quote request does not in itself constitute the contracting of services, nor does it create any payment obligation.',
          'DOFRA may assess the technical feasibility, availability, scope and terms of the project before issuing a commercial proposal.',
        ] },
        { title: 'Contracting', blocks: [
          'Services will be contracted through the acceptance of the corresponding quote and the applicable contractual agreements.',
          'The specific terms will set out the deliverables, features, timelines, prices, taxes, payment methods, revisions and additional services.',
          'Acceptance may be given through any electronic or written means permitted by law.',
          'The mandatory information about the provider and the contract will be made available to the client before any contractual commitment is made.',
        ] },
        { title: 'Prices and invoicing', blocks: [
          'Service prices will be determined according to the corresponding quote.',
          'Unless expressly stated, quotes do not include additional services, domain renewals, external infrastructure, licenses, hosting or maintenance that have not been expressly contracted.',
          'Invoices will be issued by Franca Recchia or Victoria Recchia, depending on who is responsible for the service and the terms of the project.',
        ] },
        { title: 'Development, revisions and deliveries', blocks: [
          'The start date and timelines will depend on the agreed terms, including receipt of materials, information, access and advance payments where applicable.',
          'The revisions and changes included will be those set out in the quote or contract.',
          'Requests that exceed the contracted scope may require a new quote and a change to the schedule, subject to prior notice to and acceptance by the client.',
          'The above does not limit the legal warranties or the corrections that may be required for defects attributable to DOFRA.',
        ] },
        { title: 'Hosting, maintenance and support', blocks: [
          'Hosting, maintenance, update and technical support services will be governed by the specific terms contracted.',
          'The development of a project does not entail the free and indefinite provision of these services.',
          'Where hosting is linked to a maintenance contract, its termination may affect the continuity of hosting in accordance with the agreed terms, respecting the periods already paid, the corresponding notices and the rights provided by law.',
        ] },
        { title: 'Intellectual property', blocks: [
          'The original content of the site, its visual identity, designs, developments, texts, graphic resources and other proprietary elements are protected by applicable intellectual property law.',
          'Rights to third-party materials belong to their respective owners.',
          'The reproduction, distribution, commercialization or improper use of the protected content of the site without authorization is not permitted, except in the cases allowed by law.',
          'Ownership, assignment, license of use and any delivery of the source code of projects developed for clients will be set out in the corresponding agreements.',
        ] },
        { title: 'Portfolio and demos', blocks: [
          'The site may display DOFRA’s own projects, developments made for clients, concept proposals and working demos.',
          'Demos may use fictitious or illustrative data and do not necessarily represent systems intended for immediate production use.',
          'Client projects will be shown in accordance with the corresponding authorizations and rights.',
        ] },
        { title: 'User obligations', blocks: [
          'Users must use the site lawfully and respectfully.',
          'They may not attempt to gain unauthorized access to systems, interfere with their operation, introduce malicious code, make abusive automated submissions, provide fraudulent information or infringe the rights of third parties.',
          'Users must hold the necessary authorizations for the materials and information they provide.',
        ] },
        { title: 'Third-party services and links', blocks: [
          'The site may contain links to external platforms and use third-party technology services.',
          'These third parties may have their own terms and policies.',
          'DOFRA does not control the independent operation of those platforms, without prejudice to the liability that legally corresponds to it for the contracted services.',
        ] },
        { title: 'Availability and security', blocks: [
          'DOFRA will endeavor to keep the site working properly and to apply reasonable security measures.',
          'Temporary interruptions may occur due to maintenance, updates, technical incidents, external services or other circumstances.',
          'This does not exclude the obligations or liabilities that may be legally required.',
        ] },
        { title: 'Business results', blocks: [
          'Unless expressly contracted, DOFRA does not guarantee financial results, search engine rankings, number of visits, sales, bookings, client acquisition or commercial profitability.',
          'DOFRA will be responsible for the technology services it has undertaken and for the obligations applicable by law.',
        ] },
        { title: 'Liability', blocks: [
          'The liability of DOFRA and of users will be determined in accordance with the obligations undertaken, the circumstances of each case and applicable law.',
          'These terms do not exclude or limit any liability that cannot legally be excluded or limited.',
        ] },
        { title: 'Personal data protection', blocks: [
          'The processing of personal data is governed by DOFRA’s [Privacy Policy](/privacidad).',
          'Information about local storage and other technologies used by the site is available in the [Cookie and Local Storage Policy](/cookies).',
        ] },
        { title: 'Consumer rights', blocks: [
          'Where a consumer relationship exists, Consumer Protection Law 24,240, the Argentine Civil and Commercial Code and other mandatory regulations will apply.',
          'The applicable rights of information, warranty, revocation, withdrawal and cancellation will be respected.',
          'No provision of these terms may be interpreted as a waiver of the consumer’s non-waivable rights.',
          `Requests related to these rights may be sent to ${EMAIL}, without prejudice to any other mandatory mechanisms that must be made available.`,
          'Withdrawal and service cancellation requests can also be submitted directly through the [Withdrawal button](/arrepentimiento) and the [Service cancellation button](/baja-de-servicio), with no prior registration required.',
        ] },
        { title: 'Changes', blocks: [
          'DOFRA may update these terms to reflect changes in its services, operations or the law.',
          'Changes will not unilaterally alter the terms of contracts already entered into, except in the cases permitted by law.',
        ] },
        { title: 'Governing law and jurisdiction', blocks: [
          'These terms will be interpreted in accordance with applicable Argentine law.',
          'In commercial relationships where legally permissible, the competent courts of Córdoba, Argentina, may be agreed upon.',
          'Mandatory rules on competence and jurisdiction will be respected, especially those intended to protect consumers.',
        ] },
        { title: 'Contact', blocks: [
          `For questions about these terms and conditions, users may contact us at ${EMAIL}.`,
        ] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      description: 'How Dofra Software processes the personal data collected on its website, for what purposes and how to exercise the rights of access, rectification and deletion.',
      updated: UPDATED,
      sections: [
        { title: 'Data controllers', blocks: [
          `Franca Recchia and Victoria Recchia, who carry out their professional activity under the Dofra Software brand, hereinafter DOFRA, are responsible for the processing of the personal data collected through the institutional website ${SITE}.`,
          'Place of business: Nueva Córdoba, Córdoba Capital, Argentina.',
          `Email: ${EMAIL}.`,
        ] },
        { title: 'Scope', blocks: [
          'This policy applies to DOFRA’s institutional website and to communications related to its services.',
          'The applications, platforms and solutions developed by DOFRA may have their own privacy policies and specific terms.',
        ] },
        { title: 'Personal data collected', blocks: [
          'DOFRA may process the following data:',
          { list: [
            'Name and identification details provided by the user.',
            'Email address and phone number, when provided.',
            'Professional or business information.',
            'Type of project and estimated budget.',
            'Language preferences and the content of inquiries.',
            'Technical connection information needed for the operation and security of the site.',
            'Data needed for contracting, invoicing and providing services.',
            'Data included in withdrawal and service cancellation requests, such as the contracted service and the quote or contract reference.',
          ] },
          'Users should refrain from providing sensitive information, credentials or third-party data without authorization through the contact form.',
        ] },
        { title: 'Purposes of processing', blocks: [
          'The data may be used to:',
          { list: [
            'Answer inquiries and requests for information.',
            'Prepare quotes and commercial proposals.',
            'Manage pre-contractual and contractual relationships.',
            'Provide services and technical support.',
            'Receive, register and handle withdrawal and service cancellation requests, and send the confirmations and communications related to them.',
            'Comply with legal, tax and administrative obligations, including those set out in consumer protection regulations.',
            'Protect the security of systems and prevent misuse.',
          ] },
          'Processing will be carried out with the corresponding consent or where legally authorized.',
        ] },
        { title: 'Commercial communications', blocks: [
          'DOFRA does not currently run newsletter campaigns or send periodic advertising through its institutional website.',
          'If it adds these activities in the future, it will request the corresponding authorizations and provide free and simple ways to stop receiving promotional communications.',
          'Consent to advertising communications will be separate from the consent needed to handle inquiries or provide services.',
        ] },
        { title: 'Information provided by users', blocks: [
          'Fields marked as required are necessary to handle requests.',
          'Insufficient information may prevent DOFRA from responding properly or providing the requested services.',
          'Users must provide information that is truthful, up to date and lawfully obtained.',
        ] },
        { title: 'Technology providers and recipients', blocks: [
          'DOFRA uses technology providers to operate its website and manage its communications, including:',
          { list: [
            'GitHub Pages, to host the institutional website.',
            'Google Apps Script, to process the inquiries sent through the contact form.',
            'Email and communication services needed to manage inquiries and business relationships.',
          ] },
          { when: 'turnstile', block: 'Cloudflare Turnstile, by Cloudflare, Inc., to verify that form submissions are not automated. This service is only loaded when a form is filled in and may process the IP address and technical data about the browser and device.' },
          { when: 'registry', block: 'Withdrawal and service cancellation requests are received through Google Apps Script and registered in a private Google Sheets spreadsheet that only DOFRA’s owners can access.' },
          'The hosting provider may process technical connection information, such as IP addresses and access logs.',
          'Data may be disclosed to providers when necessary for the purposes described, and to competent authorities where there is a legal obligation.',
          'DOFRA does not sell personal data.',
        ] },
        { title: 'International transfers', blocks: [
          'The use of certain technology providers may involve the processing of personal data outside Argentina.',
          'Where applicable, DOFRA must have the legally permitted mechanisms in place for such transfers, in accordance with Law 25,326 and its complementary regulations.',
        ] },
        { title: 'Cookies and local storage', blocks: [
          'The institutional website does not currently use tracking cookies, personalized advertising tools or web analytics systems.',
          'It uses the browser’s local storage to remember the language preference.',
          { when: 'turnstile', block: 'When a form is filled in, Cloudflare Turnstile may set strictly necessary technical cookies for security verification, which are not used for advertising or analytics purposes.' },
          'For more information, users may consult the [Cookie and Local Storage Policy](/cookies).',
        ] },
        { title: 'Data retention', blocks: [
          'Data will be kept for as long as necessary to fulfil the purposes for which it was collected, meet legal obligations, manage contractual relationships and exercise or defend rights.',
          'Records of withdrawal and service cancellation requests will be kept for as long as necessary to demonstrate compliance with the corresponding legal and contractual obligations.',
          'Once those purposes have been fulfilled, the data will be deleted or anonymized where appropriate.',
        ] },
        { title: 'Security and confidentiality', blocks: [
          'DOFRA will adopt reasonable and appropriate technical and organizational measures to protect personal data against unauthorized access, loss, alteration or improper disclosure.',
          'The use of technology services does not make it possible to guarantee the complete absence of security incidents, without prejudice to the liabilities that may be legally required.',
        ] },
        { title: 'Rights of the data subject', blocks: [
          'Data subjects may exercise their rights of access, rectification, updating and deletion of personal data in accordance with current law.',
          `Requests may be sent to ${EMAIL}.`,
          'DOFRA may request information reasonably necessary to verify the identity of the requester.',
          'The right of access may be exercised free of charge at intervals of no less than six months, unless a legitimate interest is shown.',
          'Access requests will be answered within the legal period of ten calendar days. Requests for rectification, updating or deletion will be answered within the legal period of five business days, where applicable.',
          'Data subjects may request the withdrawal or blocking of their data used for advertising purposes.',
          'The Agency for Access to Public Information (Agencia de Acceso a la Información Pública), the supervisory authority under Law 25,326, has the power to handle complaints and claims relating to breaches of personal data protection rules.',
        ] },
        { title: 'External links', blocks: [
          'The site may contain links to external platforms and services subject to their own privacy policies.',
          'DOFRA does not control the independent processing carried out by those third parties, without prejudice to the liability that legally corresponds to it.',
        ] },
        { title: 'Updates', blocks: [
          'DOFRA may amend this policy to reflect regulatory, technological or operational changes.',
          'Where a change requires new consent, it will be requested in accordance with applicable law.',
        ] },
        { title: 'Applicable law', blocks: [
          'This policy is governed by Personal Data Protection Law 25,326, Decree 1558/2001 and other applicable Argentine regulations.',
        ] },
      ],
    },
    cookies: {
      title: 'Cookie and local storage policy',
      description: 'Storage technologies used on the Dofra Software website: no cookies or analytics; only local storage to remember the language.',
      updated: UPDATED,
      sections: [
        { title: 'Scope', blocks: [
          `This policy describes the storage technologies used on the institutional website ${SITE}, operated under the Dofra Software brand, hereinafter DOFRA.`,
          'It does not cover applications, demos, independent platforms or third-party websites accessible through links.',
        ] },
        { title: 'Use of cookies', blocks: [
          { when: 'noTurnstile', block: 'DOFRA’s institutional website does not currently use first-party or third-party cookies, advertising tracking tools, browsing profiles or web analytics systems.' },
          { when: 'turnstile', block: 'DOFRA’s institutional website does not currently use first-party cookies, advertising tracking tools, browsing profiles or web analytics systems.' },
          { when: 'turnstile', block: 'When the user fills in a form, the Cloudflare Turnstile service, by Cloudflare, Inc., may set strictly necessary third-party cookies, such as cf_clearance, to verify that the submission is not automated. These cookies are not used for advertising or analytics purposes, and their duration and operation are governed by Cloudflare’s cookie policy.' },
        ] },
        { title: 'Local storage', blocks: [
          'The site uses the browser’s localStorage technology to remember the language preference and make navigation easier on future visits.',
          'Technology used:',
          { list: [
            'Identifier: dofra-lang.',
            'Provider: Dofra Software.',
            'Purpose: remember the language of the site.',
            'Duration: until the user deletes the data stored in their browser.',
            'Type: local storage of preferences.',
          ] },
          'This information remains stored locally on the device and is not used to identify the user or to build commercial profiles.',
        ] },
        { title: 'Managing storage', blocks: [
          'Users can delete or restrict local storage through their browser settings.',
          'Deleting it does not prevent access to the site, although it may reset the site to the default language.',
        ] },
        { title: 'External services and links', blocks: [
          'The site uses external technology services for hosting and to process the inquiries sent through the contact form.',
          { when: 'turnstile', block: 'When a form is filled in, the site uses Cloudflare Turnstile to prevent automated submissions.' },
          'The processing of personal data associated with those services is described in DOFRA’s [Privacy Policy](/privacidad).',
          'External sites accessible through links may apply their own cookie and privacy policies.',
        ] },
        { title: 'Changes', blocks: [
          'DOFRA may update this policy as a result of technological, operational or regulatory changes.',
          'If technologies requiring consent are introduced, the corresponding mechanisms will be implemented in accordance with applicable law.',
        ] },
        { title: 'Contact', blocks: [
          `For questions about this policy, users may contact us at ${EMAIL}.`,
        ] },
      ],
    },
  },
}
