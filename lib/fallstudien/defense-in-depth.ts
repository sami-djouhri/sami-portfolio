import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-14 (vorher Uebergangsform). Die beiden
// alten Haelften beschrieben verschiedene Arbeiten: das Deutsche nur das
// Audit-Werkzeug, das Englische die Schichten (Haertung, Zonen, Anmeldung,
// Rand, Sicherung). Der Projekteintrag und Gate 1j (crowdsec, authelia) meinen
// die Schichten. Jetzt steht beides in einer Fassung, das Audit-Werkzeug als
// die Pruefschicht.
//
// Messbefehle (Stand 2026-11-14):
// - Haertung: `docker inspect` ueber alle laufenden Container auf dem
//   Hauptrechner: alle mit no-new-privileges, keiner privileged, fast alle mit
//   cap_drop ALL, rund vier von fuenf read-only, knapp drei Viertel mit eigenem
//   Nutzer. Bewusst ohne Zahlen auf der Seite (ZIELBILD 3.4).
// - Socket: Mounts von docker.sock: nur die Socket-Proxys, kein App-Container.
// - Zonen: `docker network ls`, vier cc-Netze; Waechter-Log mit Verstoessen
//   und erkannten Einmal-Containern; Freigabeliste whitelist.txt.
// - Rand: crowdsec v1.8.1, `cscli bouncers list` leer, Collections nginx,
//   sshd, http-cve u.a.; Meldeweg ueber den MQTT-Producer.
// - Anmeldung: Authelia-Konfiguration nur nach Schluesselnamen gelesen:
//   regulation 3 Versuche / 2 min / 30 min Sperre, totp, oidc mit zwei Clients.
// - Audit: app/scanners (zehn Module), `pytest`: 163 passed, groesste Datei
//   test_firewall_policy.py (37); Timer taeglich 04:10 auf dem Hauptrechner,
//   Lauf vom 14.11. im Journal. Auf dem zweiten Rechner Werkzeug ohne Timer.
// - Firewall-Pruefung: _PORT_MATCHERS mit --ctorigdstport in firewall_policy.py.
// - Bewertung und Ausnahmen: tests/test_bewertung_und_ausnahmen.py (Selbst-Audit
//   vom 2026-08-29: 490 Rohpunkte gekappt auf 100; Label schaltete alles ab).
// - Dauerdienst: security-Commit vom 2026-04-10 (persistent, 0.0.0.0).
// - Sicherung: restore-drill `ausrollen.py --pruefen`: alle Repos mit Probe bis
//   auf den Laptop; service-restore-drill README (monatlich, Schema-Vergleich).
// - mTLS: mobile-api README „Stand von mTLS“, REQUIRE_MTLS false.
//
// Keine Dienst- oder Wirtezahl, keine Produkt-Konfiguration im Wortlaut.
const defenseInDepth: Fallstudie = {
  problem: {
    de: 'Ein Heimnetz mit öffentlichen Diensten hat keine Sicherheitsabteilung. Einzelne Maßnahmen helfen nur, solange sie bestehen. Eine Firewall-Regel, die zum Testen gelockert und nie zurückgesetzt wurde, sieht von außen genauso aus wie eine, die es nie gab. Deshalb gibt es hier mehrere Schichten und eine Prüfung, die jeden Tag nachsieht, ob sie noch stehen.',
    en: 'A home network with public services has no security department. Individual measures only help as long as they stay in place. A firewall rule that was loosened for a test and never restored looks from outside exactly like one that never existed. That is why there are several layers here, and a check that looks every day whether they are still standing.',
  },
  approach: [
    {
      de: 'Jeder Container startet ohne die Möglichkeit, sich mehr Rechte zu verschaffen. Fast alle laufen ohne Capabilities, die meisten mit schreibgeschütztem Dateisystem und eigenem Nutzer statt root. Wo ein Image das nicht kann, steht die Ausnahme mit Grund in der Prüfung.',
      en: 'Every container starts without the ability to gain further privileges. Almost all run without capabilities, most with a read-only filesystem and their own user instead of root. Where an image cannot do that, the exception is recorded with its reason in the audit.',
    },
    {
      de: 'Kein Anwendungs-Container hängt direkt am Docker-Socket. Wer Daten über Container braucht, fragt einen vorgeschalteten Proxy, der nur die nötigen Aufrufe durchlässt.',
      en: 'No application container is attached to the Docker socket directly. Anything that needs container data asks a proxy in front of it, which only lets the required calls through.',
    },
    {
      de: 'Das Netz der Container ist in vier Zonen geteilt: Eingang, Kern, Anwendungen und Verwaltung. Ein Wächter liest die Ereignisse von Docker mit und gleicht jeden Beitritt zu einer Zone gegen eine Freigabeliste ab. Ein Beitritt, der dort nicht steht, geht als Alarm aufs Handy.',
      en: 'The container network is split into four zones: ingress, core, applications and management. A watcher follows the Docker events and checks every join to a zone against an allow list. A join that is not on it goes to my phone as an alert.',
    },
    {
      de: 'Dienste lauschen nur auf dem eigenen Rechner. Welche Ports im Heimnetz erreichbar sein dürfen, steht in einer Ausnahmeliste. Öffentliche Dienste erreicht man nur über einen ausgehenden Tunnel.',
      en: 'Services listen only on their own machine. Which ports may be reachable on the home network is written down in an exception list. Public services can only be reached through an outbound tunnel.',
    },
    {
      de: 'Am öffentlichen Rand liest CrowdSec die Protokolle des Proxys und der SSH-Anmeldung mit, mit der echten Adresse des Absenders. Befunde gehen über den Ereignisweg des Hauses aufs Handy. Gesperrt wird nichts automatisch.',
      en: 'At the public edge CrowdSec reads the logs of the proxy and of SSH logins, with the real sender address. Findings go to my phone over the house event bus. Nothing is blocked automatically.',
    },
    {
      de: 'Dienste ohne eigene Anmeldung stehen hinter Authelia. Nach drei Fehlversuchen in zwei Minuten bleibt die Anmeldung eine halbe Stunde gesperrt. Eigene Anwendungen melden sich darüber per OIDC an.',
      en: 'Services without their own login sit behind Authelia. After three failed attempts within two minutes, login stays locked for half an hour. My own applications sign in through it via OIDC.',
    },
    {
      de: 'Zehn Prüfer laufen jeden Morgen als einmaliger Lauf unter einem systemd-Timer. Sie sehen sich offene Ports, Firewall, SSH-Konfiguration, Zertifikate, Container, Dateiveränderungen und den Zustand des Rechners an. Die Firewall wird gegen ein dokumentiertes Soll gehalten, die lauschenden Ports gegen die Ausnahmeliste. Die Signaturprüfung mit ClamAV ist vorhanden und standardmäßig aus.',
      en: 'Ten checks run every morning as a one-off run under a systemd timer. They look at open ports, firewall, SSH configuration, certificates, containers, file changes and the state of the machine. The firewall is held against a documented target state, the listening ports against the exception list. Signature scanning with ClamAV exists and is off by default.',
    },
    {
      de: 'Jeder Rechner sichert verschlüsselt mit restic auf einen Speicher außer Haus. Jede Woche läuft je Repo eine Rückspielprobe. Sie prüft die Struktur und holt eine Datei zurück, deren Prüfsumme sie vergleicht. In der ersten Woche des Monats werden zusätzlich echte Daten aus dem Repo gelesen und nachgerechnet.',
      en: 'Every machine backs up encrypted with restic to storage outside the house. Every week a restore drill runs per repository. It checks the structure and restores one file, whose checksum it compares. In the first week of the month real data is additionally read from the repository and verified.',
    },
    {
      de: 'Eine zweite Probe geht eine Ebene weiter. Einmal im Monat holt sie die Datenbank eines Dienstes aus der Sicherung, startet sie in einem Wegwerf-Container und vergleicht ihre Tabellen mit der laufenden Instanz.',
      en: 'A second drill goes one level further. Once a month it restores the database of a service from the backup, starts it in a throwaway container and compares its tables with the running instance.',
    },
  ],
  architecture: {
    summary: {
      de: 'Von außen kommt nur an, was durch den Tunnel geht. Dort liest das IDS mit, und vor Diensten ohne eigene Anmeldung steht die zentrale Anmeldung. Die Dienste selbst laufen gehärtet in Zonen und erreichen Docker nur über Proxys. Zwei Prüfungen sehen von der Seite zu: der Netz-Wächter in Echtzeit, das Audit einmal am Tag gegen die Soll-Dateien. Darunter liegen die Sicherung außer Haus und die Proben, die aus ihr zurückholen.',
      en: 'From outside, only what passes through the tunnel arrives. There the IDS reads along, and services without their own login sit behind the central sign-in. The services themselves run hardened in zones and reach Docker only through proxies. Two checks watch from the side: the network watcher in real time, the audit once a day against the target files. Underneath are the off-site backup and the drills that restore from it.',
    },
    tiers: [
      {
        label: { de: 'Rand', en: 'Edge' },
        nodes: [
          {
            id: 'tunnel',
            label: { de: 'Ausgehender Tunnel', en: 'Outbound tunnel' },
            note: { de: 'von innen aufgebaut', en: 'opened from inside' },
            kind: 'edge',
          },
          {
            id: 'ids',
            label: { de: 'IDS', en: 'IDS' },
            note: { de: 'erkennt, sperrt nicht', en: 'detects, does not block' },
            kind: 'edge',
          },
          {
            id: 'sso',
            label: { de: 'Anmeldung', en: 'Sign-in' },
            note: { de: 'SSO · OIDC · Sperre', en: 'SSO · OIDC · lockout' },
            kind: 'edge',
          },
        ],
      },
      {
        label: { de: 'Dienste', en: 'Services' },
        nodes: [
          {
            id: 'zonen',
            label: { de: 'Netz-Zonen', en: 'Network zones' },
            note: { de: 'vier, mit Freigabeliste', en: 'four, with allow list' },
            kind: 'core',
          },
          {
            id: 'haertung',
            label: { de: 'Container-Härtung', en: 'Container hardening' },
            note: { de: 'keine Rechte-Ausweitung', en: 'no privilege escalation' },
            kind: 'core',
          },
          {
            id: 'proxy',
            label: { de: 'Socket-Proxys', en: 'Socket proxies' },
            note: { de: 'nur nötige Aufrufe', en: 'required calls only' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Prüfung', en: 'Checks' },
        nodes: [
          {
            id: 'waechter',
            label: { de: 'Netz-Wächter', en: 'Network watcher' },
            note: { de: 'jeder Beitritt, sofort', en: 'every join, immediately' },
            kind: 'core',
          },
          {
            id: 'audit',
            label: { de: 'Audit', en: 'Audit' },
            note: { de: 'zehn Prüfer, täglich', en: 'ten checks, daily' },
            kind: 'core',
          },
          {
            id: 'soll',
            label: { de: 'Soll-Dateien', en: 'Target files' },
            note: { de: 'Sperren · erlaubte Ports', en: 'locks · allowed ports' },
            kind: 'data',
          },
        ],
      },
      {
        label: { de: 'Meldung und Wiederanlauf', en: 'Alerts and recovery' },
        nodes: [
          {
            id: 'handy',
            label: { de: 'Meldung aufs Handy', en: 'Alert to phone' },
            note: { de: 'über den Ereignisweg', en: 'via the event bus' },
            kind: 'consumer',
          },
          {
            id: 'sicherung',
            label: { de: 'Sicherung außer Haus', en: 'Off-site backup' },
            note: { de: 'verschlüsselt, je Rechner', en: 'encrypted, per machine' },
            kind: 'data',
          },
          {
            id: 'probe',
            label: { de: 'Rückspielprobe', en: 'Restore drill' },
            note: { de: 'wöchentlich je Repo · monatlich ein Dienst', en: 'weekly per repo · monthly one service' },
            kind: 'data',
          },
        ],
      },
    ],
    flows: [
      { from: 'tunnel', to: 'sso', label: { de: 'erst anmelden', en: 'sign in first' } },
      { from: 'sso', to: 'zonen' },
      { from: 'ids', to: 'handy', label: { de: 'Befund', en: 'finding' } },
      { from: 'waechter', to: 'handy', label: { de: 'nicht freigegebener Beitritt', en: 'unapproved join' } },
      { from: 'soll', to: 'audit', label: { de: 'Vergleich', en: 'comparison' } },
      { from: 'audit', to: 'handy', label: { de: 'nur Neues', en: 'only what is new' } },
      { from: 'sicherung', to: 'probe', label: { de: 'zurückholen', en: 'restore' } },
    ],
  },
  result: [
    {
      de: 'Der tägliche Lauf führt einen Risikowert und eine Befundliste. Gemeldet wird nur, was neu und kritisch ist, mit einer Abklingzeit für Wiederholungen.',
      en: 'The daily run keeps a risk score and a list of findings. Only what is new and critical gets reported, with a cooldown for repeats.',
    },
    {
      de: 'Die Prüfer haben 163 Testfunktionen. Die Firewall-Prüfung hat davon die meisten, weil ein falsch gelesener Regelsatz schlimmer ist als keiner.',
      en: 'The checks have 163 test functions. The firewall check has the most of them, because a misread rule set is worse than none.',
    },
    {
      de: 'Container, die nur einmal für eine Aufgabe laufen, erkennt der Netz-Wächter als Ableger eines freigegebenen Dienstes. Sie lösen keinen Alarm aus.',
      en: 'Containers that run once for a single task are recognized by the network watcher as offshoots of an approved service. They do not trigger an alert.',
    },
    {
      de: 'Aus jedem Sicherungs-Repo wird jede Woche etwas zurückgeholt. Die einzige Ausnahme ist der Laptop, der an den meisten Tagen aus ist.',
      en: 'Something is restored from every backup repository every week. The only exception is the laptop, which is switched off on most days.',
    },
  ],
  decisions: [
    {
      title: { de: 'Gegen das Soll prüfen, nicht gegen sich selbst', en: 'Check against the target, not against itself' },
      body: {
        de: 'Ein Prüfer, der nur den laufenden Regelsatz liest, bestätigt jeden Zustand als richtig. Erst der Abgleich mit dem dokumentierten Soll zeigt, dass eine Sperre fehlt. Deshalb gibt es Soll-Dateien für die Sperren und für die Ports, die im Heimnetz lauschen dürfen. Was dort fehlt, wird nicht geprüft, und das steht auch so im Kopf der Datei.',
        en: 'A check that only reads the running rule set confirms every state as correct. Only the comparison with the documented target shows that a lock is missing. That is why there are target files for the locks and for the ports that may listen on the home network. Whatever is missing there is not checked, and the file header says so.',
      },
    },
    {
      title: { de: 'Die Regel so lesen, wie sie wirkt', en: 'Read the rule the way it acts' },
      body: {
        de: 'Docker setzt die Zieladresse um, bevor die Firewall-Kette für Container ein Paket sieht. Eine Sperre auf den veröffentlichten Port trifft dort nie ein Paket und liest sich trotzdem wie ein Schutz. Die Sperren hier prüfen deshalb den ursprünglichen Zielport aus der Verbindungsverfolgung. Die Prüfung kennt beide Schreibweisen. Mit nur der üblichen hätte sie jede funktionierende Sperre als fehlend gemeldet.',
        en: 'Docker rewrites the destination address before the firewall chain for containers sees a packet. A lock on the published port never matches a packet there and still reads like protection. The locks here therefore match the original destination port from connection tracking. The check knows both notations. With only the usual one it would have reported every working lock as missing.',
      },
    },
    {
      title: { de: 'Eine Ausnahme sagt, was sie wegnimmt', en: 'An exception says what it takes away' },
      body: {
        de: 'Früher schaltete ein Docker-Label alle Befunde eines Containers ab, und zwar vor jeder Prüfung. Der Container mit den weitesten Rechten meldete dadurch null Befunde über sich selbst. Heute nennt eine Ausnahme ein Muster und einen Grund. Jeder Lauf schreibt ins Protokoll, wie viele Befunde sie angenommen hat und wie viele offen bleiben.',
        en: 'An exception used to be a Docker label that switched off all findings for a container, before any check ran. As a result the container with the widest privileges reported zero findings about itself. Today an exception names a pattern and a reason. Every run writes to the log how many findings it accepted and how many stay open.',
      },
    },
    {
      title: { de: 'Ein Risikowert, der sich bewegen kann', en: 'A risk score that can move' },
      body: {
        de: 'Der Wert wurde anfangs aus allen Befunden aufsummiert und bei 100 gekappt. Bei 27 echten Befunden kamen 490 Rohpunkte heraus. Ab etwa sieben mittleren Befunden stand jeder Zustand auf kritisch, und der Verlauf zeigte nichts mehr. Heute wird je Kategorie gewichtet, und Wiederholungen zählen einmal.',
        en: 'At first the score was summed over all findings and capped at 100. With 27 real findings that came to 490 raw points. From about seven medium findings on, every state read as critical, and the history showed nothing anymore. Today it is weighted per category, and repeats count once.',
      },
    },
    {
      title: { de: 'Die Prüfung läuft einmal am Tag', en: 'The audit runs once a day' },
      body: {
        de: 'Das Audit lief im Frühjahr als Dauerdienst mit Oberfläche, im ganzen Heimnetz erreichbar. Es braucht aber Sicht auf das Netz und die Prozesse des Rechners und Zugriff auf Docker. Ein Dienst mit diesen Rechten sollte nicht dauernd laufen. Heute ist es ein einmaliger Lauf unter einem Timer. Die Oberfläche gibt es nur noch als manuellen Start, gebunden an den eigenen Rechner.',
        en: 'In spring the audit ran as a permanent service with a web interface, reachable across the home network. It needs visibility into the network and processes of the machine and access to Docker, though. A service with these privileges should not run all the time. Today it is a one-off run under a timer. The interface only exists as a manual start, bound to the machine itself.',
      },
    },
    {
      title: { de: 'Erkennen ohne automatisches Sperren', en: 'Detection without automatic blocking' },
      body: {
        de: 'Das IDS hinter dem Tunnel sperrt nicht selbst. Eine falsch erkannte Absenderadresse hätte sonst den eigenen Tunnel oder einen laufenden Dienst treffen können. Erkennung und Meldung laufen, die Reaktion bleibt eine Entscheidung von Hand.',
        en: 'The IDS behind the tunnel does not block anything by itself. A misidentified sender address could otherwise have hit my own tunnel or a running service. Detection and alerting run, the response stays a manual decision.',
      },
    },
    {
      title: { de: 'Eine Sicherung gilt erst mit Rückspielprobe', en: 'A backup only counts with a restore drill' },
      body: {
        de: 'Im September waren alle Repos täglich gesichert und wöchentlich aufgeräumt, und das Aufräumen schreibt Datenblöcke um. Geprüft waren davon fünf, zurückgeholt worden war aus drei. Seitdem läuft die Probe auf jedem Rechner mit eigenem Timer und meldet ihr Ergebnis an die Überwachung.',
        en: 'In September every repository was backed up daily and pruned weekly, and pruning rewrites data blocks. Five of them had ever been checked, and three had ever had anything restored. Since then the drill runs on every machine with its own timer and reports its result to monitoring.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Prüfer im täglichen Lauf', en: 'Checks in the daily run' },
      value: { de: '10', en: '10' },
    },
    {
      label: { de: 'Tests', en: 'Tests' },
      value: { de: '163 Testfunktionen', en: '163 test functions' },
    },
    {
      label: { de: 'Netz-Zonen', en: 'Network zones' },
      value: { de: 'vier, jeder Beitritt gegen eine Freigabeliste', en: 'four, every join checked against an allow list' },
    },
    {
      label: { de: 'Rückspielprobe', en: 'Restore drill' },
      value: { de: 'wöchentlich je Repo, monatlich ein Dienst', en: 'weekly per repo, monthly one service' },
    },
  ],
  timeline: [
    {
      when: { de: 'Frühjahr 2026', en: 'Spring 2026' },
      what: {
        de: 'Container-Härtung in Wellen, Netz-Zonen, Docker-Zugriff nur über Proxys',
        en: 'Container hardening in waves, network zones, Docker access through proxies only',
      },
    },
    {
      when: { de: 'Juni 2026', en: 'June 2026' },
      what: {
        de: 'Netz-Wächter mit Freigabeliste, IDS am öffentlichen Rand mit Meldung aufs Handy',
        en: 'Network watcher with allow list, IDS at the public edge with alerts to the phone',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Audit mit Firewall-Soll, Dateiprüfsummen und Signaturprüfung; Selbst-Audit repariert Risikowert und Ausnahmen; täglicher Einmal-Lauf statt Dauerdienst',
        en: 'Audit with firewall target state, file checksums and signature scanning; a self-audit fixes the risk score and exceptions; daily one-off run instead of a permanent service',
      },
    },
    {
      when: { de: 'September 2026', en: 'September 2026' },
      what: {
        de: 'Rückspielprobe auf allen Sicherungs-Repos, dazu die monatliche Probe für Dienst-Datenbanken',
        en: 'Restore drill on every backup repository, plus the monthly drill for service databases',
      },
    },
  ],
  limits: [
    {
      de: 'Die Prüfer laufen auf dem Rechner, den sie prüfen. Wer dort Administratorrechte hat, kann sie beeinflussen. Gegen so jemanden helfen sie nur begrenzt.',
      en: 'The checks run on the machine they check. Whoever has administrator rights there can influence them. Against such a person they help only to a limited degree.',
    },
    {
      de: 'Der tägliche Lauf und der Netz-Wächter decken bisher nur den Hauptrechner ab. Auf dem zweiten großen Rechner liegen Werkzeug und Soll-Dateien, aber kein Zeitplan.',
      en: 'The daily run and the network watcher only cover the main machine so far. The second large machine has the tool and the target files, but no schedule.',
    },
    {
      de: 'Das IDS sperrt nicht. Ein laufender Angriff braucht eine Reaktion von Hand.',
      en: 'The IDS does not block. An ongoing attack needs a manual response.',
    },
    {
      de: 'Vor der Schnittstelle für die Handy-Apps steht ein Vorbau mit gegenseitiger TLS-Prüfung, er wird aber nicht erzwungen. Die Apps sprechen über WireGuard noch ohne TLS. Erst wenn das umgestellt ist, kann der Vorbau Pflicht werden, sonst sperren sich die Geräte selbst aus.',
      en: 'The API for the phone apps has a front end with mutual TLS in place, but it is not enforced. The apps still talk over WireGuard without TLS. Only once that is switched can the front end become mandatory, otherwise the devices lock themselves out.',
    },
    {
      de: 'Es gibt keinen externen Penetrationstest und keine Zertifizierung. Dokumentation und Begründung der Schichten stammen allein von mir.',
      en: 'There is no external penetration test and no certification. The documentation and reasoning for the layers come from me alone.',
    },
  ],
};

export default defenseInDepth;
