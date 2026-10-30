import type { Fallstudie } from './typ';

const modellVermittlung: Fallstudie = {
  problem: {
    de: 'Mit jedem Dienst, der ein Sprachmodell ruft, wuchs dasselbe Problem an mehreren Stellen zugleich. Jeder trug seinen eigenen Schlüssel und sein eigenes Modell fest verdrahtet. Ein Kostenbild über das Ganze hatte niemand. Ein einzelner Dienst mit einer Schleife im falschen Moment hätte still ein Monatsbudget leerlaufen lassen, ohne dass es vorher jemand gesehen hätte. Ich wollte weder je Dienst eine eigene Abrechnung führen noch überall denselben Umschalt- und Ausfall-Code kopieren. Es brauchte eine Stelle, durch die alle KI-Aufrufe laufen, mit einem Deckel pro Dienst und einem klaren Weg, wenn eine Seite wegbricht.',
    en: 'With every service that called a language model, the same problem grew in several places at once: each carried its own key, each hard-wired its own model, and nobody had a cost picture across the whole. A single service with a loop at the wrong moment would have quietly drained a month’s budget before anyone saw it. I wanted neither to keep separate billing per service nor to copy the same switching and failover code everywhere. It needed one place that all AI calls pass through, with a cap per service and a clear path for when one side falls away.',
  },
  approach: [
    {
      de: 'Ein einziges Tor vor alle Sprachmodelle: ein Endpunkt, der sowohl das Anthropic- als auch das OpenAI-kompatible Anfrageformat spricht, sodass bestehende Dienste ohne Umbau darüber laufen: sie zeigen nur auf eine andere Adresse.',
      en: 'One gate in front of all language models: a single endpoint that speaks both the Anthropic- and the OpenAI-compatible request format, so existing services run through it without a rewrite; they just point at a different address.',
    },
    {
      de: 'Jeder Konsument bekommt einen eigenen Schlüssel mit eigenem Monatsbudget als Runaway-Schutz und eine Modell-Freigabeliste. Läuft ein Dienst heiß, trifft es seinen eigenen Deckel, nicht das Budget aller anderen.',
      en: 'Each consumer gets its own key with its own monthly budget as a runaway guard, plus a model allow-list. If a service runs hot, it hits its own cap, not everyone else’s budget.',
    },
    {
      de: 'Hybrides Routing, entschieden je Aufgabe: kostensensible und häufige Aufrufe gehen an ein lokal betriebenes Modell, das ohne externe Kosten läuft; die wenigen Aufrufe, die echte Cloud-Qualität brauchen, gehen an ein Cloud-Modell. Die Entscheidung liegt in der Vermittlung, nicht im Dienst.',
      en: 'Hybrid routing, decided per task: cost-sensitive, frequent calls go to a locally run model that runs at no external cost; the few calls that need real cloud quality go to a cloud model. The choice lives in the gateway, not in the service.',
    },
    {
      de: 'Ein dokumentierter Ausweich-Pfad: fällt das lokale Modell unter Last aus, schaltet die Vermittlung selbsttätig auf ein kleines Cloud-Modell um. Der Dienst merkt davon nichts, außer dass er eine Antwort bekommt.',
      en: 'A documented fallback path: if the local model gives out under load, the gateway switches over to a small cloud model on its own. The service notices nothing beyond getting an answer.',
    },
    {
      de: 'Das Container-Image ist über seine Prüfsumme festgelegt und nicht über ein bewegliches Tag. Damit bleibt reproduzierbar, was gerade läuft.',
      en: 'The container image is pinned by checksum, not to a moving tag, so that “what is running” stays reproducible and does not shift underneath.',
    },
  ],
  architecture: {
    summary: {
      de: 'Alle KI-nutzenden Dienste sprechen nicht mehr direkt mit einem Modellanbieter, sondern mit einer zentralen Vermittlung. Sie prüft den dienst-eigenen Schlüssel, bucht gegen dessen Monatsbudget, wählt nach Aufgabe zwischen einem lokal betriebenen Modell und einem Cloud-Modell und weicht bei Überlast selbsttätig auf ein kleines Cloud-Modell aus. Nach außen bietet sie einen Endpunkt in zwei geläufigen Anfrageformaten an, sodass Bestehendes ohne Umbau anschließt.',
      en: 'All AI-using services no longer talk to a model provider directly but to a central gateway. It checks the service’s own key, books against its monthly budget, picks by task between a locally run model and a cloud model, and falls back to a small cloud model on its own under overload. Outward it offers one endpoint in two common request formats, so existing things attach without a rewrite.',
    },
    tiers: [
      {
        label: { de: 'Konsumenten', en: 'Consumers' },
        nodes: [
          {
            id: 'chat',
            kind: 'edge',
            label: { de: 'Community-Bot', en: 'Community bot' },
          },
          {
            id: 'watch',
            kind: 'edge',
            label: { de: 'Marktbeobachter', en: 'Market watcher' },
          },
          {
            id: 'blog',
            kind: 'edge',
            label: { de: 'Blog-Generator', en: 'Blog generator' },
          },
          {
            id: 'brief',
            kind: 'edge',
            label: { de: 'Tägliches Briefing · Alltag', en: 'Daily briefing · everyday' },
          },
        ],
      },
      {
        label: { de: 'Vermittlung', en: 'Gateway' },
        nodes: [
          {
            id: 'gw',
            kind: 'core',
            label: { de: 'Zentrales Tor', en: 'Central gate' },
            note: {
              de: 'Schlüssel · Budget · Freigabeliste · Router',
              en: 'key · budget · allow-list · router',
            },
          },
        ],
      },
      {
        label: { de: 'Modelle', en: 'Models' },
        nodes: [
          {
            id: 'local',
            kind: 'consumer',
            label: { de: 'Lokales Modell', en: 'Local model' },
            note: { de: 'ohne externe Kosten', en: 'no external cost' },
          },
          {
            id: 'cloud',
            kind: 'consumer',
            label: { de: 'Cloud-Modell', en: 'Cloud model' },
            note: { de: 'nur wo nötig', en: 'only where needed' },
          },
          {
            id: 'fallback',
            kind: 'consumer',
            label: { de: 'Kleines Cloud-Modell', en: 'Small cloud model' },
            note: { de: 'Ausweich bei Überlast', en: 'fallback under load' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'chat',
        to: 'gw',
        label: { de: 'eigener Schlüssel', en: 'own key' },
      },
      {
        from: 'watch',
        to: 'gw',
        label: { de: 'eigenes Budget', en: 'own budget' },
      },
      {
        from: 'blog',
        to: 'gw',
      },
      {
        from: 'brief',
        to: 'gw',
      },
      {
        from: 'gw',
        to: 'cloud',
        label: { de: 'Qualitäts-Aufrufe', en: 'quality calls' },
      },
      {
        from: 'gw',
        to: 'local',
        label: { de: 'häufige Aufrufe', en: 'frequent calls' },
      },
      {
        from: 'gw',
        to: 'fallback',
        label: { de: 'bei Überlast', en: 'under overload' },
      },
    ],
  },
  result: [
    {
      de: 'Alle KI-Aufrufe im Haus laufen über ein Tor. Das ergibt ein einziges Kostenbild und einen Deckel pro Dienst, also keine Überraschung am Monatsende.',
      en: 'Every AI call in the house runs through one gate. That yields a single cost picture and a cap per service, so no nasty surprise at month’s end.',
    },
    {
      de: 'Bestehende Dienste wurden ohne Code-Umbau umgehängt: sie zeigen nur auf die Vermittlung, weil diese beide gängigen Anfrageformate spricht.',
      en: 'Existing services were rehung without a code rewrite; they just point at the gateway, because it speaks both common request formats.',
    },
    {
      de: 'Der Regelbetrieb kostet extern nichts, weil das Gros der Aufrufe lokal läuft; Cloud-Qualität wird gezielt nur dort gekauft, wo eine Aufgabe sie wirklich braucht.',
      en: 'Steady-state operation costs nothing externally, because the bulk of calls run locally; cloud quality is bought deliberately only where a task truly needs it.',
    },
    {
      de: 'Fällt das lokale Modell unter Last aus, bekommt der Dienst trotzdem eine Antwort: der Ausweich-Pfad ist dokumentiert und greift selbsttätig.',
      en: 'If the local model gives out under load, the service still gets an answer; the fallback path is documented and kicks in on its own.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Ein Tor, keine Bibliothek in jedem Dienst',
        en: 'One gate, not a library in every service',
      },
      body: {
        de: 'Umschaltung, Budget und Ausfall-Logik einmal in einer Vermittlung zu lösen ist wartbarer, als denselben Code in jeden Dienst zu kopieren. Ein Dienst, der das Format schon kann, braucht nur eine neue Adresse und einen Schlüssel.',
        en: 'Solving switching, budget and failover logic once in a gateway is more maintainable than copying the same code into every service. A service that already speaks the format just needs a new address and a key.',
      },
    },
    {
      title: { de: 'Zwei Anfrageformate an einem Endpunkt', en: 'Two request formats at one endpoint' },
      body: {
        de: 'Weil das Tor sowohl das Anthropic- als auch das OpenAI-kompatible Format annimmt, mussten bestehende Dienste nicht auf eine gemeinsame Bibliothek umgeschrieben werden. Das senkte die Umzugs-Kosten auf einen Adress- und Schlüsseltausch.',
        en: 'Because the gate accepts both the Anthropic- and the OpenAI-compatible format, existing services did not have to be rewritten onto a shared library. That cut the migration cost down to swapping an address and a key.',
      },
    },
    {
      title: { de: 'Budget pro Konsument, nicht global', en: 'Budget per consumer, not global' },
      body: {
        de: 'Ein globaler Deckel hätte einen Ausreißer alle anderen aushungern lassen. Ein eigenes Monatsbudget je Schlüssel begrenzt den Schaden auf den Verursacher und macht sichtbar, welcher Dienst wie viel kostet.',
        en: 'A global cap would have let one outlier starve everyone else. A separate monthly budget per key confines the damage to the culprit and makes visible which service costs how much.',
      },
    },
    {
      title: { de: 'Lokal zuerst, Cloud gezielt', en: 'Local first, cloud on purpose' },
      body: {
        de: 'Die Vermittlung schickt häufige, kostensensible Aufrufe an ein lokal betriebenes Modell und hebt sich das Cloud-Modell für die wenigen Aufgaben auf, bei denen das lokale nicht reicht. Ein Dienst, der versehentlich in einer Schleife hängt, kostet dadurch Rechenzeit, aber kein Geld.',
        en: 'The gateway sends frequent, cost-sensitive calls to a locally run model and keeps the cloud model for the few tasks that justify its quality. Cost arises as a deliberate choice, not as the default path.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Zugang', en: 'Access' },
      value: { de: 'ein Endpunkt · zwei Anfrageformate', en: 'one endpoint · two request formats' },
    },
    {
      label: { de: 'Steuerung', en: 'Control' },
      value: { de: 'Schlüssel + Monatsbudget je Konsument', en: 'key + monthly budget per consumer' },
    },
    {
      label: { de: 'Routing', en: 'Routing' },
      value: { de: 'lokal zuerst · Cloud gezielt', en: 'local first · cloud on purpose' },
    },
    {
      label: { de: 'Ausfall', en: 'Failover' },
      value: { de: 'selbsttätiger Ausweich-Pfad', en: 'automatic fallback path' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Zentrale Vermittlung als schmales Tor vor alle Sprachmodelle gestellt',
        en: 'Central gateway placed as a thin gate in front of all language models',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Per-Konsument-Schlüssel mit Monatsbudget und Modell-Freigabeliste',
        en: 'Per-consumer keys with a monthly budget and a model allow-list',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Hybrides Routing lokal/Cloud plus dokumentierter Ausweich-Pfad bei Überlast',
        en: 'Hybrid local/cloud routing plus a documented fallback path under overload',
      },
    },
    {
      when: { de: 'danach', en: 'after' },
      what: {
        de: 'Weitere Konsumenten hängen sich ohne Umbau an, Budgets wachsen mit dem Bedarf',
        en: 'Further consumers attach without a rewrite, budgets grow with demand',
      },
    },
  ],
};

export default modellVermittlung;
