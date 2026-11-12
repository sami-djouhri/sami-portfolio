import type { Fallstudie } from './typ';

// Neu erhoben am 2026-11-01 (vorher Uebergangsform mit altem Englisch). Die
// deutsche Fassung war dabei selbst veraltet: Wertsachen/Assets sind am 01.11.
// im Lager aufgegangen, die App-Zugangslisten am 03.10. gefallen, und seit dem
// 21.10. ist Saganta privat (nur im eigenen Netz, Entscheid).
//
// Messbefehle, damit die naechste Runde dieselbe Abgrenzung nimmt:
// - Apps: `services/shell-api/app/registry.py` ohne Startflaeche und ohne die
//   vier Hausdienste (medien, wissen, bibliothek, karten), 13. Finanzen zaehlt
//   mit (Entscheid 2026-11-08, Umzug ins Monorepo geplant), meldet sich
//   bis dahin aber ueber Authelia an, deshalb „fast alle hinter einer Anmeldung“.
// - Dienste: Ordner unter `docker/saganta/services/` ohne `_geteilt`, 10.
// - Tests: alle .py/.ts/.tsx/.svelte unter docker/saganta, OHNE node_modules,
//   .svelte-kit, build, dist, venv, __pycache__, Muster `def test_` sowie
//   `it(`/`test(`. Ergab 854 am 2026-11-08 (01.11.: 692, 06.10.: 504). Auf der
//   Seite als Groessenordnung.
// - Native Apps: `grep -l applicationId docker/saganta-apps/app-*/build.gradle.kts`
//   ohne Starter und die Hausdienste bibliothek/karten ergab am 2026-11-08 9
//   Android, dazu 8 `app-*-desktop` als Linux-Programm.
// - Zugangslisten: `bash scripts/gate-oeffnen.sh --status` im Saganta-Repo.
//   Alle `app`-Gates offen; `post` (Briefe) und `notizen` (Rueckfall) bleiben
//   bewusst zu, sie bedeuten dort etwas anderes.
const saganta: Fallstudie = {
  modules: [
    { de: 'Kalender', en: 'Calendar' },
    { de: 'Aufgaben', en: 'Tasks' },
    { de: 'Notizen', en: 'Notes' },
    { de: 'Post', en: 'Mail and letters' },
    { de: 'News', en: 'News' },
    { de: 'Projekt-Deck', en: 'Project deck' },
    { de: 'Tagebuch', en: 'Journal' },
    { de: 'Fitness', en: 'Fitness' },
    { de: 'Essensplanung', en: 'Meal planning' },
    { de: 'Lager', en: 'Inventory' },
    { de: 'Kontakte', en: 'Contacts' },
    { de: 'Einkaufsliste', en: 'Shopping list' },
    { de: 'Finanzen', en: 'Finances' },
  ],
  problem: {
    de: 'Meine Werkzeuge lagen bei fünf verschiedenen Anbietern. Mail bei einem, Kalender beim nächsten, Aufgaben beim dritten. Die Handy-App zeigte selten dieselben Daten wie der Browser. Daraus wurde eine eigene Suite mit dreizehn Apps für Browser, Handy und Linux-Desktop, fast alle hinter einer Anmeldung. Sie ist privat und nur im eigenen Netz erreichbar, weil dort viele persönliche Daten liegen.',
    en: 'My tools were spread across five different providers. Mail with one, calendar with the next, tasks with a third. The phone app rarely showed the same data as the browser. That turned into a suite of my own with thirteen apps for browser, phone and Linux desktop, nearly all behind one login. It is private and only reachable inside my own network, because it holds a lot of personal data.',
  },
  approach: [
    {
      de: 'Eine gemeinsame Startfläche trägt Aussehen, Sprache und Einstellungen. Jede App darunter erbt sie. Alles Geteilte liegt als versioniertes Paket in einem gemeinsamen Quelltext-Baum, von den Bedienelementen bis zum Zugriff auf die Backends. Eine Korrektur dort wirkt in allen Apps.',
      en: 'A shared start page carries look, language and settings. Every app below it inherits them. Everything shared lives as a versioned package in one source tree, from the controls to the access to the backends. A fix there applies to every app.',
    },
    {
      de: 'Vor jedem Backend sitzt eine eigene Zwischenschicht je Bereich. Der Browser spricht nur mit ihr. Sie prüft die Anmeldung und reicht nur die Felder zurück, die er sehen darf.',
      en: 'Each area has its own layer in front of its backend (a backend-for-frontend). The browser only talks to that layer. It checks the login and passes back only the fields the browser is allowed to see.',
    },
    {
      de: 'Die Anmeldung läuft über einen eigenen, schlanken Dienst auf Basis von better-auth. Für die Android- und Linux-Apps stellt er ein kurzlebiges Token aus. Alle Oberflächen nutzen dieselbe Identität.',
      en: 'Sign-in runs through a lean service of my own built on better-auth. It issues a short-lived token for the Android and Linux apps. Every surface uses the same identity.',
    },
    {
      de: 'Der Mail-Teil bindet fremde Konten über OAuth2 ein und frischt die Zugangstoken selbst auf. Zwischengespeichert werden nur Kopfdaten. Der Text einer Nachricht wird erst beim Öffnen geholt.',
      en: 'The mail part connects external accounts through OAuth2 and refreshes the access tokens itself. Only headers are cached. The text of a message is fetched when it is opened.',
    },
    {
      de: 'Jede Datenroute ist an einen Mandanten gebunden. Ein Werkzeug liest den Quelltext und meldet Routen ohne erkennbare Bindung. Ein zweites fragt den laufenden Dienst mit zwei Konten und sieht nach, was er tatsächlich herausgibt.',
      en: 'Every data route is bound to a tenant. One tool reads the source and reports routes without a visible binding. A second one queries the running service with two accounts and checks what it actually returns.',
    },
    {
      de: 'Anfangs trug jeder Dienst eine Zugangsliste mit genau einem Eintrag. Sie ist bei allen App-Diensten entfernt, jeweils erst nach dem Nachweis am laufenden Dienst.',
      en: 'At first every service carried an access list with exactly one entry. It is gone from every app service, each time only after the check against the running service had passed.',
    },
    {
      de: 'Für jeden Dienst gibt es einen Löschplan, der ein Konto mit allen Daten entfernt. Ein Test schlägt fehl, sobald eine neue Tabelle mit Nutzerbezug darin fehlt.',
      en: 'Every service has a deletion plan that removes an account with all its data. A test fails as soon as a new table holding user data is missing from it.',
    },
    {
      de: 'Das Tagebuch verschlüsselt im Browser. Der Server verwahrt nur verschlüsselte Einträge, und sein Dienst hat keinen Weg ins Internet.',
      en: 'The journal encrypts in the browser. The server only keeps encrypted entries, and its service has no route to the internet.',
    },
  ],
  architecture: {
    summary: {
      de: 'Browser und native Apps melden sich beim selben Dienst an. Je Bereich kapselt eine Zwischenschicht das eigentliche Backend und reicht nur Erlaubtes durch. Jede Datenroute ist an einen Mandanten gebunden. Backends und Datenbanken sind nur aus dem eigenen Netz erreichbar.',
      en: 'Browser and native apps sign in against the same service. In each area a layer wraps the actual backend and passes through only what is allowed. Every data route is bound to a tenant. Backends and databases are only reachable from inside my own network.',
    },
    tiers: [
      {
        label: { de: 'Oberflächen', en: 'Clients' },
        nodes: [
          { id: 'shell', label: { de: 'Startfläche', en: 'Start page' }, note: { de: 'Browser', en: 'browser' }, kind: 'edge' },
          { id: 'subapps', label: { de: '13 Apps', en: '13 apps' }, kind: 'edge' },
          { id: 'native', label: { de: 'Android und Linux', en: 'Android and Linux' }, note: { de: 'native Apps', en: 'native apps' }, kind: 'edge' },
        ],
      },
      {
        label: { de: 'Anmeldung', en: 'Sign-in' },
        nodes: [
          { id: 'auth', label: { de: 'Anmelde-Dienst', en: 'Sign-in service' }, note: { de: 'better-auth · Sitzung + Token', en: 'better-auth · session + token' }, kind: 'core' },
          { id: 'gate', label: { de: 'Mandanten-Bindung', en: 'Tenant binding' }, note: { de: 'an jeder Datenroute', en: 'on every data route' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Zwischenschicht', en: 'Mediation layer' },
        nodes: [
          { id: 'mailbff', label: { de: 'Mail', en: 'Mail' }, kind: 'core' },
          { id: 'calbff', label: { de: 'Kalender', en: 'Calendar' }, kind: 'core' },
          { id: 'notizbff', label: { de: 'Notizen', en: 'Notes' }, kind: 'core' },
          { id: 'deckbff', label: { de: 'Projekt-Deck', en: 'Project deck' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Backends & Daten', en: 'Backends & data' },
        nodes: [
          { id: 'mailagg', label: { de: 'Mail-Sammler', en: 'Mail aggregator' }, note: { de: 'OAuth2, nur Kopfdaten', en: 'OAuth2, headers only' }, kind: 'consumer' },
          { id: 'calnative', label: { de: 'Kalender-Engine', en: 'Calendar engine' }, note: { de: 'eigenes Backend', en: 'own backend' }, kind: 'consumer' },
          { id: 'db', label: { de: 'Datenbanken', en: 'Databases' }, note: { de: 'eine je Bereich', en: 'one per area' }, kind: 'data' },
        ],
      },
    ],
    flows: [
      { from: 'shell', to: 'auth', label: { de: 'Sitzung', en: 'session' } },
      { from: 'native', to: 'auth', label: { de: 'Token', en: 'token' } },
      { from: 'auth', to: 'gate' },
      { from: 'gate', to: 'mailbff', label: { de: 'angemeldet + Mandant', en: 'signed in + tenant' } },
      { from: 'mailbff', to: 'mailagg', label: { de: 'nur Kopfdaten', en: 'headers only' } },
      { from: 'calbff', to: 'calnative', label: { de: 'gekapselt', en: 'wrapped' } },
      { from: 'notizbff', to: 'db' },
      { from: 'deckbff', to: 'db' },
    ],
  },
  result: [
    {
      de: 'Dreizehn Apps unter einer Startfläche, zehn eigene Dienste dahinter, abgesichert mit rund 850 Testfunktionen.',
      en: 'Thirteen apps under one start page, ten services of my own behind them, covered by around 850 test functions.',
    },
    {
      de: 'Neun davon gibt es auch als Android-App, acht zusätzlich als Linux-Programm. Alle melden sich mit demselben Konto an.',
      en: 'Nine of them also exist as Android apps, eight also as Linux programs. All of them sign in with the same account.',
    },
    {
      de: 'Die Mandantentrennung ist am laufenden Dienst belegt. Jede bewusste Ausnahme steht mit Begründung in einer Liste.',
      en: 'Tenant separation is proven against the running services. Every deliberate exception is listed with its reason.',
    },
  ],
  decisions: [
    {
      title: { de: 'Nur im eigenen Netz erreichbar', en: 'Only reachable inside my own network' },
      body: {
        de: 'Bis Oktober 2026 konnte man sich auch aus dem Internet anmelden. Die Suite trägt Mail, Briefe, Termine und ein Tagebuch. Für einen Familienkreis wiegt eine Anmeldung von außen dieses Risiko nicht auf. Deshalb führt kein öffentlicher Name mehr zu ihr.',
        en: 'Until October 2026 you could also sign in from the internet. The suite holds mail, letters, appointments and a journal. For a family circle, signing in from outside is not worth that risk. So no public name leads to it anymore.',
      },
    },
    {
      title: { de: 'Zwei Prüfungen für die Mandantentrennung', en: 'Two checks for tenant separation' },
      body: {
        de: 'Die eine liest den Quelltext, die andere fragt den laufenden Dienst mit zwei Konten. Beides wird gebraucht. Eine Route kann sauber gebunden sein und über eine ungefilterte Verknüpfung trotzdem fremde Daten zeigen.',
        en: 'One reads the source, the other queries the running service with two accounts. Both are needed. A route can be bound correctly and still show other users’ data through an unfiltered join.',
      },
    },
    {
      title: { de: 'Das Prüfwerkzeug findet Kandidaten, es entscheidet nichts', en: 'The checker finds candidates, it decides nothing' },
      body: {
        de: 'Jeder Treffer wird von Hand angesehen. Jeder bewusst globale Endpunkt bekommt eine Ausnahme mit Begründung.',
        en: 'Every hit is reviewed by hand. Every deliberately global endpoint gets an exception with a reason.',
      },
    },
    {
      title: { de: 'Das Test-Token entsteht im Container', en: 'The test token is created inside the container' },
      body: {
        de: 'Für den Nachweis am laufenden Dienst braucht es ein gültiges Anmelde-Token. Es entsteht im Container mit dem Geheimnis, das dort ohnehin liegt, und verlässt ihn nicht. Von außen müsste man dafür das Backend-Geheimnis herausreichen.',
        en: 'The check against the running service needs a valid sign-in token. It is created inside the container with the secret that is already there, and never leaves it. From outside, the backend secret would have to be handed out.',
      },
    },
    {
      title: { de: 'Nur Kopfdaten der Mails', en: 'Only mail headers' },
      body: {
        de: 'Der Mail-Teil speichert Absender, Betreff und Zeitpunkt. Der Nachrichtentext bleibt beim Anbieter. Das hält die eigene Datenhaltung klein.',
        en: 'The mail part stores sender, subject and time. The message text stays with the provider. That keeps my own data storage small.',
      },
    },
    {
      title: { de: 'Eigener Anmelde-Dienst', en: 'A sign-in service of my own' },
      body: {
        de: 'Der erste Anlauf lief über einen großen fertigen Anbieter. Für einen Nutzerkreis, den ich kenne, war das zu viel Aufwand. Ein Token für die nativen Apps auszustellen war damit umständlicher als mit einer eigenen Sitzung.',
        en: 'The first attempt ran through a large ready-made provider. For a circle of users I know, that was too much overhead. Issuing a token for the native apps was more awkward with it than with a session of my own.',
      },
    },
  ],
  metrics: [
    { label: { de: 'Umfang', en: 'Scope' }, value: { de: '13 Apps · 10 Dienste', en: '13 apps · 10 services' } }, // zahlen-gate:fremd (Saganta-eigene Dienste, nicht die des Hauses)
    { label: { de: 'Tests', en: 'Tests' }, value: { de: 'rund 850 Testfunktionen', en: 'around 850 test functions' } },
    { label: { de: 'Mandantentrennung', en: 'Tenant separation' }, value: { de: 'am laufenden Dienst belegt', en: 'proven on the running services' } },
    { label: { de: 'Oberflächen', en: 'Surfaces' }, value: { de: 'Browser, Android, Linux', en: 'browser, Android, Linux' } },
  ],
  timeline: [
    { when: { de: 'Q1 2026', en: 'Q1 2026' }, what: { de: 'Startfläche, eigene Anmeldung, erste Apps', en: 'Start page, own sign-in, first apps' } },
    { when: { de: 'Q2 2026', en: 'Q2 2026' }, what: { de: 'Mail über OAuth2, Kalender und Projekt-Deck', en: 'Mail through OAuth2, calendar and project deck' } },
    { when: { de: 'Q2 2026', en: 'Q2 2026' }, what: { de: 'Android-Apps mit derselben Anmeldung', en: 'Android apps with the same sign-in' } },
    { when: { de: 'Q3 2026', en: 'Q3 2026' }, what: { de: 'Mandantentrennung nachgewiesen, Löschweg für Konten', en: 'Tenant separation proven, account deletion' } },
    { when: { de: 'Q4 2026', en: 'Q4 2026' }, what: { de: 'Zugangslisten entfernt, Linux-Programme, nur noch im eigenen Netz', en: 'Access lists removed, Linux programs, only inside my own network' } },
  ],
  // Die Grenzen beschreiben den DIENST, nicht die Person dahinter
  // (Entscheid 2026-10-21, gleicher Schnitt in `homelab` und
  // `defense-in-depth`). Die alte erste Grenze („bis dahin ist die
  // Mehrnutzer-Faehigkeit je Dienst unterschiedlich weit") ist mit dem Fallen
  // der Zugangslisten am 03.10. erledigt. Die neue zweite stammt aus
  // `docs/SELBSTHOSTEN_BEFUND.md` im Saganta-Repo: dort 6 von 11, mit `assets`;
  // seit dessen Ende 5 von 10 (kalender, post, lager, mealprep, fitness); am
  // 2026-11-08 kamen einkaufsliste und finanzen dazu (eigene Projekte), 7 von 13.
  limits: [
    {
      de: 'Die Suite ist nur im eigenen Netz erreichbar, das gilt auch für die Handy-Apps.',
      en: 'The suite is only reachable inside my own network, and that includes the phone apps.',
    },
    {
      de: 'Sieben der dreizehn Apps brauchen Dienste aus anderen Projekten. Wer die Suite anderswo installieren will, braucht diese Projekte mit.',
      en: 'Seven of the thirteen apps need services from other projects. Installing the suite elsewhere means bringing those projects along.',
    },
    {
      de: 'Der Mail-Teil hängt an den Anbietern, deren Konten er einbindet. Ändert einer seinen Anmeldeweg, muss ich nachziehen.',
      en: 'The mail part depends on the providers whose accounts it connects. If one of them changes its sign-in, I have to follow.',
    },
  ],
};

export default saganta;
