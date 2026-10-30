import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 7/6; decisions 6/4; Ebene 1: auth/core/true,gate/core/true <> auth/core/true; Pfeile: shell>auth/true,native>auth/true,auth>gate/false,gate>mailbff/true,mailbff>mailagg/true,calbff>calnative/true,deckbff>db/false <> shell>auth/true,native>auth/true,shell>mailbff/true,mailbff>mailagg/true,calbff>calnative/true,deckbff>db/false
const saganta: FallstudieAlt = {
  form: 'uebergang',
  de: {
    modules: [
      'Mail',
      'Kalender',
      'Wertsachen',
      'Vorrat',
      'Essensplanung',
      'Post',
      'Projekt-Deck',
    ],
    problem: 'Meine Werkzeuge lagen bei fünf verschiedenen Anbietern. Mail bei einem, Kalender beim nächsten, Aufgaben beim dritten. Jeder will, dass man in seiner Oberfläche bleibt, und die Handy-App zeigt selten dieselben Daten wie der Browser. Daraus wurde eine eigene Suite mit zwölf Anwendungen und einer Anmeldung für Web und Handy. Der schwierige Teil war nicht das Bauen, sondern die Öffnung für weitere Nutzer: ein Dienst, der für genau eine Person geschrieben wurde, zeigt bei zwei Konten früher oder später fremde Daten.',
    approach: [
      'Eine gemeinsame Startfläche trägt Aussehen, Sprache und Einstellungen. Jede App darunter erbt sie. Alles Geteilte liegt als versioniertes Paket in einem gemeinsamen Quelltext-Baum, von den Bedienelementen bis zum Zugriff auf die Backends.',
      'Vor jedem Backend sitzt eine eigene Zwischenschicht je Bereich. Der Browser spricht nur mit ihr, sie prüft die Anmeldung und reicht nur die Felder zurück, die er sehen darf. Das eigentliche Backend steht damit nie im offenen Netz.',
      'Die Anmeldung läuft über einen eigenen, schlanken Dienst auf Basis von better-auth und stellt für die Android-Apps ein kurzlebiges Token aus. Handy und Browser nutzen dieselbe Identität, es gibt keinen zweiten Anmeldeweg.',
      'Der Mail-Teil bindet fremde Konten über OAuth2 ein, samt Auffrischung der Zugangstoken. Abgerufen und zwischengespeichert werden nur Kopfdaten, nie der Inhalt der Nachrichten. Ein zweiter Mailserver entsteht dadurch nicht.',
      'Jede Datenroute ist an einen Mandanten gebunden. Geprüft wird das auf zwei Wegen, die sich nicht ersetzen: ein Werkzeug liest den Quelltext und findet Routen ohne erkennbare Bindung, ein zweites fragt den laufenden Dienst mit zwei Konten und sieht nach, was er tatsächlich herausgibt.',
      'Vierzehn Stellen trugen eine Zugangsliste mit genau einem Eintrag. Sie fallen einzeln, und jede erst, nachdem für diesen Dienst nachgewiesen ist, dass die Trennung auch ohne sie trägt.',
      'Notizen lassen sich öffentlich freigeben, ohne dass der Empfänger ein Konto braucht. Dieser Pfad hat eigene Tests, weil Fehler dort nach außen wirken.',
    ],
    architecture: {
      summary: 'Browser und Android-Apps melden sich beim selben Dienst an und teilen sich eine Sitzung. Je Bereich kapselt eine Zwischenschicht das echte Backend, prüft die Identität und reicht nur Erlaubtes durch. Jede Datenroute ist an einen Mandanten gebunden, nachgewiesen aus dem Quelltext und am laufenden Dienst. Backends und Datenbanken stehen dahinter und sind von außen nicht erreichbar.',
      tiers: [
        {
          label: 'Oberflächen',
          nodes: [
            {
              id: 'shell',
              label: 'Startfläche',
              note: 'Web',
              kind: 'edge',
            },
            {
              id: 'subapps',
              label: 'Zwölf Apps',
              kind: 'edge',
            },
            {
              id: 'native',
              label: 'Android-Apps',
              note: 'je App eine',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Anmeldung',
          nodes: [
            {
              id: 'auth',
              label: 'Anmelde-Dienst',
              note: 'better-auth · Sitzung + Handy-Token',
              kind: 'core',
            },
            {
              id: 'gate',
              label: 'Mandanten-Gate',
              note: 'je Dienst, fällt nach Nachweis',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Zwischenschicht',
          nodes: [
            {
              id: 'mailbff',
              label: 'Mail',
              kind: 'core',
            },
            {
              id: 'calbff',
              label: 'Kalender',
              kind: 'core',
            },
            {
              id: 'assetbff',
              label: 'Wertsachen',
              kind: 'core',
            },
            {
              id: 'deckbff',
              label: 'Projekt-Deck',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Backends & Daten',
          nodes: [
            {
              id: 'mailagg',
              label: 'Mail-Sammler',
              note: 'OAuth2, nur Kopfdaten',
              kind: 'consumer',
            },
            {
              id: 'calnative',
              label: 'Kalender · Wertsachen',
              note: 'eigenes Backend',
              kind: 'consumer',
            },
            {
              id: 'db',
              label: 'Datenbanken',
              note: 'eine je Bereich',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'shell',
          to: 'auth',
          label: 'Sitzung',
        },
        {
          from: 'native',
          to: 'auth',
          label: 'Handy-Token',
        },
        {
          from: 'auth',
          to: 'gate',
        },
        {
          from: 'gate',
          to: 'mailbff',
          label: 'angemeldet + Mandant',
        },
        {
          from: 'mailbff',
          to: 'mailagg',
          label: 'nur Kopfdaten',
        },
        {
          from: 'calbff',
          to: 'calnative',
          label: 'gekapselt',
        },
        {
          from: 'deckbff',
          to: 'db',
        },
      ],
    },
    // Umfangszahlen am 2026-10-06 nachgemessen (vorher 52.000 / 482).
    // Messbefehl, damit die nächste Runde dieselbe Abgrenzung nimmt: alle
    // .py/.ts/.tsx/.svelte unter docker/saganta, OHNE node_modules, .svelte-kit,
    // build, dist, venv, __pycache__. Ergab 49.889 Zeilen und 504 Testfunktionen
    // (Muster `def test_` sowie `it(`/`test(`).
    // Die Abgrenzung gehört zur Zahl: bei `offline-wissen` führte eine engere
    // Annahme (.py/.sh statt auch .js) beinahe zu einer Korrektur an einer Zahl,
    // die richtig war. Wer hier nachmisst, nimmt diesen Befehl, nicht sein Gefühl.
    result: [
      'Zwölf Apps unter einer Startfläche, zehn Backend-Dienste dahinter, abgesichert mit 504 Testfunktionen.',
      'Mail, Nachrichten, Kalender, Wertsachen und das Projekt-Deck sind in täglicher Benutzung. Fremde Mailkonten hängen über OAuth2 dran, ohne dass ein zweiter Mailserver entstanden ist.',
      'Für die ersten Apps gibt es Android-Begleiter mit derselben Anmeldung. Eine Anmeldung, zwei Oberflächen.',
      'Die Mandantentrennung ist belegt und nicht angenommen. Beide Prüfungen laufen auf Abruf gegen jeden Dienst, und jede bewusste Ausnahme steht mit Begründung in einer Liste.',
    ],
    decisions: [
      {
        title: 'Zwei Prüfungen für die Mandantentrennung, nicht eine',
        body: 'Die eine liest den Quelltext und findet Routen, die nicht an einen Mandanten gebunden aussehen. Die andere fragt den laufenden Dienst mit zwei Konten und sieht nach, was er herausgibt. Beides wird gebraucht: eine Route kann sauber gebunden sein und trotzdem über eine ungefilterte Verknüpfung fremde Daten zeigen.',
      },
      {
        title: 'Das Prüfwerkzeug ist ein Filter, kein Beweis',
        body: 'Es findet Kandidaten, es entscheidet nichts. Jeder Treffer wird von Hand angesehen, jeder bewusst globale Endpunkt bekommt eine Ausnahme mit Begründung. Was dort grün ist, ist grün, weil jede Zeile einmal durch diese Liste musste.',
      },
      {
        title: 'Das Test-Token wird im Container gestempelt',
        body: 'Für den Nachweis am laufenden Dienst braucht es ein gültiges Anmelde-Token. Es entsteht im Container, mit dem Geheimnis, das dort ohnehin in der Umgebung liegt, und verlässt ihn nicht. Von außen müsste man dafür das Backend-Geheimnis herausreichen, und das soll für einen Test nicht passieren.',
      },
      {
        title: 'Nur Kopfdaten der Mails, nie den Inhalt',
        body: 'Der Mail-Teil holt Absender, Betreff und Zeitpunkt und legt sie zwischen. Der Nachrichtentext bleibt beim Anbieter und wird erst beim Öffnen geholt. Das hält die eigene Datenhaltung klein und verlagert das Risiko nicht auf meinen Server.',
      },
      {
        title: 'Eigener Anmelde-Dienst statt fertigem Fremd-Dienst',
        body: 'Der erste Anlauf lief über einen großen fertigen Anbieter. Für einen Nutzerkreis, den ich kenne, war das zu viel Maschinerie, und ein Token für die Android-Apps auszustellen war damit umständlicher als mit einer eigenen Sitzung.',
      },
      {
        title: 'Geteiltes als Paket, nicht als Kopie',
        body: 'Was mehrere Apps brauchen, liegt in versionierten Paketen, die jede App einbindet. Eine Korrektur wirkt damit überall.',
      },
    ],
    metrics: [
      {
        label: 'Umfang',
        value: '12 Apps · 10 Backend-Dienste',
      },
      {
        label: 'Tests',
        value: '504 Testfunktionen',
      },
      {
        label: 'Mandantentrennung',
        value: 'aus dem Quelltext und am laufenden Dienst belegt',
      },
      {
        label: 'Oberflächen',
        value: 'Web und Android, eine Anmeldung',
      },
    ],
    timeline: [
      {
        when: 'Q1 2026',
        what: 'Startfläche, eigene Anmeldung, erste Apps',
      },
      {
        when: 'Q2 2026',
        what: 'Mail über OAuth2, Kalender, Wertsachen und Projekt-Deck in Benutzung',
      },
      {
        when: 'Q2 2026',
        what: 'Android-Begleiter mit derselben Anmeldung',
      },
      {
        when: 'Q3 2026',
        what: 'Mandantentrennung nachgewiesen, Zugangslisten fallen einzeln',
      },
    ],
    // Hier stand bis zum 2026-10-21 „Es gibt keinen zweiten Betreiber.
    // Fällt die Suite aus, repariere ich sie …". Entscheid: der
    // Grenzen-Abschnitt bleibt, aber er beschreibt den DIENST und nicht die
    // Person dahinter. Dasselbe Kriterium, nach dem am 12.09. die beiden
    // Fehler-Anekdoten auf der Über-mich-Seite gefallen sind und am 15.10.
    // das Logbuch: eine technische Grenze ist ein Fachurteil und arbeitet für
    // den Leser, ein Satz über die eigene Ersetzbarkeit lädt zu einer Frage
    // ein, die sich auf einer Bewerberseite nicht gewinnen lässt.
    // Die beiden Grenzen darüber bleiben, sie nennen eine Eigenschaft des
    // Systems. Gleicher Schnitt in `homelab` und `defense-in-depth`.
    limits: [
      'Die Suite ist für einen überschaubaren Nutzerkreis gebaut. Die Zugangslisten fallen einzeln, und bis dahin ist die Mehrnutzer-Fähigkeit je Dienst unterschiedlich weit.',
      'Der Mail-Teil hängt an den Anbietern, deren Konten er einbindet. Ändert einer seinen Anmeldeweg, muss ich nachziehen.',
    ],
  },
  enAlt: {
    modules: [
      'Mail',
      'Calendar',
      'Valuables',
      'Pantry',
      'Meal planning',
      'Postal mail',
      'Project deck',
    ],
    problem: 'Productivity tools live scattered across third parties: mail with one, calendar with another, tasks with a third. Each pushes its own agenda, forces me into its UI, and rarely ships a native app that shares the same data as the browser. I wanted a suite that feels like one coherent product, that I own, where I actually control the data, and where a single login carries both web and mobile.',
    approach: [
      'A SvelteKit shell as the central launchpad, with theme, locale and pinning; every sub-app shares auth, look and settings.',
      'Everything shared lives as its own package in a pnpm monorepo that Turborepo builds along the dependency graph (UI components with a command palette (⌘K), design tokens, an auth library and an SDK), built once and consumed by every app. That is what carries the unified look and the "one brand" feel.',
      'One backend-for-frontend (BFF in FastAPI) per domain, so the browser never reaches straight into a backend: a frontend only talks to its domain BFF, which checks the session, translates it into the actual backend call and passes back only the fields that are allowed. Auth bridging, logging and a uniform interface live right here; the real backend never sees the open network.',
      'Sign-in runs through a lean service of my own built on better-auth. An early attempt on an external OIDC stack got dropped again, because a session layer I can reason about fits the suite better.',
      'The same service issues a short-lived backend token for the native Kotlin apps, so Android uses the same identity as the web without a second login path.',
      'Containers sit segmented in separate network zones. The browser only ever sees the shell and the frontends; the BFFs never face the public.',
    ],
    architecture: {
      summary: 'Browser and native Kotlin apps share one session against the SvelteKit shell and the sub-app frontends; a lean service of its own on better-auth issues the web session and a short-lived mobile token. Each domain hides its real backend behind a backend-for-frontend that checks identity and passes through only what is allowed; native backends and databases stay behind that BFF layer.',
      tiers: [
        {
          label: 'Clients',
          nodes: [
            {
              id: 'shell',
              label: 'Web shell',
              note: 'SvelteKit · launchpad',
              kind: 'edge',
            },
            {
              id: 'subapps',
              label: 'Sub-app frontends',
              kind: 'edge',
            },
            {
              id: 'native',
              label: 'Native Android apps',
              note: 'Kotlin · per sub-app',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Identity',
          nodes: [
            {
              id: 'auth',
              label: 'Sign-in service',
              note: 'better-auth · session + mobile token',
              kind: 'core',
            },
          ],
        },
        {
          label: 'BFF layer',
          nodes: [
            {
              id: 'mailbff',
              label: 'Mail BFF',
              kind: 'core',
            },
            {
              id: 'calbff',
              label: 'Calendar BFF',
              kind: 'core',
            },
            {
              id: 'assetbff',
              label: 'Assets BFF',
              kind: 'core',
            },
            {
              id: 'deckbff',
              label: 'Project-deck BFF',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Backends & data',
          nodes: [
            {
              id: 'mailagg',
              label: 'Mail aggregator',
              note: 'external accounts bundled',
              kind: 'consumer',
            },
            {
              id: 'calnative',
              label: 'Calendar · Assets',
              note: 'FastAPI own backend',
              kind: 'consumer',
            },
            {
              id: 'db',
              label: 'Domain databases',
              note: 'SQLite per domain',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'shell',
          to: 'auth',
          label: 'web session',
        },
        {
          from: 'native',
          to: 'auth',
          label: 'mobile token',
        },
        {
          from: 'shell',
          to: 'mailbff',
          label: 'authenticated',
        },
        {
          from: 'mailbff',
          to: 'mailagg',
          label: 'bundled',
        },
        {
          from: 'calbff',
          to: 'calnative',
          label: 'encapsulated',
        },
        {
          from: 'deckbff',
          to: 'db',
        },
      ],
    },
    result: [
      'The suite is live and reads as a single brand from the outside: shell, sub-apps, settings and branding all line up.',
      'Mail, news, calendar, assets and a project deck run in production; the mail part bundles external accounts without duplicating a mail server.',
      'The first sub-apps have native Android companions that reuse the web identity through a short-lived backend token: one login, two surfaces.',
      'Theme and locale settings are centralized in the shell and inherited by every sub-app. New domains arrive with their own BFF, nothing existing gets rebuilt.',
    ],
    decisions: [
      {
        title: 'A session layer on better-auth instead of a foreign OIDC stack',
        body: 'An early attempt to run identity through a heavyweight external provider was deliberately dropped. A lean session layer on better-auth is easy to reason about, fits the suite exactly, and issues a mobile token for the native apps without extra machinery.',
      },
      {
        title: 'Why there is no mail server here',
        body: 'The mail part aggregates existing external accounts and sends over their paths. That buys a unified view, and I do not have to run a second mail stack.',
      },
      {
        title: 'An own backend for assets and the project deck',
        body: 'Where no mature third-party backend fits, I build one: own DB, own logic, clean coupling to the other domains.',
      },
      {
        title: 'Shared code as a package, not copy-paste',
        body: 'What several apps need (UI components, design tokens, an auth library) lives in versioned monorepo packages that every app consumes. The suite looks all of a piece, and one fix lands everywhere, without me re-applying it frontend by frontend.',
      },
    ],
    metrics: [
      {
        label: 'Sub-apps',
        value: 'Shell · Mail · News · Calendar · Assets · Project deck',
      },
      {
        label: 'Shared packages',
        value: 'UI · design tokens · auth · SDK',
      },
      {
        label: 'Clients',
        value: 'web and native Android',
      },
      {
        label: 'Sign-in',
        value: 'better-auth, own session layer',
      },
    ],
    timeline: [
      {
        when: 'Q1 2026',
        what: 'Shell, own session layer and first sub-apps live',
      },
      {
        when: 'Q2 2026',
        what: 'Mail aggregator, calendar, assets and project deck in production',
      },
      {
        when: 'Q2 2026',
        what: 'Native Android companions on a shared mobile token',
      },
      {
        when: 'later',
        what: 'Docs, wiki, more sub-apps as needed, no roadmap inflation',
      },
    ],
    // The third limit („There is no second operator …") was dropped on
    // 2026-10-21, same cut as in the German file: the limits describe the
    // SERVICE, not the person running it.
    limits: [
      'The suite is built for a small circle of users. The access lists fall one by one, and until then multi-user support differs from app to app.',
      'The mail part depends on the providers whose accounts it binds in. If one of them changes its sign-in path, I have to follow.',
    ],
  },
};

export default saganta;
