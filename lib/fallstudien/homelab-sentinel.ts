import type { Fallstudie } from './typ';

const homelabSentinel: Fallstudie = {
  problem: {
    de: 'Ein Homelab im Dauerbetrieb braucht eine On-Call-Person, und das bin ausschließlich ich. Ohne Push-Kanal heißt das, ständig in Dashboards zu schauen und trotzdem das eine Ereignis zu verpassen, das zählt. Ich wollte einen Wächter, der sich von selbst meldet, wenn etwas wackelt, der mir die Entscheidung überlässt und der einen Neustart übersteht, ohne dass danach tote Knöpfe im Chat zurückbleiben.',
    en: 'A home lab running around the clock needs an on-call person, and that is me alone. Without a push channel, that means staring at dashboards constantly and still missing the one event that matters. I wanted the opposite: a sentinel that speaks up on its own when something wobbles, that leaves the decision to me, and that survives a restart without leaving dead buttons behind in the chat.',
  },
  approach: [
    {
      de: 'Push als Grundsatz: der Bot meldet sich von selbst, ich frage ihn nicht ab. Als Pager dient der mobile Push des Chat-Kanals, den ich ohnehin auf dem Handy habe, also braucht es keine zweite Benachrichtigungs-Infrastruktur.',
      en: 'Push as a principle: the bot reports on its own and I never poll it. The pager is the chat channel\'s existing mobile push, which is already on my phone, so there is no second notification stack.',
    },
    {
      de: 'Cog-Architektur: jede Sorge bekommt ihr eigenes Modul, von Container-Gesundheit über Backups, Updates und Sicherheits-Audits bis zum VPN-Peer-Status, einzeln pausierbar und neu schreibbar, ohne den Kern anzufassen.',
      en: 'A cog architecture: each concern gets its own module (from container health through backups, updates and security audits to VPN peer status), pausable and rewritable one at a time, without touching the core.',
    },
    {
      de: 'Der Bot ist Abnehmer des eigenen Event-Bus, keine zweite Mess-Schicht. Signale werden zentral dedupliziert, mit Cooldown triagiert und gebündelt zugestellt. Kein Dienst muss seinen eigenen Push-Weg lernen.',
      en: 'The bot is a consumer of the own event bus, not a second measurement layer. Signals get deduplicated centrally, triaged with cooldown and delivered bundled. No service has to learn its own push path.',
    },
    {
      de: 'Jeder Eingriff läuft über einen Bestätigungs-Flow: Vorübergehendes fährt der Bus innerhalb eines Limits selbst nach, Folgenreiches landet als Freigabe-Knopf mit Diagnose bei mir.',
      en: 'Every intervention runs through a confirmation flow: transient things the bus retries itself within a limit, consequential ones land as a release button with a diagnosis on me.',
    },
    {
      de: 'Knöpfe sind neustart-fest gebaut: ihre Bedeutung steckt in der Aktion selbst und wird über einen globalen Interaktions-Listener aufgelöst, nicht aus flüchtigem Speicher. Nach einem Neustart bleibt kein toter Knopf zurück.',
      en: 'Buttons are built restart-proof: their meaning sits in the action itself and resolves over a global interaction listener, not out of volatile memory. After a restart, no dead button remains.',
    },
  ],
  architecture: {
    summary: {
      de: 'Der Bot ist Abnehmer des Event-Bus, nicht eine eigene Mess-Schicht. Signale laufen vom zentralen Bus in den Bot-Kern, der sie auf themenscharfe Cogs verteilt, für eingreifende Schritte einen Freigabe-Knopf erzeugt und das Ergebnis als Push in den Chat schickt, mobil inklusive. Folgenreiches wird erst nach meiner Freigabe ausgeführt.',
      en: 'The bot consumes the event bus and measures nothing itself. Signals run from the central bus into the bot core, which routes them to topic-scoped cogs, raises a release button for any intervening step, and sends the result as a chat push, mobile included. Consequential steps run only after my release.',
    },
    tiers: [
      {
        label: { de: 'Quelle', en: 'Source' },
        nodes: [
          {
            id: 'spine',
            kind: 'edge',
            label: { de: 'Event-Bus', en: 'Event bus' },
            note: { de: 'dedupliziert', en: 'deduplicated' },
          },
        ],
      },
      {
        label: { de: 'Bot-Kern', en: 'Bot core' },
        nodes: [
          {
            id: 'loader',
            kind: 'core',
            label: { de: 'Cog-Loader', en: 'Cog loader' },
            note: { de: 'neustart-fest', en: 'restart-proof' },
          },
          {
            id: 'confirm',
            kind: 'core',
            label: { de: 'Bestätigungs-Flow', en: 'Confirmation flow' },
            note: { de: 'Freigabe-Knopf', en: 'release button' },
          },
          {
            id: 'dispatch',
            kind: 'core',
            label: { de: 'Action-Dispatch', en: 'Action dispatch' },
          },
        ],
      },
      {
        label: { de: 'Cogs', en: 'Cogs' },
        nodes: [
          {
            id: 'health',
            kind: 'consumer',
            label: { de: 'Health und Updates', en: 'Health and updates' },
          },
          {
            id: 'backup',
            kind: 'consumer',
            label: { de: 'Backups', en: 'Backups' },
          },
          {
            id: 'sec',
            kind: 'consumer',
            label: { de: 'Security und VPN-Peers', en: 'Security and VPN peers' },
          },
        ],
      },
      {
        label: { de: 'Ausgabe', en: 'Output' },
        nodes: [
          {
            id: 'push',
            kind: 'data',
            label: { de: 'Chat-Push', en: 'Chat push' },
            note: { de: 'mobil', en: 'mobile' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'spine',
        to: 'loader',
        label: { de: 'Alert', en: 'alert' },
      },
      {
        from: 'health',
        to: 'confirm',
        label: { de: 'Freigabe', en: 'release' },
      },
      {
        from: 'dispatch',
        to: 'spine',
        label: { de: 'Aktion aus dem Chat', en: 'action from the chat' },
      },
    ],
  },
  result: [
    {
      de: 'Acht Cogs decken Monitoring, Backups, Updates, Sicherheit und Verbindungs-Status ab, jede Sorge ein eigenes, einzeln pausierbares Modul.',
      en: 'Eight cogs cover monitoring, backups, updates, security and connection status, each concern its own, individually pausable module.',
    },
    {
      de: 'Push-pflichtige Ereignisse von der Neustart-Schleife über das ablaufende Zertifikat bis zum Speicherdruck erreichen mich im Sekunden-Bereich, alles Wartbare bleibt leise im Hintergrund.',
      en: 'Push-worthy events (a restart loop, an expiring certificate, storage pressure) reach me within seconds, while everything maintainable stays quiet in the background.',
    },
    {
      de: 'Ein Freigabe-Knopf ersetzt die stille Automatik: Vorübergehendes fährt bis zu einem Limit von selbst nach, eine abgelaufene Freigabe führt bei echtem Klick trotzdem noch aus und läuft nicht in eine Sackgasse.',
      en: 'A release button replaces silent automation: transient things retry on their own up to a limit, and an expired release still executes on a real click without dead-ending.',
    },
    {
      de: 'Knöpfe überstehen einen Bot-Neustart, ohne tot zu werden, was vorher angezeigt wurde bleibt klickbar.',
      en: 'Buttons survive a bot restart without going dead; whatever was shown before stays clickable.',
    },
    {
      de: 'On-Call wird leise: der Wächter meldet sich, wenn etwas zu tun ist, sonst nicht.',
      en: 'On-call goes quiet: the sentinel speaks up when there is something to do, and stays silent otherwise.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum ein eigener Bot', en: 'An own bot, not an off-the-shelf tool' },
      body: {
        de: 'Ein reines Push-Werkzeug wäre schneller aufgesetzt. Ein eigener Bot bringt aber Befehlsschnittstelle, Action-Dispatch und integrierte Logik unter ein Dach, was sich lohnt, sobald der Wächter auf Zuruf auch handeln soll.',
        en: 'A pure push tool would be quicker to stand up. But an own bot brings command interface, action dispatch and integrated logic under one roof, which pays off the moment the sentinel has to act on demand.',
      },
    },
    {
      title: {
        de: 'Bus als Alert-Quelle, Bot als Abnehmer',
        en: 'Bus as alert source, bot as consumer',
      },
      body: {
        de: 'Kein Dienst muss eigenen Bot-Push lernen. Alles läuft zuerst über den Event-Bus mit Dedup und Cooldown, und der Bot ist nur einer von mehreren Abnehmern. Das verhindert die Alert-Flut, an der Solo-On-Call sonst abstumpft.',
        en: 'No service has to learn its own bot push. Everything runs first through the event bus with dedup and cooldown, and the bot is just one of several consumers. That heads off the alert flood that solo on-call otherwise goes numb to.',
      },
    },
    {
      title: {
        de: 'Freigabe vor Eingriff, nicht stille Automatik',
        en: 'Release before intervention, not silent automation',
      },
      body: {
        de: 'Selbstheilung ist verführerisch, aber ein falscher Eingriff ohne Rückfrage ist schlimmer als ein verpasster. Vorübergehendes darf der Bus innerhalb eines harten Limits selbst nachfahren, Folgenreiches landet als Knopf bei mir, ein Versuchszähler schützt gegen Endlos-Schleifen.',
        en: 'Self-healing is tempting, but a wrong intervention with no query is worse than a missed one. Transient things the bus may retry itself within a hard limit; consequential ones land as a button on me, with an attempt counter guarding against endless loops.',
      },
    },
    {
      title: { de: 'Knöpfe ohne flüchtigen Zustand', en: 'Buttons with no volatile state' },
      body: {
        de: 'Knöpfe, deren Bedeutung nur im Arbeitsspeicher lebt, sind nach jedem Neustart tot. Stattdessen tragen sie ihre Bedeutung in der Aktion selbst, aufgelöst über einen globalen Interaktions-Listener, so überlebt jeder Knopf einen Neustart ohne erneut ausgelöste Alerts.',
        en: 'Buttons whose meaning lives only in memory are dead after every restart. Instead they carry their meaning in the action itself, resolved over a global interaction listener, so every button survives a restart without re-firing alerts.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Cogs', en: 'Cogs' },
      value: { de: '12 produktiv', en: '12 in production' },
    },
    {
      label: { de: 'Push-Kanal', en: 'Push channel' },
      value: { de: 'Chat, mobil inklusive', en: 'chat, mobile included' },
    },
    {
      label: { de: 'Alert-Latenz', en: 'Alert latency' },
      value: { de: 'Sekunden, nicht Minuten', en: 'seconds, not minutes' },
    },
    {
      label: { de: 'Eingriff', en: 'Intervention' },
      value: { de: 'nur nach Freigabe', en: 'only after release' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Bot-Basis mit Cog-Architektur, Anbindung an den Event-Bus',
        en: 'Bot base with cog architecture, binding to the event bus',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Cogs für Health, Backups, Updates, Security und VPN-Peers',
        en: 'Cogs for health, backups, updates, security and VPN peers',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Bestätigungs-Flow mit Freigabe-Knopf, neustart-feste Knöpfe, Auto-Nachfahren mit Versuchs-Limit',
        en: 'Confirmation flow with release button, restart-proof buttons, auto-retry with an attempt limit',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Action-Dispatch für Chat-Trigger, weitere Cogs nach Bedarf',
        en: 'Action dispatch for chat triggers, more cogs as needed',
      },
    },
  ],
};

export default homelabSentinel;
