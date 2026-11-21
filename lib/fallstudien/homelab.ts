import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-15 (vorher Uebergangsform). Beide alten
// Haelften waren an mehreren Stellen ueberholt: Abgleich „stuendlich“ (laeuft
// alle 15 min mit Alarm je Klasse), ein Edge-Wirt in den Kennzahlen (stillgelegt),
// „alles an einem Ort“ (die oeffentliche Seite und die Spielserver laufen auf
// gemieteten Servern), englisch „restore drilled quarterly“ (woechentlich).
// Haertung, Zonen und Anmeldung erzaehlt `defense-in-depth`; hier steht der
// Betrieb: Liste, Abgleich, Meldeweg, Sicherung.
//
// Messbefehle (Stand 2026-11-15):
// - Abgleich: interne Notiz (Timer OnUnitActiveSec=15min),
//   Metrik dienst-soll-ist.prom: soll_laeuft_nicht je Klasse 0, bewusst_aus mit
//   erwartetem Zustand; Regeln CORE/OPS critical, Rest warning; Metrik
//   abgleich_vollstaendig fuer den Fall, dass ein Wirt nicht antwortet.
// - Meldeweg: meldeweg-probe (alle 6 h, Herzschlag 2 h alt), Gegenrichtung
//   meldeweg2-probe; alarm-lebendtest; prometheus-totmann (5 min, healthchecks).
// - Zweiter Beobachter: eigener Gast auf einem Cluster-Knoten, Alarm ueber
//   ntfy.sh ausserhalb des Hauses (Host-Referenz, Abschnitt Hosts).
// - Chaos-Probe: chaos-drill (Di 03:40, nur INTERNAL), letzter Lauf ok.
// - Sicherung: restore-drill `ausrollen.py --pruefen`: 10 mit Probe, Laptop
//   begruendet uebersprungen; DB-Rotation live auf 9 Wirten (Memory
//   interne Notiz). Wiederaufbau-Probe noch nicht
//   eingerichtet, deshalb nicht auf der Seite.
// - Image-Spiegel: image_spiegel.prom, Herzschlag 13 h; amd64-Wirte fehlen
//   noch (README image-spiegel, Abschnitt Grenzen).
// - Wirte: Einplatinenrechner, x86-Cluster, zwei gemietete Server (Seite und
//   Spiele). Bewusst ohne Zahl (ZIELBILD 3.4).
//
// Keine Dienst- oder Wirtezahl, keine internen Namen.
const homelab: Fallstudie = {
  problem: {
    de: 'In einem Heimlabor sammeln sich schnell dreißig Container an, jeder mit eigener Compose-Datei, ohne gemeinsame Liste und ohne Sicherung. Danach kann niemand mehr sagen, was gerade laufen sollte, und ein Dienst, der still steht, fällt erst auf, wenn man ihn braucht. Hier gibt es deshalb eine Liste als einzige Quelle, einen Abgleich, der alle 15 Minuten gegen die Rechner misst, einen Meldeweg, der sich selbst prüft, und eine Sicherung, die jede Woche zurückgespielt wird.',
    en: 'A home lab quickly collects thirty containers, each with its own compose file, no shared list and no backup. After that nobody can say what is supposed to be running, and a service that has quietly stopped only shows up when you need it. So here there is one list as the single source, a check that measures the machines against it every 15 minutes, an alert path that tests itself, and a backup that is restored every week.',
  },
  approach: [
    {
      de: 'Eine versionierte Liste sagt für jeden Dienst, auf welchem Rechner er läuft, zu welcher Klasse er gehört und ob er laufen soll. Ein neuer Dienst geht zuerst dort hinein. „Bewusst aus“ ist ein eigener Zustand, damit ein abgeschalteter Dienst nicht als Fehler gilt.',
      en: 'A versioned list states for every service which machine it runs on, which class it belongs to and whether it should be running. A new service goes in there first. "Deliberately off" is a state of its own, so a service that was switched off does not count as a failure.',
    },
    {
      de: 'Alle 15 Minuten fragt ein Abgleich jeden Rechner, was dort läuft, und vergleicht das mit der Liste. Fehlt ein Dienst aus dem Kern, etwa die Hausautomation oder der Git-Server, ist das ein dringender Alarm. Bei anderen Diensten ist es eine Warnung. Antwortet ein Rechner nicht, meldet der Abgleich das als eigenen Befund.',
      en: 'Every 15 minutes a check asks each machine what is running there and compares it with the list. If a core service is missing, such as home automation or the Git server, that is an urgent alert. For other services it is a warning. If a machine does not answer, the check reports that as a finding of its own.',
    },
    {
      de: 'Meldungen laufen alle über denselben Weg. Dienste schreiben auf einen MQTT-Bus, ein Regelwerk entscheidet, was mich erreicht, und dämpft Wiederholungen je Dienst.',
      en: 'All alerts take the same path. Services write to an MQTT bus, a rule engine decides what reaches me and damps repeats per service.',
    },
    {
      de: 'Der Meldeweg wird selbst geprüft. Alle sechs Stunden geht eine Probe-Nachricht durch die ganze Kette und wird am Ende gesucht. Steht Prometheus, schlägt ein Totmannschalter an. Ein zweiter Beobachter auf einem anderen Rechner sieht von außen zu und meldet über einen Dienst außerhalb des Hauses.',
      en: 'The alert path is tested itself. Every six hours a probe message goes through the whole chain and is looked for at the end. If Prometheus stops, a dead man\'s switch goes off. A second observer on another machine watches from outside and alerts through a service outside the house.',
    },
    {
      de: 'Einmal pro Woche bekommt ein unkritischer Dienst ein Signal zum Beenden. Gemessen wird, ob er von selbst zurückkommt und wieder gesund ist.',
      en: 'Once a week a non-critical service gets a signal to shut down. What gets measured is whether it comes back on its own and is healthy again.',
    },
    {
      de: 'Jeder Rechner sichert verschlüsselt mit restic außer Haus, und jede Woche wird je Sicherung eine Probe zurückgespielt. Auf fast allen Rechnern prüft sie seit November auch Datenbankkopien aus der Sicherung, die am längsten ungeprüfte zuerst.',
      en: 'Every machine backs up encrypted with restic outside the house, and every week a sample is restored from each backup. On almost all machines it has also checked database copies from the backup since November, the one left unchecked the longest first.',
    },
    {
      de: 'Jede Nacht kommen die Images der laufenden Container in eine Registry im Haus. Muss ein Rechner ohne Internet neu aufgesetzt werden, liegt dort das Image, das gestern lief.',
      en: 'Every night the images of the running containers go into a registry in the house. If a machine has to be rebuilt without internet, the image that ran yesterday is there.',
    },
  ],
  architecture: {
    summary: {
      de: 'Eine versionierte Liste ist das Soll. Der Abgleich misst alle 15 Minuten die Rechner dagegen und meldet Abweichungen über den gemeinsamen Bus an ein Regelwerk, das entscheidet, was ans Handy geht. Ein zweiter Beobachter sieht von außen zu und hat seinen eigenen Weg nach draußen. Darunter liegen die Sicherung außer Haus mit wöchentlicher Rückspielprobe und ein Image-Spiegel im Haus.',
      en: 'A versioned list is the target state. The check measures the machines against it every 15 minutes and reports differences over the shared bus to a rule engine that decides what goes to my phone. A second observer watches from outside and has its own path out. Underneath are the off-site backup with a weekly restore drill and an image mirror inside the house.',
    },
    tiers: [
      {
        label: { de: 'Soll', en: 'Target' },
        nodes: [
          {
            id: 'liste',
            label: { de: 'Dienst-Liste', en: 'Service list' },
            note: { de: 'versioniert, einzige Quelle', en: 'versioned, single source' },
            kind: 'core',
          },
          {
            id: 'abgleich',
            label: { de: 'Abgleich', en: 'Check' },
            note: { de: 'alle 15 Minuten', en: 'every 15 minutes' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Rechner', en: 'Machines' },
        nodes: [
          {
            id: 'heim',
            label: { de: 'Rechner im Haus', en: 'Machines at home' },
            note: { de: 'Einplatinenrechner · x86-Cluster', en: 'single-board · x86 cluster' },
            kind: 'consumer',
          },
          {
            id: 'miete',
            label: { de: 'Gemietete Server', en: 'Rented servers' },
            note: { de: 'öffentliche Seite · Spiele', en: 'public site · games' },
            kind: 'edge',
          },
        ],
      },
      {
        label: { de: 'Meldeweg', en: 'Alert path' },
        nodes: [
          {
            id: 'bus',
            label: { de: 'Nachrichtenbus', en: 'Message bus' },
            note: { de: 'MQTT', en: 'MQTT' },
            kind: 'core',
          },
          {
            id: 'regeln',
            label: { de: 'Regelwerk', en: 'Rule engine' },
            note: { de: 'entscheidet, was ankommt', en: 'decides what arrives' },
            kind: 'core',
          },
          {
            id: 'zweiter',
            label: { de: 'Zweiter Beobachter', en: 'Second observer' },
            note: { de: 'eigener Weg nach draußen', en: 'own path out' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Sicherung', en: 'Backup' },
        nodes: [
          {
            id: 'backup',
            label: { de: 'Verschlüsselt außer Haus', en: 'Encrypted off-site' },
            kind: 'data',
          },
          {
            id: 'probe',
            label: { de: 'Rückspielprobe', en: 'Restore drill' },
            note: { de: 'jede Woche', en: 'every week' },
            kind: 'data',
          },
          {
            id: 'spiegel',
            label: { de: 'Image-Spiegel', en: 'Image mirror' },
            note: { de: 'im Haus', en: 'in the house' },
            kind: 'data',
          },
        ],
      },
    ],
    flows: [
      { from: 'liste', to: 'abgleich', label: { de: 'Soll', en: 'target' } },
      { from: 'abgleich', to: 'heim', label: { de: 'misst', en: 'measures' } },
      { from: 'abgleich', to: 'bus', label: { de: 'Abweichung', en: 'difference' } },
      { from: 'bus', to: 'regeln' },
      { from: 'zweiter', to: 'heim', label: { de: 'sieht von außen zu', en: 'watches from outside' } },
      { from: 'backup', to: 'probe', label: { de: 'wird zurückgespielt', en: 'is restored' } },
    ],
  },
  result: [
    {
      de: 'Die Dienste laufen auf Einplatinenrechnern, einem kleinen x86-Cluster und zwei gemieteten Servern. Alle stehen in derselben Liste und werden gegen sie gemessen.',
      en: 'The services run on single-board computers, a small x86 cluster and two rented servers. All of them are in the same list and are measured against it.',
    },
    {
      de: 'Seit Oktober misst der Abgleich alle 15 Minuten statt einmal pro Stunde, und er alarmiert nach Klasse. Ein Rechner, der nicht antwortet, kann nicht mehr als „alles in Ordnung“ durchgehen.',
      en: 'Since October the check runs every 15 minutes instead of once an hour, and it alerts by class. A machine that does not answer can no longer pass as "all fine".',
    },
    {
      de: 'Kommt die Probe-Nachricht nicht an oder steht Prometheus, meldet sich ein anderer Weg.',
      en: 'If the probe message does not arrive or Prometheus stops, a different path reports it.',
    },
    {
      de: 'Jede Sicherung bis auf die des Laptops wird jede Woche zurückgespielt. Der Laptop ist meist aus, für ihn liegt ein Timer bereit, der den verpassten Lauf beim nächsten Start nachholt.',
      en: 'Every backup except the laptop\'s is restored every week. The laptop is mostly off; a timer that catches up on the missed run at the next start is ready for it.',
    },
  ],
  decisions: [
    {
      title: { de: 'Kein Service-Mesh', en: 'No service mesh' },
      body: {
        de: 'Für ein Heimnetz ist das zu viel Maschinerie. Reverse-Proxy, Tunnel, VPN und getrennte Netze reichen aus, und ich kann jedes davon einzeln erklären.',
        en: 'For a home network that is too much machinery. Reverse proxy, tunnel, VPN and separate networks are enough, and I can explain each of them on its own.',
      },
    },
    {
      title: { de: 'Die Klasse steht in der Liste, nicht in der Alarmregel', en: 'The class lives in the list, not in the alert rule' },
      body: {
        de: 'Ob ein fehlender Dienst mich weckt oder nur eine Warnung ist, hängt an seiner Klasse in der Liste. Die Alternative wäre eine Namensliste in der Alarmregel gewesen. Die müsste bei jedem neuen Kerndienst von Hand nachgezogen werden.',
        en: 'Whether a missing service wakes me up or is only a warning depends on its class in the list. The alternative would have been a list of names in the alert rule. It would have to be updated by hand for every new core service.',
      },
    },
    {
      title: { de: 'Den Meldeweg selbst prüfen', en: 'Testing the alert path itself' },
      body: {
        de: 'Wenn nichts kommt, heißt das entweder „alles ruhig“ oder „der Meldeweg ist tot“. Die zweite Lesart fällt niemandem auf, weil die Meldung darüber denselben Weg nehmen müsste. Deshalb geht regelmäßig eine echte Nachricht durch die Kette, und ein zweiter Weg prüft den ersten.',
        en: 'When nothing arrives, that means either "all quiet" or "the alert path is dead". The second reading goes unnoticed, because the alert about it would have to take the same path. So a real message goes through the chain at regular intervals, and a second path checks the first.',
      },
    },
    {
      title: { de: 'Ein Weg für alle Meldungen', en: 'One path for all alerts' },
      body: {
        de: 'Jedem Dienst eigene Benachrichtigungen beizubringen, hätte sich nicht gelohnt. Alles läuft über denselben Bus an ein Regelwerk. Wiederholungen und Ruhezeiten sind damit an einer Stelle einstellbar.',
        en: 'Teaching every service its own notifications would not have paid off. Everything goes over the same bus to one rule engine. Repeats and quiet periods can be set in one place.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Abgleich gegen die Liste', en: 'Check against the list' },
      value: { de: 'alle 15 Minuten', en: 'every 15 minutes' },
    },
    {
      label: { de: 'Probe des Meldewegs', en: 'Alert path probe' },
      value: { de: 'alle 6 Stunden', en: 'every 6 hours' },
    },
    {
      label: { de: 'Rückspielprobe', en: 'Restore drill' },
      value: { de: 'jede Woche je Sicherung', en: 'every week per backup' },
    },
  ],
  timeline: [
    {
      when: { de: '2024', en: '2024' },
      what: { de: 'Erste Rechner, erste Container', en: 'First machines, first containers' },
    },
    {
      when: { de: '2025', en: '2025' },
      what: { de: 'Dienst-Liste, Härtung in Etappen, Netzzonen', en: 'Service list, hardening in stages, network zones' },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: { de: 'Gemeinsamer Meldeweg, x86-Cluster, erster gemieteter Server für die öffentliche Seite', en: 'Shared alert path, x86 cluster, first rented server for the public site' },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: { de: 'Spielserver auf eigenem Server, Rückspielprobe und Probe des Meldewegs, zweiter Beobachter', en: 'Game servers on their own server, restore drill and alert path probe, second observer' },
    },
    {
      when: { de: 'Okt./Nov. 2026', en: 'Oct/Nov 2026' },
      what: { de: 'Abgleich alle 15 Minuten, Totmannschalter für Prometheus, Image-Spiegel, Datenbanken in der Rückspielprobe', en: 'Check every 15 minutes, dead man\'s switch for Prometheus, image mirror, databases in the restore drill' },
    },
  ],
  limits: [
    {
      de: 'Die Dienste im Haus hängen an einem Hausanschluss. Es gibt keinen zweiten Standort und keine automatische Umschaltung. Nur die öffentliche Seite und die Spielserver laufen auf gemieteten Servern.',
      en: 'The services at home depend on one home connection. There is no second site and no automatic failover. Only the public site and the game servers run on rented servers.',
    },
    {
      de: 'Der Image-Spiegel steht im selben Haus wie die Rechner, und die x86-Rechner und die gemieteten Server legen dort noch nichts ab.',
      en: 'The image mirror is in the same house as the machines, and the x86 machines and the rented servers do not store anything there yet.',
    },
    {
      de: 'Die Last ist echt, aber überschaubar: ein Haushalt, keine hunderten gleichzeitigen Nutzer. Gebaut ist das auf Wartbarkeit und Härtung, nicht auf Lastspitzen.',
      en: 'The load is real but modest: one household, not hundreds of concurrent users. It is built for maintainability and hardening, not for load peaks.',
    },
  ],
};

export default homelab;
