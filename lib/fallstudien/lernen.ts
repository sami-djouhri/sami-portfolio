import type { Fallstudie } from './typ';

// Neu erhoben am 2026-11-13 aus dem Repo `lernen/lernstufe` und den Umstiegsnotizen
// vom 07.11.: die sechs Lern-Apps sind seit dem 07.11. eine App. Die Route-ID bleibt
// `lernen`, damit bestehende Verweise auf /projekte/lernen gueltig bleiben.
const lernen: Fallstudie = {
  problem: {
    de: 'Ich lerne in mehreren Bereichen gleichzeitig: IT-Zertifikate, Ausbildung, Führerschein, Schulstoff. Lange lief jeder Bereich als eigene App mit eigener Datenbank und eigenem Konto. Jede Änderung am gemeinsamen Teil musste ich sechsmal ausrollen. Deshalb gibt es seit November 2026 nur noch eine App für alle Bereiche.',
    en: 'I study in several areas at once: IT certifications, vocational training, driving licence, school subjects. For a long time each area ran as its own app with its own database and its own account. Every change to the shared part had to be rolled out six times. Since November 2026 there is one app for all areas.',
  },
  approach: [
    {
      de: 'Ein Server, eine Datenbank, ein Konto. Die Bereiche sind die oberste Ebene, darunter Kurs, Modul und Thema.',
      en: 'One server, one database, one account. The areas are the top level, below them course, module and topic.',
    },
    {
      de: 'Ein Skript führt Lernstoff, Fragen und Kurslisten der sechs alten Apps zusammen. Es lässt sich wiederholen, und ein Zahlenabgleich gegen die alten Apps prüft, dass keine Frage fehlt.',
      en: 'A script merges the material, questions and course lists of the six old apps. It can be rerun, and a count against the old apps checks that no question is missing.',
    },
    {
      de: 'Konten werden über die E-Mail-Adresse zusammengeführt. Der Fortschritt aus allen alten Apps landet im selben Konto.',
      en: 'Accounts are merged by e-mail address. Progress from all old apps ends up in the same account.',
    },
    {
      de: 'Die Startseite zeigt unter „Heute“ fällige Wiederholungen und das nächste Thema über alle Kurse hinweg. Ein Tagesziel in Minuten lässt sich setzen und ist anfangs aus.',
      en: 'The start page shows due reviews and the next topic across all courses under "Today". A daily goal in minutes can be set and is off by default.',
    },
  ],
  architecture: {
    summary: {
      de: 'Browser und Android-App sprechen denselben Server. Er hält alle Bereiche und Kurse in einer Datenbank. Die alten Adressen leiten auf den passenden Bereich weiter.',
      en: 'Browser and Android app talk to the same server. It keeps all areas and courses in one database. The old addresses redirect to the matching area.',
    },
    tiers: [
      {
        label: { de: 'Zugänge', en: 'Entry points' },
        nodes: [
          { id: 'web', kind: 'edge', label: { de: 'Browser', en: 'Browser' } },
          { id: 'android', kind: 'edge', label: { de: 'Android-App', en: 'Android app' } },
          {
            id: 'alt',
            kind: 'edge',
            label: { de: 'Alte Adressen', en: 'Old addresses' },
            note: { de: 'Weiterleitung', en: 'redirect' },
          },
        ],
      },
      {
        label: { de: 'Anwendung', en: 'Application' },
        nodes: [
          {
            id: 'app',
            kind: 'core',
            label: { de: 'Lernstufe', en: 'Lernstufe' },
            note: { de: 'ein Server', en: 'one server' },
          },
          {
            id: 'pruefung',
            kind: 'core',
            label: { de: 'Prüfungssimulator', en: 'Exam simulator' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'db',
            kind: 'data',
            label: { de: 'Eine Datenbank', en: 'One database' },
            note: { de: 'SQLite', en: 'SQLite' },
          },
          {
            id: 'sicherung',
            kind: 'data',
            label: { de: 'Sicherung', en: 'Backup' },
          },
        ],
      },
    ],
    flows: [
      { from: 'alt', to: 'app', label: { de: '301 auf den Bereich', en: '301 to the area' } },
      { from: 'android', to: 'app', label: { de: 'dasselbe Konto', en: 'same account' } },
      { from: 'app', to: 'db' },
      { from: 'db', to: 'sicherung', label: { de: 'eigener Container', en: 'own container' } },
    ],
  },
  result: [
    {
      de: 'Seit dem 07.11.2026 läuft nur noch Lernstufe. Die sechs alten Apps sind gestoppt, aber nicht gelöscht, und dienen als Rückweg.',
      en: 'Since 7 November 2026 only Lernstufe runs. The six old apps are stopped but not deleted and serve as a way back.',
    },
    {
      de: 'Beim Zusammenführen kamen 20 Fragen-Kennungen ans Licht, die in zwei Apps für verschiedene Fragen vergeben waren. Gefunden hat sie der Zahlenabgleich gegen die alten Apps.',
      en: 'The merge surfaced 20 question IDs that two apps had used for different questions. The count against the old apps found them.',
    },
    {
      de: 'Die alten Android-Apps bekamen ein letztes Update. Es zeigt einen Hinweis und installiert die neue App über den vorhandenen Updater.',
      en: 'The old Android apps received one last update. It shows a notice and installs the new app through the existing updater.',
    },
  ],
  decisions: [
    {
      title: { de: 'Eine App statt sechs', en: 'One app instead of six' },
      body: {
        de: 'Im Sommer 2026 habe ich mich für sechs getrennte Apps entschieden, damit jeder Bereich sein eigenes Tempo hat. Das hat sich nicht getragen. Jede Abhängigkeits-Runde und jede Sprachkorrektur lief sechsmal. Deshalb habe ich die Entscheidung im November zurückgenommen.',
        en: 'In summer 2026 I chose six separate apps so each area could move at its own pace. That did not hold up. Every dependency round and every language fix ran six times. So I reversed the decision in November.',
      },
    },
    {
      title: { de: 'Parallel aufbauen, dann umschalten', en: 'Build in parallel, then switch' },
      body: {
        de: 'Lernstufe lief zuerst neben den alten Apps. Erst nach Probe-Import und Zahlenabgleich habe ich die Adressen umgestellt. Danach habe ich die alten Apps gestoppt. Ihre Daten liegen als Rückweg bereit.',
        en: 'Lernstufe first ran next to the old apps. Only after a trial import and a count check did I switch the addresses. After that I stopped the old apps. Their data stays in place as a way back.',
      },
    },
    {
      title: { de: 'Prüfungssimulator aus Fragen-Pools', en: 'Exam simulator from question pools' },
      body: {
        de: 'Eine Probeprüfung zieht bei jedem Durchlauf eine neue Auswahl aus Pools je Themengebiet und wertet am Ende nach Gebiet aus. Eine feste Fragenliste lernt man auswendig.',
        en: 'A mock exam draws a fresh selection from per-topic pools on every run and grades by topic at the end. A fixed list of questions gets memorised.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Bereiche', en: 'Areas' },
      value: { de: '6 in einer App', en: '6 in one app' },
    },
    {
      label: { de: 'Zugänge', en: 'Entry points' },
      value: { de: 'Browser und Android, ein Konto', en: 'browser and Android, one account' },
    },
    {
      label: { de: 'Prüfungssimulator', en: 'Exam simulator' },
      value: { de: 'aus Pools, nach Gebiet ausgewertet', en: 'from pools, graded by topic' },
    },
  ],
  timeline: [
    {
      when: { de: '2025', en: '2025' },
      what: { de: 'Erste Lern-Apps im Browser', en: 'First learning apps in the browser' },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Sechs getrennte Apps auf einem geteilten Kern, native Android-Builds',
        en: 'Six separate apps on a shared core, native Android builds',
      },
    },
    {
      when: { de: 'Nov. 2026', en: 'Nov 2026' },
      what: {
        de: 'Zusammengeführt zu Lernstufe, alte Apps gestoppt',
        en: 'Merged into Lernstufe, old apps stopped',
      },
    },
  ],
};

export default lernen;
