import type { Locale } from './config';

/**
 * Zentrales UI-Wörterbuch. Nur menschlich sichtbare Strings. Terminal-Befehle als
 * Eyebrow (`ls projekte/`, `whoami`, `cat …`) bleiben sprachneutral (sie sind „Code“,
 * Teil der Design-Identität und werden NICHT übersetzt).
 *
 * Zugriff über `t(locale, 'key')`. Fehlt ein Key in EN, fällt er auf DE zurück.
 */
type Dict = Record<string, string>;

const de: Dict = {
  // Navigation
  'nav.projekte': 'Projekte',
  'nav.uber': 'Über mich',
  'nav.uberShort': 'Über',
  'nav.toolbox': 'Toolbox',
  'nav.jetzt': 'Jetzt',
  'nav.kontakt': 'Kontakt',
  'nav.cv': 'Lebenslauf',
  'nav.start': 'Start',
  'nav.startseite': 'Startseite',

  // Aktionen / Buttons
  'action.viewProjects': 'Projekte ansehen',
  'action.contact': 'Kontakt',
  'action.cv': 'Lebenslauf',
  'action.allProjects': 'alle Projekte ansehen',
  'action.viewDetail': 'Detail ansehen',
  'action.toContactForm': 'Zum Kontaktformular',
  'action.openLive': 'live öffnen',
  'action.viewProjectsShort': 'Projekte ansehen',
  'action.reset': 'Filter zurücksetzen',
  'action.caseStudy': 'cat fall-studie.md',

  // Hero / Startseite
  'hero.badge.live': 'live',
  'hero.badge.built': 'selbst gebaut & betrieben',
  'hero.deployed': 'deployed',
  'hero.boot.online': 'alle Systeme online',
  'hero.boot.selfRun': 'selbst gehostet & betrieben',
  'hero.row.role': 'Rolle',
  'hero.row.location': 'Standort',
  'hero.row.language': 'Sprache',
  'hero.row.mode': 'Modus',
  'hero.row.focus': 'Fokus',
  'hero.row.languageValue': 'Deutsch · Englisch',
  'hero.row.modeValue': 'Remote · LAN-First',
  'hero.row.focusValue': 'Linux · Infrastruktur · Betrieb',
  'home.featured.title': 'Drei Projekte, drei Anker',
  'home.featured.lead':
    'Das sind eigene Systeme, die ich gebaut habe und seit Jahren selbst betreibe. Wenn eins davon nachts ausfällt, repariere ich es. Drei davon als Anker, der Rest in der vollen Liste.',
  'home.proof.running': 'Im Dauerbetrieb',
  'home.proof.servicesLive': 'verwaltete Services',
  'home.proof.driftSuffix': 'Drift in der Service-Map',
  'home.proof.hosts': 'Hosts',
  'home.proof.hostRoles': 'Control · Public · AI · Edge · 3× x86',
  'home.proof.since': 'Seit',
  'home.proof.sinceNote': 'durchgehend im Eigenbetrieb',
  'home.proof.selfRun': 'selbst betrieben und überwacht',
  'home.proof.lastDeploy': 'letzter Deploy',
  'home.proof.online': 'online',
  'home.proof.snapshot': 'Momentaufnahme',
  'home.proof.measured': 'extern gemessen',
  'home.proof.reachableLive': 'Endpunkte erreichbar',
  'home.proof.availability': 'Verfügbarkeit',
  'home.proof.publicReachable': 'öffentlich erreichbar:',
  'home.cta.headline': 'Fragen, Feedback, oder einfach hallo.',
  'home.cta.body':
    'Wenn dich eins der Projekte interessiert, du eine Frage zur Umsetzung hast oder dich sonst melden willst, kurze Nachricht reicht, ich lese mit.',

  // Status
  'status.live': 'live',
  'status.im-aufbau': 'im Aufbau',
  'status.wartung': 'Wartung',
  'status.pivot': 'eingestellt',

  // Projekt-Meta
  'project.role': 'Rolle',
  'project.metric': 'Kennzahl',
  'meta.readingMin': 'Min Lesezeit',

  // Projekte-Seite
  'projects.title': 'Was hier gebaut wurde.',
  'projects.lead':
    'Jedes Projekt hier läuft oder ist gerade im Bau, keines ist eine Tutorial-Übung. Featured oben, darunter die Projekte im Betrieb und das Lab, filterbar nach Domäne und Stack.',
  'projects.filterDomain': 'Filter nach Domäne',
  'projects.filterStack': 'Filter nach Stack',
  'projects.all': 'alle',
  'projects.stacks': 'stacks',
  'projects.active': 'aktiv',
  'projects.byStack': 'nach Stack filtern',
  'projects.hits': 'Treffer',
  'projects.inBetrieb': 'Im Betrieb',
  'projects.inBetriebLead': 'Läuft produktiv oder in Wartung, nach Domäne gruppiert.',
  'projects.lab': 'Lab',
  'projects.labLead': 'In Arbeit und Experimente, die gerade reifen, noch nicht im Dauerbetrieb.',
  'projects.noMatches': 'no matches',
  'projects.noMatchesNote': 'Mit dieser Stack-Auswahl ist gerade nichts dabei.',
  'projects.projekt': 'Projekt',
  'projects.projekte': 'Projekte',

  // Kontakt
  'kontakt.title': 'Kontakt.',
  'kontakt.lead':
    'Ob Frage zu einem Projekt, Feedback oder einfach hallo: Eine kurze Nachricht reicht. Sie landet direkt bei mir, nicht in einem Ticketsystem, und ich lese jede selbst.',
  'kontakt.ways': 'cat kontaktwege.txt',
  'kontakt.mailDirect': 'Mail direkt',
  'kontakt.cvView': 'Lebenslauf ansehen',
  'kontakt.builtProjects': 'gebaute Projekte',
  'kontakt.signalNote': 'verschlüsselt schreiben, ohne Nummer zu teilen',
  'kontakt.pgpNote': 'Public Key für verschlüsselte Mail',
  'kontakt.secureHint':
    'Für Vertrauliches: per Signal oder als PGP-verschlüsselte Mail an die Adresse oben.',
  'form.name': 'Name',
  'form.email': 'E-Mail',
  'form.subject': 'Betreff',
  'form.message': 'Nachricht',
  'form.send': 'Nachricht senden',
  'form.sending': 'sende …',
  'form.sent': 'gesendet',
  'form.success': 'Die Nachricht ist angekommen. Ich melde mich zurück.',
  'form.errorFields': 'Bitte Name, E-Mail und Nachricht ausfüllen.',
  'form.errorGeneric': 'Konnte nicht gesendet werden. Bitte später erneut oder direkt per Mail.',

  // Footer
  'footer.navigation': 'Navigation',
  'footer.resources': 'Mehr',
  'footer.legal': 'Rechtliches',
  'footer.impressum': 'Impressum',
  'footer.datenschutz': 'Datenschutz',
  'footer.build': 'Build',
  'footer.tagline': 'Selbst gebaut, selbst betrieben.',
  'footer.elsewhere': 'Profile',
  'footer.quelltext': 'Quelltext dieser Seite',

  // 404
  'notfound.eyebrow': '404: nicht gefunden',
  'notfound.title': 'Diese Seite existiert nicht.',
  'notfound.body':
    'Wenn ein Link hierher zeigt, ist das ein Bug, und Bugs interessieren mich. Eine kurze Mail reicht. Ansonsten geht es hier weiter:',
  'notfound.home': 'Zur Startseite',
  'notfound.homeSub': 'Pitch, Live-Beweis, Auswahl-Projekte.',
  'notfound.projectsSub': 'Übersicht mit Stack-Filter.',
  'notfound.contactSub': 'Formular oder direkte Mail.',
  'notfound.toolboxSub': 'Stack, Setup und Zahlen.',

  // Command Palette
  'palette.placeholder': 'Befehl oder Seite suchen',
  'palette.pages': 'Seiten',
  'palette.projects': 'Projekte',
  'palette.actions': 'Aktionen',
  'palette.empty': 'Nichts gefunden',
  'palette.open': 'Schnellsuche',

  // TopBar
  'topbar.menuOpen': 'Menü öffnen',
  'topbar.menuClose': 'Menü schließen',

  // Sprachumschalter
  'lang.switch': 'Sprache wechseln',
  'skip.toContent': 'Zum Inhalt',

  // Detail
  'detail.related': 'Verwandte Projekte',
  'detail.moreFromDomain': 'Mehr aus dieser Domäne',
  'detail.prev': 'Vorheriges',
  'detail.next': 'Nächstes',
  'detail.inArbeit': 'in Arbeit',
  'detail.liveScreenshot': 'Screenshot der Live-Seite, beim Deploy erneuert',
};

const en: Dict = {
  // Navigation
  'nav.projekte': 'Projects',
  'nav.uber': 'About',
  'nav.uberShort': 'About',
  'nav.toolbox': 'Toolbox',
  'nav.jetzt': 'Now',
  'nav.kontakt': 'Contact',
  'nav.cv': 'Résumé',
  'nav.start': 'Start',
  'nav.startseite': 'Home',

  // Actions / Buttons
  'action.viewProjects': 'View projects',
  'action.contact': 'Contact',
  'action.cv': 'Résumé',
  'action.allProjects': 'view all projects',
  'action.viewDetail': 'View details',
  'action.toContactForm': 'To the contact form',
  'action.openLive': 'open live',
  'action.viewProjectsShort': 'View projects',
  'action.reset': 'Reset filters',
  'action.caseStudy': 'cat case-study.md',

  // Hero / Home
  'hero.badge.live': 'live',
  'hero.badge.built': 'self-built & self-run',
  'hero.deployed': 'deployed',
  'hero.boot.online': 'all systems online',
  'hero.boot.selfRun': 'self-hosted & self-run',
  'hero.row.role': 'Role',
  'hero.row.location': 'Location',
  'hero.row.language': 'Languages',
  'hero.row.mode': 'Mode',
  'hero.row.focus': 'Focus',
  'hero.row.languageValue': 'German · English',
  'hero.row.modeValue': 'Remote · LAN-first',
  'hero.row.focusValue': 'Linux · infrastructure · operations',
  'home.featured.title': 'Three projects, three anchors',
  'home.featured.lead':
    'These are my own systems, built and run by me, over years, in real use, with responsibility for operations and security. Three as anchors, the rest in the full list.',
  'home.proof.running': 'In production',
  'home.proof.servicesLive': 'services managed',
  'home.proof.driftSuffix': 'drift in the service map',
  'home.proof.hosts': 'Hosts',
  'home.proof.hostRoles': 'Control · Public · AI · Edge · 3× x86',
  'home.proof.since': 'Since',
  'home.proof.sinceNote': 'self-run without interruption',
  'home.proof.selfRun': 'self-run and self-monitored',
  'home.proof.lastDeploy': 'last deploy',
  'home.proof.online': 'online',
  'home.proof.snapshot': 'snapshot',
  'home.proof.measured': 'measured externally',
  'home.proof.reachableLive': 'endpoints reachable',
  'home.proof.availability': 'availability',
  'home.proof.publicReachable': 'publicly reachable:',
  'home.cta.headline': 'Questions, feedback, or just hello.',
  'home.cta.body':
    'If one of the projects caught your eye, you have a question about how it was built, or you just want to reach out. A short message is enough, I read them.',

  // Status
  'status.live': 'live',
  'status.im-aufbau': 'in progress',
  'status.wartung': 'maintenance',
  'status.pivot': 'discontinued',

  // Project meta
  'project.role': 'Role',
  'project.metric': 'Highlight',
  'meta.readingMin': 'min read',

  // Projects page
  'projects.title': 'What was built here.',
  'projects.lead':
    'Every project is running or actively growing. None is a tutorial exercise. Featured up top, then projects in production and the lab still in progress, filterable by domain and stack.',
  'projects.filterDomain': 'Filter by domain',
  'projects.filterStack': 'Filter by stack',
  'projects.all': 'all',
  'projects.stacks': 'stacks',
  'projects.active': 'active',
  'projects.byStack': 'filter by stack',
  'projects.hits': 'matches',
  'projects.inBetrieb': 'In production',
  'projects.inBetriebLead': 'Running in production or under maintenance, grouped by domain.',
  'projects.lab': 'Lab',
  'projects.labLead': 'Work in progress and experiments still maturing, not yet in production.',
  'projects.noMatches': 'no matches',
  'projects.noMatchesNote': 'Nothing fits this stack selection right now.',
  'projects.projekt': 'project',
  'projects.projekte': 'projects',

  // Contact
  'kontakt.title': 'Contact.',
  'kontakt.lead':
    'A question about a project, feedback, or just hello. A short message is enough. It comes straight to me, not into a ticket system, and I read every one myself.',
  'kontakt.ways': 'cat contact-ways.txt',
  'kontakt.mailDirect': 'mail directly',
  'kontakt.cvView': 'view résumé',
  'kontakt.builtProjects': 'projects I built',
  'kontakt.signalNote': 'message me encrypted, without sharing a number',
  'kontakt.pgpNote': 'public key for encrypted mail',
  'kontakt.secureHint':
    'For anything confidential: via Signal or as PGP-encrypted mail to the address above.',
  'form.name': 'Name',
  'form.email': 'Email',
  'form.subject': 'Subject',
  'form.message': 'Message',
  'form.send': 'Send message',
  'form.sending': 'sending …',
  'form.sent': 'sent',
  'form.success': 'Your message arrived. I will get back to you.',
  'form.errorFields': 'Please fill in name, email and message.',
  'form.errorGeneric': 'Could not be sent. Please try again later or email me directly.',

  // Footer
  'footer.navigation': 'Navigation',
  'footer.resources': 'More',
  'footer.legal': 'Legal',
  'footer.impressum': 'Imprint',
  'footer.datenschutz': 'Privacy',
  'footer.build': 'Build',
  'footer.tagline': 'Self-built, self-run.',
  'footer.elsewhere': 'Elsewhere',
  'footer.quelltext': 'Source of this site',

  // 404
  'notfound.eyebrow': '404: not found',
  'notfound.title': 'This page does not exist.',
  'notfound.body':
    'If a link led you here, that is a bug, and bugs interest me. A short mail is enough. Otherwise, continue here:',
  'notfound.home': 'To the home page',
  'notfound.homeSub': 'Pitch, live proof, selected projects.',
  'notfound.projectsSub': 'Overview with stack filter.',
  'notfound.contactSub': 'Form or direct mail.',
  'notfound.toolboxSub': 'Stack, setup and numbers.',

  // Command Palette
  'palette.placeholder': 'Search command or page',
  'palette.pages': 'Pages',
  'palette.projects': 'Projects',
  'palette.actions': 'Actions',
  'palette.empty': 'Nothing found',
  'palette.open': 'Quick search',

  // TopBar
  'topbar.menuOpen': 'Open menu',
  'topbar.menuClose': 'Close menu',

  // Language switcher
  'lang.switch': 'Switch language',
  'skip.toContent': 'Skip to content',

  // Detail
  'detail.related': 'Related projects',
  'detail.moreFromDomain': 'More from this domain',
  'detail.prev': 'Previous',
  'detail.next': 'Next',
  'detail.inArbeit': 'in progress',
  'detail.liveScreenshot': 'Screenshot of the live site, refreshed on each deploy',
};

const messages: Record<Locale, Dict> = { de, en };

/** Übersetzt einen Key. Fehlt er in der Ziel-Sprache, greift DE als Fallback, sonst der Key. */
export function t(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? messages.de[key] ?? key;
}

export { messages };
