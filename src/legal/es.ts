import type { LegalLocale } from './types'

// Versión jurídica de referencia. Cualquier cambio acá debe trasladarse a en.ts y fr.ts.
const EMAIL = '[info@dofrasoftware.com](mailto:info@dofrasoftware.com)'
const SITE = '[www.dofrasoftware.com](https://www.dofrasoftware.com)'
const UPDATED = '24 de noviembre de 2026'

export const legalEs: LegalLocale = {
  ui: {
    kicker: 'INFORMACIÓN LEGAL',
    updatedLabel: 'Última actualización:',
    toc: 'Contenido',
    backHome: 'Volver al inicio',
    backTop: 'Volver arriba',
    newTab: 'se abre en una pestaña nueva',
  },
  footer: {
    navLabel: 'Información legal',
    terms: 'Términos y condiciones',
    privacy: 'Política de privacidad',
    cookies: 'Política de cookies',
    requestsLabel: 'Derechos del consumidor',
    withdrawal: 'BOTÓN DE ARREPENTIMIENTO',
    cancellation: 'BOTÓN DE BAJA DE SERVICIO',
  },
  contact: {
    consent: 'He leído la [Política de Privacidad](/privacidad) y autorizo el tratamiento de mis datos personales para gestionar mi consulta y las comunicaciones relacionadas con ella.',
    processedBy: 'El formulario se procesa mediante Google Apps Script.',
  },
  requests: {
    intro: 'No necesitás registrarte, crear una cuenta ni indicar el motivo de tu solicitud.',
    requiredNote: 'Los campos marcados con * son obligatorios.',
    name: 'Nombre y apellido',
    email: 'Correo electrónico asociado a la contratación',
    reference: 'Número de presupuesto o contrato (opcional)',
    details: 'Información adicional (opcional)',
    privacyNotice: 'Los datos proporcionados serán utilizados para identificar y gestionar tu solicitud y cumplir las obligaciones legales correspondientes. Más información en la [Política de privacidad](/privacidad).',
    sending: 'Enviando…',
    successTitle: 'Recibimos tu solicitud.',
    successId: 'Número de solicitud',
    successType: 'Tipo de solicitud',
    successDate: 'Fecha de recepción',
    successEmail: 'Te enviamos un correo electrónico con estos datos a la dirección indicada.',
    successPending: 'Tu solicitud quedó registrada, pero no pudimos enviarte el correo de constancia en este momento. Lo reenviaremos automáticamente a la brevedad.',
    successKeep: 'Conservá esta información como constancia de presentación.',
    successNotFinal: 'Gestionaremos tu solicitud conforme a las condiciones contractuales y los derechos previstos por la legislación aplicable.',
    error: 'No pudimos registrar tu solicitud. Probá de nuevo en unos minutos o escribinos a [info@dofrasoftware.com](mailto:info@dofrasoftware.com) con tus datos y el servicio contratado.',
    newRequest: 'Enviar otra solicitud',
    withdrawal: {
      kicker: 'BOTÓN DE ARREPENTIMIENTO',
      title: 'Solicitud de arrepentimiento',
      description: 'Utilizá este formulario para solicitar la revocación de una contratación, conforme a los derechos previstos por la legislación aplicable.',
      service: 'Servicio o proyecto contratado',
      submit: 'Enviar solicitud',
      typeName: 'Arrepentimiento',
    },
    cancellation: {
      kicker: 'BOTÓN DE BAJA DE SERVICIO',
      title: 'Solicitud de baja de servicio',
      description: 'Utilizá este formulario para solicitar la cancelación de un servicio contratado con Dofra Software.',
      service: 'Servicio que desea cancelar',
      submit: 'Solicitar baja',
      typeName: 'Baja de servicio',
    },
  },
  docs: {
    terms: {
      title: 'Términos y condiciones',
      description: 'Términos y condiciones de uso del sitio institucional de Dofra Software: servicios, cotizaciones, contratación, propiedad intelectual y derechos de los consumidores.',
      updated: UPDATED,
      sections: [
        { title: 'Identificación', blocks: [
          'El presente sitio web es operado por Franca Recchia y Victoria Recchia, quienes desarrollan sus actividades profesionales bajo la marca comercial Dofra Software, en adelante DOFRA.',
          'Ubicación de actividad: Nueva Córdoba, Córdoba Capital, Argentina.',
          `Contacto: ${EMAIL}.`,
          `Sitio web: ${SITE}.`,
        ] },
        { title: 'Objeto y alcance', blocks: [
          'El sitio tiene como finalidad presentar los servicios de DOFRA, proporcionar información sobre sus proyectos y facilitar el contacto con potenciales clientes.',
          'Estos términos regulan la utilización del sitio institucional y no sustituyen los contratos particulares correspondientes a los servicios efectivamente contratados.',
          'Las aplicaciones, plataformas y demostraciones podrán estar sujetas a condiciones específicas.',
        ] },
        { title: 'Servicios', blocks: [
          'DOFRA ofrece servicios de diseño y desarrollo web, desarrollo de software, aplicaciones, automatizaciones, integraciones y soluciones digitales personalizadas.',
          'También podrá ofrecer servicios complementarios de alojamiento, mantenimiento, soporte técnico y actualización.',
          'Las funcionalidades, prestaciones, plazos y condiciones económicas se determinarán individualmente según el proyecto contratado.',
        ] },
        { title: 'Solicitudes de cotización', blocks: [
          'La información publicada en el sitio tiene carácter informativo, sin perjuicio de los efectos vinculantes que la legislación aplicable atribuya a las ofertas y a la publicidad.',
          'El envío de una consulta o solicitud de cotización no implica por sí mismo la contratación de servicios ni genera una obligación de pago.',
          'DOFRA podrá evaluar la viabilidad técnica, disponibilidad, alcance y condiciones del proyecto antes de emitir una propuesta comercial.',
        ] },
        { title: 'Contratación', blocks: [
          'La contratación se formalizará mediante la aceptación del presupuesto correspondiente y los acuerdos contractuales aplicables.',
          'Las condiciones particulares establecerán los entregables, funcionalidades, plazos, precios, impuestos, modalidades de pago, revisiones y servicios adicionales.',
          'La aceptación podrá instrumentarse mediante los mecanismos electrónicos o escritos legalmente admitidos.',
          'La información obligatoria relativa al proveedor y a la contratación será facilitada al cliente antes de asumir compromisos contractuales.',
        ] },
        { title: 'Precios y facturación', blocks: [
          'Los precios de los servicios se determinarán según el presupuesto correspondiente.',
          'Salvo indicación expresa, los presupuestos no incluyen servicios adicionales, renovaciones de dominio, infraestructura externa, licencias, alojamiento o mantenimiento que no hayan sido expresamente contratados.',
          'La facturación será realizada por Franca Recchia o Victoria Recchia, según la responsable de la prestación y las condiciones del proyecto.',
        ] },
        { title: 'Desarrollo, revisiones y entregas', blocks: [
          'El inicio y los plazos de ejecución dependerán de las condiciones acordadas, incluyendo la recepción de materiales, información, accesos y anticipos cuando correspondan.',
          'Las revisiones y modificaciones incluidas serán las establecidas en el presupuesto o contrato.',
          'Las solicitudes que excedan el alcance contratado podrán requerir una nueva cotización y una modificación del cronograma, previa comunicación y aceptación del cliente.',
          'Lo anterior no limita las garantías legales ni las correcciones exigibles por defectos imputables a DOFRA.',
        ] },
        { title: 'Alojamiento, mantenimiento y soporte', blocks: [
          'Los servicios de alojamiento, mantenimiento, actualizaciones y soporte técnico se regirán por las condiciones particulares contratadas.',
          'El desarrollo de un proyecto no implica la prestación gratuita e indefinida de estos servicios.',
          'Cuando el alojamiento esté vinculado al mantenimiento contratado, su finalización podrá afectar la continuidad del alojamiento conforme a las condiciones acordadas, respetando los períodos abonados, las notificaciones correspondientes y los derechos legalmente aplicables.',
        ] },
        { title: 'Propiedad intelectual', blocks: [
          'Los contenidos originales del sitio, su identidad visual, sus diseños, desarrollos, textos, recursos gráficos y demás elementos propios se encuentran protegidos por la legislación de propiedad intelectual aplicable.',
          'Los derechos correspondientes a materiales de terceros pertenecen a sus respectivos titulares.',
          'No se autoriza la reproducción, distribución, comercialización ni utilización indebida de los contenidos protegidos del sitio sin autorización, salvo en los supuestos permitidos por la legislación.',
          'La titularidad, cesión, licencia de uso y eventual entrega del código fuente de los proyectos desarrollados para clientes se establecerán mediante los acuerdos correspondientes.',
        ] },
        { title: 'Portfolio y demostraciones', blocks: [
          'El sitio podrá exhibir proyectos propios, desarrollos realizados para clientes, propuestas conceptuales y demostraciones funcionales.',
          'Las demostraciones podrán utilizar datos ficticios o ilustrativos y no necesariamente representan sistemas destinados a su utilización productiva inmediata.',
          'La exposición de proyectos de clientes se realizará conforme a las autorizaciones y derechos correspondientes.',
        ] },
        { title: 'Obligaciones de los usuarios', blocks: [
          'Los usuarios deberán utilizar el sitio de manera lícita y respetuosa.',
          'No podrán intentar acceder sin autorización a sistemas, interferir en su funcionamiento, introducir código malicioso, realizar envíos automatizados abusivos, proporcionar información fraudulenta ni vulnerar derechos de terceros.',
          'El usuario deberá contar con las autorizaciones necesarias respecto de los materiales e información que proporcione.',
        ] },
        { title: 'Servicios y enlaces de terceros', blocks: [
          'El sitio podrá contener enlaces a plataformas externas y utilizar servicios tecnológicos de terceros.',
          'Estos terceros podrán contar con condiciones y políticas propias.',
          'DOFRA no controla el funcionamiento independiente de dichas plataformas, sin perjuicio de las responsabilidades que legalmente le correspondan por los servicios contratados.',
        ] },
        { title: 'Disponibilidad y seguridad', blocks: [
          'DOFRA procurará mantener el funcionamiento adecuado del sitio y aplicar medidas razonables de seguridad.',
          'Podrán producirse interrupciones temporales por mantenimiento, actualizaciones, incidencias técnicas, servicios externos u otras circunstancias.',
          'Esto no supone una exclusión de las obligaciones ni de las responsabilidades legalmente exigibles.',
        ] },
        { title: 'Resultados comerciales', blocks: [
          'Salvo compromiso expresamente contratado, DOFRA no garantiza resultados económicos, posicionamiento en buscadores, cantidad de visitas, ventas, reservas, captación de clientes ni rentabilidad comercial.',
          'DOFRA responderá por las prestaciones tecnológicas asumidas y por las obligaciones legalmente aplicables.',
        ] },
        { title: 'Responsabilidad', blocks: [
          'La responsabilidad de DOFRA y de los usuarios se determinará conforme a las obligaciones asumidas, las circunstancias de cada caso y la legislación aplicable.',
          'Estos términos no excluyen ni limitan responsabilidades que legalmente no puedan ser excluidas o limitadas.',
        ] },
        { title: 'Protección de datos personales', blocks: [
          'El tratamiento de datos personales se rige por la [Política de Privacidad](/privacidad) de DOFRA.',
          'La información relativa al almacenamiento local y otras tecnologías utilizadas por el sitio se encuentra disponible en la [Política de Cookies y Almacenamiento Local](/cookies).',
        ] },
        { title: 'Derechos de los consumidores', blocks: [
          'Cuando corresponda una relación de consumo, resultarán aplicables la Ley 24.240 de Defensa del Consumidor, el Código Civil y Comercial de la Nación y las demás normas obligatorias.',
          'Se respetarán los derechos de información, garantía, revocación, arrepentimiento y cancelación que resulten aplicables.',
          'Ninguna disposición de estos términos podrá interpretarse como una renuncia a derechos irrenunciables del consumidor.',
          `Las solicitudes relacionadas con estos derechos podrán canalizarse a través de ${EMAIL}, sin perjuicio de otros mecanismos obligatorios que deban habilitarse.`,
          'Las solicitudes de arrepentimiento y de baja de servicios también pueden presentarse directamente mediante el [Botón de arrepentimiento](/arrepentimiento) y el [Botón de baja de servicio](/baja-de-servicio), sin necesidad de registro previo.',
        ] },
        { title: 'Modificaciones', blocks: [
          'DOFRA podrá actualizar estos términos para reflejar cambios en sus servicios, funcionamiento o legislación.',
          'Las modificaciones no alterarán unilateralmente las condiciones de contratos previamente celebrados, salvo en los supuestos legalmente permitidos.',
        ] },
        { title: 'Legislación y jurisdicción', blocks: [
          'Estos términos se interpretarán conforme a la legislación argentina aplicable.',
          'En las relaciones comerciales en las que resulte legalmente admisible, podrán acordarse los tribunales competentes de Córdoba, Argentina.',
          'Se respetarán las reglas de competencia y jurisdicción obligatorias, especialmente aquellas destinadas a proteger a los consumidores.',
        ] },
        { title: 'Contacto', blocks: [
          `Para consultas relacionadas con estos términos y condiciones, los usuarios podrán comunicarse mediante ${EMAIL}.`,
        ] },
      ],
    },
    privacy: {
      title: 'Política de privacidad',
      description: 'Cómo Dofra Software trata los datos personales recabados en su sitio institucional, con qué finalidades y cómo ejercer los derechos de acceso, rectificación y supresión.',
      updated: UPDATED,
      sections: [
        { title: 'Responsables del tratamiento', blocks: [
          `Franca Recchia y Victoria Recchia, quienes desarrollan su actividad profesional bajo la marca Dofra Software, en adelante DOFRA, son responsables del tratamiento de los datos personales recabados mediante el sitio institucional ${SITE}.`,
          'Ubicación de actividad: Nueva Córdoba, Córdoba Capital, Argentina.',
          `Correo electrónico: ${EMAIL}.`,
        ] },
        { title: 'Alcance', blocks: [
          'Esta política se aplica al sitio institucional de DOFRA y a las comunicaciones relacionadas con sus servicios.',
          'Las aplicaciones, plataformas y soluciones desarrolladas por DOFRA podrán contar con políticas de privacidad y condiciones específicas.',
        ] },
        { title: 'Datos personales recopilados', blocks: [
          'DOFRA podrá tratar los siguientes datos:',
          { list: [
            'Nombre y datos de identificación proporcionados por el usuario.',
            'Correo electrónico y teléfono, cuando sean proporcionados.',
            'Información profesional o comercial.',
            'Tipo de proyecto y presupuesto estimado.',
            'Preferencias de idioma y contenido de las consultas.',
            'Información técnica de conexión necesaria para el funcionamiento y la seguridad del sitio.',
            'Datos necesarios para la contratación, facturación y prestación de servicios.',
            'Datos incluidos en las solicitudes de arrepentimiento y de baja de servicios, como el servicio contratado y la referencia del presupuesto o contrato.',
          ] },
          'El usuario deberá abstenerse de proporcionar información sensible, credenciales o datos de terceros sin autorización mediante el formulario de contacto.',
        ] },
        { title: 'Finalidades del tratamiento', blocks: [
          'Los datos podrán utilizarse para:',
          { list: [
            'Atender consultas y solicitudes de información.',
            'Elaborar presupuestos y propuestas comerciales.',
            'Gestionar relaciones precontractuales y contractuales.',
            'Prestar servicios y brindar soporte técnico.',
            'Recibir, registrar y gestionar las solicitudes de arrepentimiento y de baja de servicios, y enviar las confirmaciones y comunicaciones relacionadas con ellas.',
            'Cumplir obligaciones legales, fiscales y administrativas, incluidas las previstas por la normativa de defensa del consumidor.',
            'Proteger la seguridad de los sistemas y prevenir usos indebidos.',
          ] },
          'El tratamiento se realizará con el consentimiento correspondiente o cuando resulte legalmente autorizado.',
        ] },
        { title: 'Comunicaciones comerciales', blocks: [
          'Actualmente, DOFRA no realiza campañas de newsletters ni envíos publicitarios periódicos mediante su sitio institucional.',
          'Si posteriormente incorpora estas actividades, solicitará las autorizaciones que correspondan y facilitará mecanismos gratuitos y sencillos para dejar de recibir comunicaciones promocionales.',
          'El consentimiento para comunicaciones publicitarias será independiente del necesario para gestionar consultas o prestar servicios.',
        ] },
        { title: 'Información proporcionada por los usuarios', blocks: [
          'Los campos identificados como obligatorios resultan necesarios para gestionar las solicitudes.',
          'La falta de información suficiente podrá impedir que DOFRA responda adecuadamente o preste los servicios solicitados.',
          'El usuario deberá proporcionar información veraz, actualizada y obtenida legítimamente.',
        ] },
        { title: 'Proveedores tecnológicos y destinatarios', blocks: [
          'DOFRA utiliza proveedores tecnológicos para el funcionamiento de su sitio y la gestión de sus comunicaciones, incluyendo:',
          { list: [
            'GitHub Pages, para el alojamiento del sitio institucional.',
            'Google Apps Script, para el procesamiento de las consultas enviadas mediante el formulario de contacto.',
            'Servicios de correo electrónico y comunicaciones necesarios para gestionar consultas y relaciones comerciales.',
          ] },
          { when: 'turnstile', block: 'Cloudflare Turnstile, de Cloudflare, Inc., para verificar que los envíos de los formularios no sean automatizados. Este servicio se carga únicamente al completar un formulario y puede procesar la dirección IP y datos técnicos del navegador y del dispositivo.' },
          { when: 'registry', block: 'Las solicitudes de arrepentimiento y de baja de servicios se reciben mediante Google Apps Script y se registran en una hoja de cálculo privada de Google Sheets, a la que solo acceden las responsables de DOFRA.' },
          'El proveedor de alojamiento podrá procesar información técnica de conexión, como direcciones IP y registros de acceso.',
          'Los datos podrán comunicarse a proveedores cuando resulte necesario para las finalidades informadas, así como a autoridades competentes cuando exista una obligación legal.',
          'DOFRA no comercializa datos personales.',
        ] },
        { title: 'Transferencias internacionales', blocks: [
          'La utilización de determinados proveedores tecnológicos puede implicar el procesamiento de datos personales fuera de Argentina.',
          'Cuando corresponda, DOFRA deberá contar con los mecanismos legalmente admitidos para dichas transferencias, conforme a la Ley 25.326 y su normativa complementaria.',
        ] },
        { title: 'Cookies y almacenamiento local', blocks: [
          'El sitio institucional no utiliza actualmente cookies de seguimiento, herramientas de publicidad personalizada ni sistemas de analítica web.',
          'Utiliza almacenamiento local del navegador para conservar la preferencia de idioma.',
          { when: 'turnstile', block: 'Al completar un formulario, Cloudflare Turnstile puede establecer cookies técnicas estrictamente necesarias para la verificación de seguridad, que no se utilizan con fines publicitarios ni de analítica.' },
          'Para obtener información adicional, el usuario podrá consultar la [Política de Cookies y Almacenamiento Local](/cookies).',
        ] },
        { title: 'Conservación de datos', blocks: [
          'Los datos se conservarán durante el tiempo necesario para cumplir las finalidades que motivaron su recopilación, atender obligaciones legales, gestionar relaciones contractuales y ejercer o defender derechos.',
          'Los registros de las solicitudes de arrepentimiento y de baja de servicios se conservarán durante el tiempo necesario para acreditar el cumplimiento de las obligaciones legales y contractuales correspondientes.',
          'Una vez finalizadas dichas finalidades, se procederá a su eliminación o anonimización cuando corresponda.',
        ] },
        { title: 'Seguridad y confidencialidad', blocks: [
          'DOFRA adoptará medidas técnicas y organizativas razonables y adecuadas para proteger los datos personales frente a accesos no autorizados, pérdida, alteración o divulgación indebida.',
          'La utilización de servicios tecnológicos no permite garantizar la inexistencia absoluta de incidentes de seguridad, sin perjuicio de las responsabilidades legalmente exigibles.',
        ] },
        { title: 'Derechos del titular', blocks: [
          'El titular podrá ejercer sus derechos de acceso, rectificación, actualización y supresión de datos personales, conforme a la legislación vigente.',
          `Las solicitudes podrán dirigirse a ${EMAIL}.`,
          'DOFRA podrá solicitar información razonablemente necesaria para verificar la identidad del solicitante.',
          'El derecho de acceso podrá ejercerse gratuitamente con una periodicidad no inferior a seis meses, salvo que se acredite un interés legítimo.',
          'Las solicitudes de acceso serán atendidas dentro del plazo legal de diez días corridos. Las solicitudes de rectificación, actualización o supresión serán atendidas dentro del plazo legal de cinco días hábiles, cuando corresponda.',
          'El titular podrá solicitar el retiro o bloqueo de sus datos utilizados con fines publicitarios.',
          'La Agencia de Acceso a la Información Pública, autoridad de control de la Ley 25.326, tiene atribuciones para atender denuncias y reclamos relacionados con el incumplimiento de las normas sobre protección de datos personales.',
        ] },
        { title: 'Enlaces externos', blocks: [
          'El sitio podrá contener enlaces a plataformas y servicios externos sujetos a sus propias políticas de privacidad.',
          'DOFRA no controla los tratamientos independientes realizados por dichos terceros, sin perjuicio de las responsabilidades que legalmente le correspondan.',
        ] },
        { title: 'Actualizaciones', blocks: [
          'DOFRA podrá modificar esta política para reflejar cambios normativos, tecnológicos u operativos.',
          'Cuando una modificación requiera un nuevo consentimiento, este será solicitado conforme a la legislación aplicable.',
        ] },
        { title: 'Legislación aplicable', blocks: [
          'La presente política se rige por la Ley 25.326 de Protección de Datos Personales, el Decreto 1558/2001 y las demás normas argentinas aplicables.',
        ] },
      ],
    },
    cookies: {
      title: 'Política de cookies y almacenamiento local',
      description: 'Tecnologías de almacenamiento del sitio institucional de Dofra Software: sin cookies ni analítica; solo almacenamiento local para recordar el idioma.',
      updated: UPDATED,
      sections: [
        { title: 'Alcance', blocks: [
          `La presente política describe las tecnologías de almacenamiento utilizadas en el sitio institucional ${SITE}, operado bajo la marca Dofra Software, en adelante DOFRA.`,
          'No comprende las aplicaciones, demostraciones, plataformas independientes ni sitios web de terceros accesibles mediante enlaces.',
        ] },
        { title: 'Uso de cookies', blocks: [
          { when: 'noTurnstile', block: 'Actualmente, el sitio institucional de DOFRA no utiliza cookies propias ni de terceros, herramientas de seguimiento publicitario, perfiles de navegación ni sistemas de analítica web.' },
          { when: 'turnstile', block: 'Actualmente, el sitio institucional de DOFRA no utiliza cookies propias, herramientas de seguimiento publicitario, perfiles de navegación ni sistemas de analítica web.' },
          { when: 'turnstile', block: 'Cuando el usuario completa un formulario, el servicio Cloudflare Turnstile, de Cloudflare, Inc., puede utilizar cookies técnicas de terceros estrictamente necesarias para verificar que el envío no es automatizado. Estas cookies no se utilizan con fines publicitarios ni de analítica, y su duración y funcionamiento se rigen por la política de cookies de Cloudflare.' },
        ] },
        { title: 'Almacenamiento local', blocks: [
          'El sitio utiliza la tecnología localStorage del navegador para conservar la preferencia de idioma y facilitar la navegación en futuras visitas.',
          'Tecnología utilizada:',
          { list: [
            'Identificador: dofra-lang.',
            'Proveedor: Dofra Software.',
            'Finalidad: recordar el idioma del sitio.',
            'Duración: hasta que el usuario elimine los datos almacenados en su navegador.',
            'Tipo: almacenamiento local de preferencias.',
          ] },
          'Esta información permanece almacenada localmente en el dispositivo y no se utiliza para identificar al usuario ni elaborar perfiles comerciales.',
        ] },
        { title: 'Gestión del almacenamiento', blocks: [
          'El usuario puede eliminar o restringir el almacenamiento local mediante la configuración de su navegador.',
          'Su eliminación no impide el acceso al sitio, aunque puede provocar que se restablezca el idioma predeterminado.',
        ] },
        { title: 'Servicios y enlaces externos', blocks: [
          'El sitio utiliza servicios tecnológicos externos para su alojamiento y para procesar las consultas enviadas mediante el formulario de contacto.',
          { when: 'turnstile', block: 'Al completar un formulario, el sitio utiliza Cloudflare Turnstile para prevenir envíos automatizados.' },
          'El tratamiento de los datos personales asociados a dichos servicios se describe en la [Política de Privacidad](/privacidad) de DOFRA.',
          'Los sitios externos accesibles mediante enlaces pueden aplicar sus propias políticas de cookies y privacidad.',
        ] },
        { title: 'Modificaciones', blocks: [
          'DOFRA podrá actualizar esta política como consecuencia de cambios tecnológicos, operativos o normativos.',
          'Si se incorporan tecnologías que requieran consentimiento, se implementarán los mecanismos correspondientes conforme a la legislación aplicable.',
        ] },
        { title: 'Contacto', blocks: [
          `Para consultas relacionadas con esta política, el usuario podrá comunicarse mediante ${EMAIL}.`,
        ] },
      ],
    },
  },
}
