import type { Fallstudie } from './typ';

// Neu erhoben am 2026-11-20: der Discord-Bot, den diese Arbeit bis dahin
// beschrieb, ist abgeloest. Beschrieben ist der Nachfolger, die Vorgeschichte
// steht in der Zeitleiste und in der ersten Entscheidung.
//
// Messbefehle (Stand 2026-11-20):
// - Regeln: docker/brain-bus/config/rules.yaml per yaml.safe_load, Liste `rules`, 96.
//   Jede traegt cooldown_seconds, triage und eine ntfy-Zuordnung.
// - Eingriffe: Regeln mit `action`, 4; davon 3 mit risk medium (Backup wiederholen,
//   Container neu starten bei Flattern und bei Neustartschleife), die vierte ist die
//   lesende Testregel des Meldewegs. risk medium heisst Freigabe, high wird nie
//   ausgefuehrt (docker/brain-bus/app/actions.py).
// - Diagnose: 34 Regeln mit `diagnose`; das lokale Modell schaetzt, ob der Eingriff
//   sinnvoll ist (app/decide.py), unter der Schwelle der Regel geschieht nichts.
// - Freigabe-TTL 24 h: CONFIRM_TTL_SECONDS in app/confirmations.py.
// - Kanaele: critical/warn/info in app/notify.py (NtfyClient).
// - Sammler: docker/tardis/docker-api/bereiche/sammler.py (Chronik 2 min, Updates 6 h,
//   Sicherheit 30 min, Tagesbericht 08:00).
// - Zweiter Ausgang: Regel NtfyAufJarvisStumm im Repo homelab/monitoring2.
const homelabSentinel: Fallstudie = {
  problem: {
    de: 'Ein Homelab im Dauerbetrieb braucht eine Bereitschaft, und das bin ausschließlich ich. Ohne Push heißt das, ständig in Dashboards zu schauen und trotzdem das eine Ereignis zu verpassen, das zählt. Das Haus soll sich deshalb selbst melden. Eingriffe sollen erst nach meiner Freigabe laufen. Fällt der Meldeweg selbst aus, soll auch das auffallen.',
    en: 'A home lab running around the clock needs an on-call person, and that is me alone. Without push, that means looking at dashboards all the time and still missing the one event that matters. So the house should report on its own. Interventions should only run after I approve them. If the alert path itself fails, that should be noticed too.',
  },
  approach: [
    {
      de: 'Alle Signale laufen über einen eigenen Event-Bus auf MQTT. Prometheus-Alarme, Timer und Skripte melden dorthin. Kein Dienst braucht einen eigenen Push-Weg.',
      en: 'All signals go through an own event bus on MQTT. Prometheus alerts, timers and scripts report there. No service needs its own push path.',
    },
    {
      de: 'Jede Meldung trifft eine Regel. Die Regel legt Dringlichkeit, Kanal und eine Ruhezeit fest. Eine Wiederholung innerhalb der Ruhezeit wird nur mitgezählt.',
      en: 'Every message hits a rule. The rule sets urgency, channel and a quiet period. A repeat within the quiet period is only counted.',
    },
    {
      de: 'Zugestellt wird über ntfy auf eigener Hardware, auf drei Kanälen nach Dringlichkeit. Das Handy hängt über das eigene VPN daran.',
      en: 'Delivery goes through ntfy on my own hardware, on three channels by urgency. The phone is connected over my own VPN.',
    },
    {
      de: 'Für einen Teil der Regeln sammelt der Bus vor der Meldung Diagnose ein: Dienststatus und frühere Vorfälle. Ein lokales Sprachmodell schätzt daraus, ob der hinterlegte Eingriff sinnvoll ist. Der Eingriff selbst wartet als Freigabe in Tardis, meinem Betriebsportal.',
      en: 'For some rules the bus collects a diagnosis before reporting: service state and earlier incidents. A local language model uses it to judge whether the stored intervention makes sense. The intervention itself waits as an approval in Tardis, my operations portal.',
    },
    {
      de: 'Was nicht als Ereignis ankommt, erhebt ein Sammler in Tardis: den Verlauf der Container, verfügbare Image-Updates, Sicherheitsbefunde und morgens einen Tagesbericht. Ein gestoppter Container wird nur gemeldet, wenn er laut Dienstkatalog laufen soll.',
      en: 'What does not arrive as an event is collected by a gatherer in Tardis: the container history, available image updates, security findings and a daily report in the morning. A stopped container is only reported if the service catalogue says it should run.',
    },
  ],
  architecture: {
    summary: {
      de: 'Quellen melden an den Event-Bus. Der Bus gleicht jede Meldung mit seinen Regeln ab und stellt über ntfy zu. Eingriffe legt er als Freigabe in Tardis ab und führt sie erst nach meinem Entscheid aus. Ein zweiter Beobachter auf einem eigenen Gast prüft ntfy und meldet einen Ausfall über ntfy.sh außerhalb des Hauses.',
      en: 'Sources report to the event bus. The bus matches every message against its rules and delivers through ntfy. It files interventions as approvals in Tardis and runs them only after my decision. A second observer on its own guest checks ntfy and reports an outage through ntfy.sh outside the house.',
    },
    tiers: [
      {
        label: { de: 'Quellen', en: 'Sources' },
        nodes: [
          {
            id: 'prom',
            kind: 'edge',
            label: { de: 'Prometheus-Alarme', en: 'Prometheus alerts' },
          },
          {
            id: 'jobs',
            kind: 'edge',
            label: { de: 'Timer und Skripte', en: 'Timers and scripts' },
          },
        ],
      },
      {
        label: { de: 'Verarbeitung', en: 'Processing' },
        nodes: [
          {
            id: 'bus',
            kind: 'core',
            label: { de: 'Event-Bus', en: 'Event bus' },
            note: { de: 'Regeln mit Ruhezeit', en: 'rules with quiet period' },
          },
          {
            id: 'freigabe',
            kind: 'core',
            label: { de: 'Freigaben in Tardis', en: 'Approvals in Tardis' },
            note: { de: 'verfallen nach 24 h', en: 'expire after 24 h' },
          },
          {
            id: 'sammler',
            kind: 'core',
            label: { de: 'Sammler in Tardis', en: 'Gatherer in Tardis' },
            note: { de: 'Verlauf, Updates, Befunde', en: 'history, updates, findings' },
          },
        ],
      },
      {
        label: { de: 'Ausgabe', en: 'Output' },
        nodes: [
          {
            id: 'ntfy',
            kind: 'data',
            label: { de: 'ntfy', en: 'ntfy' },
            note: { de: 'drei Kanäle', en: 'three channels' },
          },
        ],
      },
      {
        label: { de: 'Wächter', en: 'Watcher' },
        nodes: [
          {
            id: 'beobachter',
            kind: 'consumer',
            label: { de: 'Zweiter Beobachter', en: 'Second observer' },
            note: { de: 'meldet über ntfy.sh', en: 'reports via ntfy.sh' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'prom',
        to: 'bus',
        label: { de: 'Alarm', en: 'alert' },
      },
      {
        from: 'jobs',
        to: 'bus',
        label: { de: 'Ereignis', en: 'event' },
      },
      {
        from: 'bus',
        to: 'freigabe',
        label: { de: 'Eingriff', en: 'intervention' },
      },
      {
        from: 'freigabe',
        to: 'bus',
        label: { de: 'Entscheid', en: 'decision' },
      },
      {
        from: 'bus',
        to: 'ntfy',
        label: { de: 'Meldung', en: 'message' },
      },
      {
        from: 'sammler',
        to: 'ntfy',
        label: { de: 'Stopp, Befund, Tagesbericht', en: 'stop, finding, daily report' },
      },
      {
        from: 'beobachter',
        to: 'ntfy',
        label: { de: 'Probe', en: 'probe' },
      },
    ],
  },
  result: [
    {
      de: '96 Regeln ordnen jede Meldung einem der drei Kanäle zu, jede mit eigener Ruhezeit.',
      en: '96 rules assign every message to one of the three channels, each with its own quiet period.',
    },
    {
      de: 'Drei Eingriffe sind hinterlegt: ein fehlgeschlagenes Backup wiederholen und einen Container neu starten, wenn er flattert oder in einer Neustartschleife hängt. Keiner läuft ohne Freigabe. Eine Freigabe verfällt nach 24 Stunden.',
      en: 'Three interventions are on file: retry a failed backup, and restart a container when it flaps or is stuck in a restart loop. None runs without approval. An approval expires after 24 hours.',
    },
    {
      de: 'Offene Freigaben liegen in einer Warteschlange und nicht an einem Knopf im Chat. Nach einem Neustart sind sie weiter entscheidbar.',
      en: 'Open approvals sit in a queue and not on a button in a chat. After a restart they can still be decided.',
    },
    {
      de: 'Fällt ntfy aus, meldet das der zweite Beobachter über einen Weg, der nicht durch das Heimnetz führt.',
      en: 'If ntfy fails, the second observer reports it over a path that does not run through the home network.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum Discord rausflog', en: 'Why Discord went' },
      body: {
        de: 'Bis November 2026 war diese Arbeit ein Discord-Bot. Discord ist ein fremder Dienst im Internet, und Meldungen aus dem Haus sollen auch ohne Internet ankommen. ntfy läuft im Haus und reicht dafür. Discord bleibt für die Community-Bots in Gebrauch.',
        en: 'Until November 2026 this work was a Discord bot. Discord is a third-party service on the internet, and messages from the house should arrive without internet too. ntfy runs in the house and is enough for that. Discord stays in use for the community bots.',
      },
    },
    {
      title: { de: 'Bus als Quelle, Push nur als Ausgang', en: 'Bus as source, push only as output' },
      body: {
        de: 'Kein Dienst lernt einen eigenen Push-Weg. Alles läuft zuerst durch die Regeln mit ihrer Ruhezeit. Das hält die Menge der Meldungen klein, und an einer Flut stumpft eine Ein-Personen-Bereitschaft schnell ab.',
        en: 'No service learns its own push path. Everything runs through the rules and their quiet period first. That keeps the number of messages small, and a one-person on-call goes numb to a flood quickly.',
      },
    },
    {
      title: { de: 'Freigabe vor Eingriff', en: 'Approval before intervention' },
      body: {
        de: 'Ein falscher Eingriff ohne Rückfrage ist schlimmer als ein verpasster. Deshalb entscheidet das Sprachmodell nur, ob ein Eingriff überhaupt vorgeschlagen wird. Ausgeführt wird er erst nach meiner Freigabe.',
        en: 'A wrong intervention without asking is worse than a missed one. That is why the language model only decides whether an intervention is proposed at all. It runs only after my approval.',
      },
    },
    {
      title: { de: 'Ein Ausgang braucht einen Wächter von außen', en: 'One output needs an outside watcher' },
      body: {
        de: 'Mit Discord gab es zwei Ausgänge, die sich gegenseitig abdeckten. Jetzt ist ntfy der einzige. Fällt er aus, melden alle Wächter im Haus ins Leere. Deshalb prüft ihn ein Beobachter, der über einen eigenen Weg nach draußen meldet.',
        en: 'With Discord there were two outputs that covered for each other. Now ntfy is the only one. If it fails, every watcher in the house reports into nothing. That is why an observer checks it and reports over its own path to the outside.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Regeln', en: 'Rules' },
      value: { de: '96 im Event-Bus', en: '96 in the event bus' },
    },
    {
      label: { de: 'Kanäle', en: 'Channels' },
      value: { de: '3, nach Dringlichkeit', en: '3, by urgency' },
    },
    {
      label: { de: 'Eingriff', en: 'Intervention' },
      value: { de: 'nur nach Freigabe, 24 h gültig', en: 'only after approval, valid 24 h' },
    },
    {
      label: { de: 'Zustellung', en: 'Delivery' },
      value: { de: 'ntfy auf eigener Hardware', en: 'ntfy on own hardware' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Discord-Bot mit einem Modul je Prüfung, angebunden an den Event-Bus',
        en: 'Discord bot with one module per check, connected to the event bus',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Freigaben als Knöpfe im Chat, Wiederholung mit Versuchsgrenze',
        en: 'Approvals as buttons in the chat, retries with an attempt limit',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'ntfy als zweiter Ausgang neben Discord',
        en: 'ntfy as a second output next to Discord',
      },
    },
    {
      when: { de: 'November 2026', en: 'November 2026' },
      what: {
        de: 'Discord abgelöst: ntfy als einziger Ausgang, Freigaben und Sammler in Tardis, zweiter Beobachter prüft ntfy',
        en: 'Discord replaced: ntfy as the only output, approvals and gatherer in Tardis, second observer checks ntfy',
      },
    },
  ],
};

export default homelabSentinel;
