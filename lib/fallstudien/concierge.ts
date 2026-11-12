import type { Fallstudie } from './typ';

const concierge: Fallstudie = {
  problem: {
    de: 'Ein fertiger Assistent von der Stange schickt jede Anfrage in die Cloud. Das kostet laufend Geld, auch für Triviales. Sprache und persönliches Wissen liegen dabei in fremder Hand, und gegen Aktionen, die etwas am System verändern, gibt es keinen verlässlichen Riegel. Ich wollte den Assistenten-Kern selbst besitzen. Er läuft lokal, wählt je Anfrage die passende Modell-Stufe und führt eine riskante Aktion wie einen Neustart nur nach ausdrücklicher Freigabe aus.',
    en: 'An off-the-shelf assistant means every request goes to the cloud: running cost for trivia, your language and personal knowledge in someone else’s hands, and no reliable brake on actions that change the system. I wanted to own the assistant core: run it locally, route it cost-consciously by model tier, and build it so a risky action like a restart never happens without explicit approval.',
  },
  approach: [
    {
      de: 'Text, Sprachtranskript und API-Anfragen laufen über dasselbe Eingangs-Gateway; ein schneller Klassifikator bestimmt die Absicht, ohne dabei selbst eine Aktion auszuführen.',
      en: 'A single intake gateway unifies text, voice transcript and API requests; a fast classifier reads intent without executing anything itself.',
    },
    {
      de: 'Ein Orchestrator entscheidet pro Anfrage über Modell-Rolle, Wissensraum und Tool-Freigabe: Alltag und Tagesbriefing laufen auf einem kleinen lokalen Modell ohne externe Kosten, anspruchsvolle Schritte gehen gezielt an ein starkes Modell.',
      en: 'An orchestrator decides per request on model role, knowledge space and tool authorization: everyday tasks and the daily briefing run on a small local model at no external cost, demanding steps go deliberately to a strong one.',
    },
    {
      de: 'Jede Aktion läuft über genau einen Tool-Bus mit Schema-Prüfung, Inhaltsvalidierung, Timeout, Risk-Tier und einem nachvollziehbaren Audit-Log: es gibt keinen zweiten Weg, eine Aktion auszulösen.',
      en: 'Every action runs over exactly one tool bus: schema check, content validation, timeout, risk tier and a traceable audit log. There is no second way to trigger an action.',
    },
    {
      de: 'Riskante Eingriffe werden nicht ausgeführt. Sie erzeugen eine Freigabe-Anfrage mit Ablaufzeit, die erst über einen separaten Bestätigungs-Schritt scharf wird. Wer im Aufruf selbst behauptet, schon bestätigt zu haben, wird abgelehnt.',
      en: 'A risky operation does not execute. It produces a persistent approval request with an expiry that only goes live through a separate confirmation step; an already-confirmed faked into the call is deliberately rejected.',
    },
    {
      de: 'Ein Wissens-Layer wählt pro Frage den passenden Wissensraum mit dokumentierter Begründung, ein inkrementeller Briefing-Pool hält Kandidaten nach Frische, Quelle und Feedback aktuell.',
      en: 'A knowledge layer picks the right space per question with a documented rationale; an incremental briefing pool keeps candidates current by freshness, source and feedback.',
    },
  ],
  architecture: {
    summary: {
      de: 'Eingaben aus Sprache, Text und API treffen auf ein gemeinsames Gateway, ein Intent-Schritt klassifiziert ohne auszuführen, ein Orchestrator wählt Modell-Stufe und Wissensraum, und jede Aktion läuft ausschließlich über einen Tool-Bus mit Risk-Tier und Audit: riskante Aktionen erzeugen eine persistente Freigabe und laufen nicht sofort los, der Wissens-Layer und der Briefing-Pool liefern Kontext.',
      en: 'Voice, text and API inputs meet a shared gateway, an intent step classifies without executing, an orchestrator picks model tier and knowledge space, and every action runs exclusively over a tool bus with risk tier and audit: a risky action produces a persistent approval and does not run immediately, while the knowledge layer and briefing pool supply context.',
    },
    tiers: [
      {
        label: { de: 'Eingang', en: 'Intake' },
        nodes: [
          {
            id: 'voice',
            kind: 'edge',
            label: { de: 'Sprach-Eingang', en: 'Voice intake' },
            note: { de: 'Transkript', en: 'transcript' },
          },
          {
            id: 'text',
            kind: 'edge',
            label: { de: 'Text- und API-Eingang', en: 'Text and API intake' },
          },
          {
            id: 'gateway',
            kind: 'edge',
            label: { de: 'Eingangs-Gateway', en: 'Intake gateway' },
            note: { de: 'vereinheitlicht', en: 'unified' },
          },
        ],
      },
      {
        label: { de: 'Entscheidung', en: 'Decision' },
        nodes: [
          {
            id: 'intent',
            kind: 'core',
            label: { de: 'Intent-Klassifikation', en: 'Intent classification' },
            note: { de: 'führt nichts aus', en: 'executes nothing' },
          },
          {
            id: 'orchestrator',
            kind: 'core',
            label: { de: 'Orchestrator', en: 'Orchestrator' },
            note: { de: 'Modell-Rolle und Wissensraum', en: 'model role and knowledge space' },
          },
          {
            id: 'toolbus',
            kind: 'core',
            label: { de: 'Tool-Bus', en: 'Tool bus' },
            note: { de: 'Schema, Risk-Tier, Audit', en: 'schema, risk tier, audit' },
          },
          {
            id: 'approval',
            kind: 'core',
            label: { de: 'Freigabe-Stelle', en: 'Approval stage' },
            note: { de: 'persistent, mit Ablauf', en: 'persistent, with expiry' },
          },
        ],
      },
      {
        label: { de: 'Modell-Stufen', en: 'Model tiers' },
        nodes: [
          {
            id: 'small',
            kind: 'consumer',
            label: { de: 'Lokales Modell', en: 'Local model' },
            note: { de: 'Alltag, Briefing', en: 'everyday, briefing' },
          },
          {
            id: 'large',
            kind: 'consumer',
            label: { de: 'Starkes Modell', en: 'Strong model' },
            note: { de: 'Anspruchsvolles', en: 'the demanding' },
          },
        ],
      },
      {
        label: { de: 'Wissen und Kontext', en: 'Knowledge and context' },
        nodes: [
          {
            id: 'rag',
            kind: 'data',
            label: { de: 'Wissens-Layer', en: 'Knowledge layer' },
            note: { de: 'Raum pro Frage', en: 'space per question' },
          },
          {
            id: 'briefing',
            kind: 'data',
            label: { de: 'Briefing-Pool', en: 'Briefing pool' },
            note: { de: 'Scoring, Verdrängung', en: 'scoring, eviction' },
          },
          {
            id: 'audit',
            kind: 'data',
            label: { de: 'Audit-Log', en: 'Audit log' },
            note: { de: 'jede Aktion', en: 'every action' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'voice',
        to: 'gateway',
        label: { de: 'Transkript', en: 'transcript' },
      },
      {
        from: 'text',
        to: 'gateway',
      },
      {
        from: 'gateway',
        to: 'intent',
        label: { de: 'klassifiziert', en: 'classified' },
      },
      {
        from: 'intent',
        to: 'orchestrator',
        label: { de: 'Absicht', en: 'intent' },
      },
      {
        from: 'orchestrator',
        to: 'small',
        label: { de: 'Alltag, lokal', en: 'everyday, local' },
      },
      {
        from: 'orchestrator',
        to: 'large',
        label: { de: 'gezielt extern', en: 'deliberately external' },
      },
      {
        from: 'orchestrator',
        to: 'rag',
        label: { de: 'Wissensraum', en: 'knowledge space' },
      },
      {
        from: 'orchestrator',
        to: 'toolbus',
        label: { de: 'Aktion', en: 'action' },
      },
      {
        from: 'toolbus',
        to: 'approval',
        label: { de: 'wenn riskant', en: 'if risky' },
      },
      {
        from: 'toolbus',
        to: 'audit',
        label: { de: 'protokolliert', en: 'logged' },
      },
    ],
  },
  result: [
    {
      de: 'Triviales und das Tagesbriefing laufen auf dem lokalen Modell ohne externe Kosten, das starke Modell wird nur für die wenigen anspruchsvollen Schritte gezogen.',
      en: 'Trivia and the daily briefing run on the local model at no external cost; the strong model is pulled only for the few demanding steps.',
    },
    {
      de: 'Riskante Aktionen wie ein Host-Neustart können ohne ausdrückliche, separate Freigabe nicht ausgeführt werden, auch nicht durch einen Client, der eine Bestätigung vortäuscht.',
      en: 'A risky action like a host restart cannot run without an explicit, separate approval, not even from a client that fakes a confirmation.',
    },
    {
      de: 'Jede ausgeführte Aktion liegt nachvollziehbar im Audit-Log, der Wissens-Layer wählt den Raum pro Frage mit dokumentierter Begründung.',
      en: 'Every executed action sits traceably in the audit log; the knowledge layer picks the space per question with a documented rationale.',
    },
    {
      de: 'Der Gesundheits-Check trennt Pflicht-Bausteine von optionalen Upstreams: fällt ein optionaler Dienst aus, gilt der lokale Sprachkern weiter als gesund und wird nicht als defekt gemeldet.',
      en: 'The health check draws an honest line between mandatory building blocks and optional upstreams: if an optional service fails, the local voice core still reads as healthy and is not flagged broken.',
    },
  ],
  decisions: [
    {
      title: { de: 'Genau ein Weg für Aktionen', en: 'Exactly one path for actions' },
      body: {
        de: 'Aktionen laufen ausschließlich über den Tool-Bus mit Schema, Validierung, Timeout, Risk-Tier und Audit. Der Klassifikator selbst führt nichts aus, er bestimmt nur die Absicht. Sonst gäbe es eine zweite Tür, an der die ganze Prüfung vorbeiläuft.',
        en: 'Actions run exclusively over the tool bus: schema, validation, timeout, risk tier and audit. The classifier deliberately executes nothing. There is no second, unchecked door for an action to slip through.',
      },
    },
    {
      title: { de: 'Freigabe vor Ausführung', en: 'Approval before execution' },
      body: {
        de: 'Riskante Tools führen nichts aus. Sie liefern eine persistente Freigabe-Anfrage mit Ablaufzeit, scharf erst über einen getrennten Bestätigungs-Schritt. Ein im Aufruf vorgetäuschtes Schon-bestätigt wird abgelehnt, damit der Freigabe-Pfad nicht umgangen werden kann.',
        en: 'A risky tool executes nothing. It returns a persistent approval request with an expiry, going live only via a separate confirmation step. An already-confirmed faked into the call is rejected, so the approval path cannot be bypassed.',
      },
    },
    {
      title: {
        de: 'Kosten über Modell-Stufen, nicht über Sparmodus',
        en: 'Cost through model tiers, not a saving mode',
      },
      body: {
        de: 'Der Orchestrator entscheidet je Anfrage. Alltag und Briefing gehen an das lokale Modell, das starke Modell kommt nur dort zum Zug, wo Qualität zählt. Die Kostenkontrolle steckt damit im Aufbau selbst und braucht kein nachgelagertes Limit.',
        en: 'The orchestrator decides per request, never wholesale: local model for everyday tasks and the briefing, strong model only where quality counts. Cost control comes from the architecture, not a downstream limit.',
      },
    },
    {
      title: { de: 'Gesund heißt nicht benutzbar', en: 'Healthy is not the same as usable' },
      body: {
        de: 'Alle Endpunkte der Kette meldeten sich gesund, und trotzdem lief die Sprachantwort regelmäßig in ihren Timeout. Die Ursache lag hinter den Gesundheitschecks: eine Hintergrund-Automatik sprach dasselbe lokale Modell an wie die Sprachkette, und das Modell bedient bewusst nur eine Anfrage zugleich. Eine gesprochene Frage wartete also die komplette Hintergrund-Antwort ab, im Mittel eine halbe Minute. Die Absicht stand seit jeher im Quelltext, die Betriebs-Konfiguration hob sie auf. Seitdem liegt der Hintergrund auf einer eigenen langsamen Spur, und gemessen wird nicht mehr die Erreichbarkeit, sondern die Wartezeit an der Stelle, an der ein Mensch steht.',
        en: 'Every endpoint in the chain reported healthy, and the spoken reply still ran into its timeout on a regular basis. The cause sat behind the health checks: a background automation talked to the same local model as the voice chain, and that model deliberately serves one request at a time. So a spoken question waited out the entire background answer, half a minute on average. The intent had been in the source all along; the deployment config quietly overrode it. Since then the background work sits on a slow lane of its own, and what gets measured is no longer reachability but the wait at the point where a human is standing.',
      },
    },
    {
      title: {
        de: 'Das Modell tauschen, nicht die Hardware aufrüsten',
        en: 'Swap the model, do not upgrade the hardware',
      },
      body: {
        de: 'Die Spracherkennung brauchte gut fünf Sekunden je Befehl. Daran lag die Zähigkeit des gesprochenen Wegs, nicht am Sprachmodell. Naheliegend wäre stärkere Hardware gewesen. Stattdessen kam ein anderes Erkennungsmodell auf dieselbe Maschine, quantisiert und in einer schlankeren Laufzeit: aus 5,08 Sekunden wurden 0,33, gemessen über denselben Satz Testbefehle. Das alte Modell bleibt als Rückfallweg im Rezept stehen, weil es bei Störgeräuschen robuster ist. Seither nutze ich den gesprochenen Weg im Alltag.',
        en: 'Speech recognition took a good five seconds per command, and that, not the language model’s response time, was why the spoken path felt sluggish. The obvious move would have been stronger hardware. Instead a different recognition model went onto the same machine, quantized and on a leaner runtime: 5.08 seconds became 0.33, measured over the same set of test commands. The old model stays in the recipe as a fallback, because it holds up better against background noise. The gap between five seconds and a third of a second is the gap between a tool you use and one you avoid.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Modell-Stufen', en: 'Model tiers' },
      value: {
        de: 'lokal für Alltag · stark nur gezielt',
        en: 'local for everyday · strong only deliberately',
      },
    },
    {
      label: { de: 'Aktions-Pfad', en: 'Action path' },
      value: {
        de: 'ein Tool-Bus · Schema · Risk-Tier · Audit',
        en: 'one tool bus · schema · risk tier · audit',
      },
    },
    {
      label: { de: 'Riskante Aktion', en: 'Risky action' },
      value: { de: 'persistente Freigabe mit Ablauf', en: 'persistent approval with expiry' },
    },
    {
      label: { de: 'Eingänge', en: 'Intakes' },
      value: { de: 'Sprache · Text · API vereinheitlicht', en: 'voice · text · API unified' },
    },
    {
      label: { de: 'Spracherkennung', en: 'Speech recognition' },
      value: { de: '0,33 s je Befehl, vorher 5,08 s', en: '0.33 s per command, previously 5.08 s' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Eingangs-Gateway, Intent-Klassifikation und Tool-Bus mit Audit stehen',
        en: 'Intake gateway, intent classification and tool bus with audit in place',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Modell-Stufen lokal/stark, riskante Aktionen nur über persistente Freigabe',
        en: 'Model tiers local/strong, risky actions only via persistent approval',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Wissens-Layer pro Frage und inkrementeller Briefing-Pool angebunden',
        en: 'Per-question knowledge layer and incremental briefing pool wired in',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Kette durchgemessen: Hintergrund-Last vom Sprachpfad getrennt, Fehlauslösungen der Erkennung gefiltert',
        en: 'Chain measured end to end: background load split off the voice path, false triggers filtered out',
      },
    },
    {
      when: { de: 'danach', en: 'later' },
      what: {
        de: 'Weitere Tools und Wissensräume hängen sich an denselben geprüften Pfad',
        en: 'Further tools and knowledge spaces attach to the same checked path',
      },
    },
  ],
  limits: [
    {
      de: 'Der Sprachweg entscheidet die Modellwahl bis heute selbst und fragt den eigenen Routing-Dienst nicht. Die Sprachassistenz-Integration bringt ihre eigene Routing-Logik mit. Beide nebeneinander laufen zu lassen war der kleinere Eingriff gegenüber einem Umbau nah an den sicherheitskritischen Diensten. Zwei Stellen, die dasselbe entscheiden, sind trotzdem eine zu viel. Der Punkt bleibt offen, bis eine von beiden verschwindet.',
      en: 'The voice path still picks its own model tier instead of asking my routing service: the voice-assistant integration brings its own routing logic, and running both side by side was the deliberately smaller harm compared to a rebuild right next to the safety-critical services. Two routing brains are still one too many, and that stays an open bill until one of them goes.',
    },
    {
      de: 'Die Spracherkennung löst gelegentlich auf Nebengeräusche aus, etwa auf einen laufenden Fernseher. Gegen die auffälligsten Fälle steht inzwischen ein Güte-Filter. Ein Erkenner, der dauerhaft zuhört, reagiert aber auch auf Falsches. Der Filter dämpft das und beseitigt es nicht.',
      en: 'Speech recognition occasionally triggers on background noise, a running television for instance. A confidence filter now catches the worst of it, but a recognizer that listens also hears the wrong things; that can be damped, not switched off.',
    },
    {
      de: 'Die Sprach-Synthese arbeitet einfädig und braucht für einen längeren Absatz spürbar Zeit. Ein Job-Bus mit Prioritäten davor sorgt dafür, dass die kurze Antwort nicht hinter einem langen Vorlesetext steht; schneller wird die Synthese dadurch nicht.',
      en: 'Speech synthesis is single-threaded and takes noticeable time for a longer paragraph. A priority job bus in front of it keeps a short answer from queueing behind a long read-aloud; it does not make the synthesis any faster.',
    },
  ],
};

export default concierge;
