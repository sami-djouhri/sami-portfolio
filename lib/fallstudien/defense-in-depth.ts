import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 6/5; decisions 4/3; limits 2/3; Ebene 0: ports/core/false,fw/core/true,ssh/core/false,docker/core/false,files/core/true,certs/core/false <> edge/edge/true,sso/edge/true; Ebene 1: cmdb/data/true,disco/data/false <> zones/core/true,minpriv/core/true,socket/core/true; Ebene 2: bus/core/true,risk/core/true <> watcher/core/true,ids/core/true,bus/consumer/true; Ebene 3: ui/consumer/false,alert/consumer/false <> backup/data/true,drill/data/true,audit/data/true; Pfeile: ports>bus/false,fw>bus/true,files>bus/true,disco>cmdb/true,bus>risk/false,risk>ui/false,risk>alert/true <> edge>sso/true,sso>zones/true,watcher>bus/true,ids>bus/true,backup>drill/true
const defenseInDepth: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Ein Heimnetz, das öffentliche Dienste betreibt, ist angreifbar wie jedes andere, nur ohne Sicherheitsabteilung. Die übliche Antwort sind einzelne Massnahmen: eine Firewall hier, ein Zertifikatswechsel dort. Das Problem daran ist nicht die Massnahme, sondern dass niemand merkt, wenn sie wegfällt. Eine Regel, die jemand zum Testen gelockert und nie zurückgesetzt hat, sieht von außen genauso aus wie eine, die nie existiert hat.',
    approach: [
      'Zehn Prüfer sehen sich je einen Bereich an: offene Ports, Firewall-Regeln, deren Abgleich gegen das dokumentierte Soll, die Konfiguration des Fernzugangs, Zertifikatslaufzeiten, Container-Härtung, Dateiveränderungen, Schadsoftware-Signaturen, erreichbare Geräte im Netz und den Zustand der Wirte.',
      'Die Firewall wird nicht nur gelesen, sondern gegen das dokumentierte Soll gehalten. Jede Sperre, die im Betriebshandbuch steht, muss sich im laufenden Regelsatz wiederfinden. Dieser eine Prüfer trägt den größten Teil der Tests, weil ein falsch gelesener Regelsatz schlimmer ist als keiner.',
      'Datei-Veränderungen laufen über Prüfsummen gegen eine gespeicherte Vergleichsbasis. Dieselbe Aufgabe wie bei den bekannten Werkzeugen dafür, aber ohne zweite Datenbank: die Vergleichsbasis liegt in derselben Ablage wie alles andere.',
      'Alle Befunde laufen in eine Bewertung, die einen laufenden Zustand führt statt einer Liste von Einzelmeldungen. Wiederholte Funde zählen einmal, und der Wert sinkt wieder, wenn die Ursache weg ist.',
      'Ein Inventar hält fest, welche Geräte und Dienste es überhaupt gibt, und wird bei jedem Lauf fortgeschrieben. Ohne das prüft man nur, was man ohnehin auf dem Schirm hatte.',
      'Die Prüfer laufen in reinem Python statt über Shell-Aufrufe. Das spart den Umweg über eine Freigabeliste erlaubter Kommandos und ist bei einigen tausend Dateien schneller.',
    ],
    architecture: {
      summary: 'Zehn Prüfer sammeln Befunde aus ihrem jeweiligen Bereich und schreiben sie auf einen gemeinsamen Weg. Eine Bewertung führt daraus einen laufenden Zustand, entdoppelt wiederholte Funde und meldet Änderungen weiter. Ein Inventar hält den Bestand fest, gegen den geprüft wird. Die Firewall-Prüfung vergleicht den laufenden Regelsatz gegen das dokumentierte Soll.',
      tiers: [
        {
          label: 'Prüfer',
          nodes: [
            {
              id: 'ports',
              label: 'Offene Ports',
              kind: 'core',
            },
            {
              id: 'fw',
              label: 'Firewall-Soll-Ist',
              note: 'gegen das Handbuch',
              kind: 'core',
            },
            {
              id: 'ssh',
              label: 'Fernzugang',
              kind: 'core',
            },
            {
              id: 'docker',
              label: 'Container-Härtung',
              kind: 'core',
            },
            {
              id: 'files',
              label: 'Dateiveränderung',
              note: 'Prüfsummen',
              kind: 'core',
            },
            {
              id: 'certs',
              label: 'Zertifikatslaufzeit',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Bestand',
          nodes: [
            {
              id: 'cmdb',
              label: 'Inventar',
              note: 'wird fortgeschrieben',
              kind: 'data',
            },
            {
              id: 'disco',
              label: 'Geräte im Netz',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Bewertung',
          nodes: [
            {
              id: 'bus',
              label: 'Gemeinsamer Weg',
              note: 'alle Befunde',
              kind: 'core',
            },
            {
              id: 'risk',
              label: 'Laufender Zustand',
              note: 'entdoppelt, sinkt wieder',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Ausgabe',
          nodes: [
            {
              id: 'ui',
              label: 'Übersicht',
              kind: 'consumer',
            },
            {
              id: 'alert',
              label: 'Meldung bei Änderung',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'ports',
          to: 'bus',
        },
        {
          from: 'fw',
          to: 'bus',
          label: 'Abweichung vom Soll',
        },
        {
          from: 'files',
          to: 'bus',
          label: 'geänderte Prüfsumme',
        },
        {
          from: 'disco',
          to: 'cmdb',
          label: 'neues Gerät',
        },
        {
          from: 'bus',
          to: 'risk',
        },
        {
          from: 'risk',
          to: 'ui',
        },
        {
          from: 'risk',
          to: 'alert',
          label: 'nur bei Änderung',
        },
      ],
    },
    result: [
      'Zehn Prüfbereiche mit 163 Testfunktionen. Der Firewall-Soll-Ist-Vergleich trägt den größten Teil davon.',
      'Eine gelockerte und vergessene Regel fällt auf, weil der laufende Regelsatz gegen das dokumentierte Soll gehalten wird und nicht nur gegen sich selbst.',
      'Der Zustand ist ein laufender Wert, keine wachsende Liste. Behobene Ursachen senken ihn wieder, und ein wiederholter Fund zählt nur einmal.',
      'Dazu gehören verschlüsselte Sicherungen ausser Haus, Netztrennung in Zonen und eine Anmeldung vor den Diensten, die keine eigene mitbringen.',
    ],
    decisions: [
      {
        title: 'Gegen das Soll prüfen, nicht gegen sich selbst',
        body: 'Ein Prüfer, der nur den laufenden Regelsatz liest, bestätigt jeden Zustand als den richtigen. Erst der Abgleich gegen das dokumentierte Soll zeigt, dass eine Sperre fehlt, die dort stehen müsste. Das ist der Unterschied zwischen einer Bestandsaufnahme und einer Prüfung.',
      },
      {
        title: 'Ein laufender Zustand statt einer Meldungsliste',
        body: 'Eine Liste wächst, bis niemand mehr hineinsieht. Ein Wert, der mit der Ursache wieder sinkt, bleibt lesbar. Wiederholte Funde desselben Problems zählen deshalb einmal.',
      },
      {
        title: 'Die Vergleichsbasis liegt in derselben Ablage',
        body: 'Die bekannten Werkzeuge für Dateiveränderungen bringen eine eigene Datenbank mit, die man pflegen, sichern und mitwandern lassen muss. Hier liegen die Prüfsummen bei den übrigen Daten. Ein Bestandteil weniger, der auseinanderlaufen kann.',
      },
      {
        title: 'Kein Shell-Aufruf, wo Python reicht',
        body: 'Jeder Shell-Aufruf braucht eine Freigabe und ist eine zusätzliche Stelle, an der etwas unerwartet ausgeführt werden kann. Die Prüfer arbeiten deshalb direkt mit den Bordmitteln der Sprache, und bei einigen tausend Dateien ist das zugleich schneller.',
      },
    ],
    metrics: [
      {
        label: 'Prüfbereiche',
        value: '10',
      },
      {
        label: 'Tests',
        value: '163 Testfunktionen',
      },
      {
        label: 'Firewall-Prüfung',
        value: 'gegen das dokumentierte Soll',
      },
      {
        label: 'Bewertung',
        value: 'laufender Zustand, entdoppelt',
      },
    ],
    timeline: [
      {
        when: '2025',
        what: 'Erste Prüfer für Ports und Fernzugang',
      },
      {
        when: '2026 H1',
        what: 'Firewall-Soll-Ist gegen das dokumentierte Handbuch, Container-Härtung in Etappen',
      },
      {
        when: '2026 H1',
        what: 'Dateiveränderung über Prüfsummen, Inventar als Bestandsgrundlage',
      },
      {
        when: '2026 H2',
        what: 'Bewertung als laufender Zustand, Meldung nur bei Änderung',
      },
    ],
    // „Es gibt keine zweite Person, die die Befunde gegenliest. Was ich
    // übersehe, bleibt übersehen." ist am 2026-10-21 entfallen, siehe
    // Begründung bei `saganta`. Von den drei Personen-Sätzen war dieser der
    // deutlichste.
    // ⚠️ Die englische Fassung dieser Fallstudie hat ihn NICHT, dort stehen
    // drei ganz andere Grenzen: sie ist der Stand von vor dem Neuschreiben im
    // September (siehe die Projektregeln, „sieben englische Fallstudien").
    limits: [
      'Die Prüfer sehen, was von ihrem Standort aus sichtbar ist. Ein Angreifer mit Zugriff auf den Wirt selbst kann sie beeinflussen, und das lässt sich im Eigenbetrieb nicht ausschliessen.',
      'Die Schadsoftware-Prüfung arbeitet mit bekannten Signaturen und findet nichts Unbekanntes.',
    ],
  },
  enAlt: {
    problem: 'A self-operated infrastructure is only as secure as its weakest layer. Set a few headers or park a firewall out front and you have hardened one layer while leaving all the rest open: privileged containers, flat networks, shared identity, untested backups. I wanted the opposite: a defense that ties together container, network, edge, identity and recovery, is documented per exception and survives day-to-day operation.',
    approach: [
      'Containers minimally privileged by default: read-only root, dropped capabilities, no root, no new privileges. Docker access only through restricted proxies, every exception justified and kept in an inventory.',
      'Network cut into zones (ingress, brain, apps, ops) with one rule per container. A dedicated watcher streams connection joins against an approved whitelist and flags every unauthorized join in real time; sensitive service-to-service paths are additionally authenticated both ways via an mTLS sidecar.',
      'Identity centralized via an SSO/OIDC provider, sign-in protection with lockout windows, and a real-IP fix so the log behind the edge carries the true client address and not the tunnel address.',
      'Intrusion detection at the edge, deliberately detection-only: anomalies push over my own event bus, and automatic banning stays bound to manual approval to rule out self-inflicted harm to productive infrastructure.',
      'Encrypted off-site backup per host with separate repos and a recurring restore drill, so recovery is proven and not merely documented.',
    ],
    architecture: {
      summary: 'Identity and access terminate at the edge and get checked via SSO before requests reach the zone-cut services; each service runs minimally privileged with Docker access only through a proxy, a detection layer of network watcher and intrusion detection pushes anomalies over the event bus, and a resilience layer of encrypted off-site backup and restore drill sits crosswise beneath it all.',
      tiers: [
        {
          label: 'Edge & identity',
          nodes: [
            {
              id: 'edge',
              label: 'Edge termination',
              note: 'real client IP',
              kind: 'edge',
            },
            {
              id: 'sso',
              label: 'SSO / OIDC',
              note: 'central · sign-in protection',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Hardened services',
          nodes: [
            {
              id: 'zones',
              label: 'Network zones',
              note: 'one rule per container',
              kind: 'core',
            },
            {
              id: 'minpriv',
              label: 'Minimal privilege',
              note: 'read-only · no root',
              kind: 'core',
            },
            {
              id: 'socket',
              label: 'Socket proxy',
              note: 'exception inventory',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Detection',
          nodes: [
            {
              id: 'watcher',
              label: 'Network watcher',
              note: 'whitelist · real time',
              kind: 'core',
            },
            {
              id: 'ids',
              label: 'Intrusion detection',
              note: 'detection only, no auto-ban',
              kind: 'core',
            },
            {
              id: 'bus',
              label: 'Event bus',
              note: 'push on approval',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Resilience',
          nodes: [
            {
              id: 'backup',
              label: 'Off-site backup',
              note: 'encrypted · separate repos',
              kind: 'data',
            },
            {
              id: 'drill',
              label: 'Restore drill',
              note: 'recurring',
              kind: 'data',
            },
            {
              id: 'audit',
              label: 'Audit stream',
              note: 'long-term retention',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'edge',
          to: 'sso',
          label: 'auth before access',
        },
        {
          from: 'sso',
          to: 'zones',
          label: 'only the permitted',
        },
        {
          from: 'watcher',
          to: 'bus',
          label: 'unauthorized join',
        },
        {
          from: 'ids',
          to: 'bus',
          label: 'detection without auto-ban',
        },
        {
          from: 'backup',
          to: 'drill',
          label: 'tested recovery',
        },
      ],
    },
    result: [
      'Container hardening across the whole fleet effectively complete, remaining exceptions are justified as standing ones and kept in an inventory, not silently tolerated.',
      'Network segmented into four zones with one rule per container, drift detection live across multiple hosts, unauthorized connections announcing themselves in real time on the event bus.',
      'Central SSO with tightened sign-in protection and real client-IP logging behind the edge, audit-relevant services retained long-term in the audit stream.',
      'Encrypted off-site backup per host with separate repos and an automated restore drill. Recovery is proven.',
    ],
    decisions: [
      {
        title: 'Why it detects and does not ban',
        body: 'Intrusion detection at the edge runs deliberately without an active blocking mechanism. A live auto-ban behind the edge could have taken down my own tunnel or productive services on a mislogged source address. Detection and push notification are live; the active banning stays bound to a deliberate approval: detection without self-harm.',
      },
      {
        title: 'Hardening in waves with an exception inventory',
        body: 'A big bang would have been the wrong cut here. Each wave takes on a clearly bounded container class. Images that cannot run read-only stay as justified standing exceptions, so the hardening does not fail on them. A documented exception is more honest than a silent one.',
      },
      {
        title: 'mTLS sidecar deployed, enforcement as its own step',
        body: 'The edge sidecar for mutual TLS authentication is in place, but enforcement mode only switches on after a controlled certificate rollout to the devices. Enforce an authentication layer before every legitimate client holds a certificate and you lock yourself out first, which is why the cutover is deliberately a separate, planned step.',
      },
    ],
    metrics: [
      {
        label: 'Hardening waves',
        value: '3 waves, complete',
      },
      {
        label: 'Network zones',
        value: '4, one rule per container',
      },
      {
        label: 'Intrusion detection',
        value: 'detection-only, push on approval',
      },
      {
        label: 'Off-site backup',
        value: 'encrypted, with restore drill',
      },
    ],
    timeline: [
      {
        when: '2025',
        what: 'Container hardening in waves, network segmentation, exception inventory',
      },
      {
        when: '2026 H1',
        what: 'SSO tightening, real-IP fix, audit stream, drift watcher across multiple hosts',
      },
      {
        when: '2026 H1',
        what: 'Intrusion detection at the edge (detection-only) onto the event bus, encrypted off-site backup with restore drill',
      },
      {
        when: 'next up',
        what: 'mTLS enforcement after certificate rollout, active blocking mechanism after an observation phase and approval',
      },
    ],
    limits: [
      'Defended, but not audited: there is no external pen-test attestation and no compliance certification. The controls are documented and reasoned, but not signed off by a third party.',
      'Attack detection deliberately runs detection-only. That protects productive services from the own goal of an auto-ban, but it means an active attack needs a manual response instead of an automatic block.',
      'The mTLS sidecar is deployed but not yet enforced. Until the controlled certificate rollout, that layer stays optional rather than mandatory, honestly marked as the next step in the timeline.',
    ],
  },
};

export default defenseInDepth;
