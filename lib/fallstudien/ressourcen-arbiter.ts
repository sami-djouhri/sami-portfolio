import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: timeline 7/5
const ressourcenArbiter: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Ein Knoten des Virtualisierungs-Clusters sollte sieben schwere Dienste tragen, dazu ein Windows-Lab, das gelegentlich hochgefahren wird. Der Arbeitsspeicher reicht bei weitem nicht für alle, bei den schwersten für genau eine. Gebraucht werden sie fast nie gleichzeitig, aber wann welche gebraucht wird, weiß vorher niemand. Die naheliegenden Auswege taugen beide nichts: alles dauerhaft laufen lassen sprengt den Knoten und lässt am Ende den Kernel entscheiden, welcher Prozess stirbt; alles von Hand starten und stoppen heißt, dass ich der Scheduler bin und niemand etwas nutzen kann, während ich schlafe. Dazu kam eine zweite Anforderung: die Dienste sollten von außen erreichbar sein, ohne am Heimanschluss einen Port zu öffnen und ohne die Anschluss-Adresse preiszugeben.',
    approach: [
      'Jede schwere Rolle bekommt einen eigenen, unprivilegierten Gast auf dem Knoten und läuft darin als regulärer systemd-Dienst, nicht als handgestarteter Prozess in einer Sitzung.',
      'Ein eigener Regler plant den Knoten. Er kennt die Rollen als Einträge in einer Registrierdatei und nicht als Sonderfälle im Code. Eine neue Rolle braucht damit einen neuen Eintrag, der Regler bleibt unberührt.',
      'Der Regler rät nicht, ob eine Rolle gebraucht wird, er fragt sie nach ihrer echten Auslastung: je nach Dienst über die Server-Abfrage des Spiele-Netzwerks, über die Verwaltungs-Konsole des Dienstes oder über die Zahl der bestehenden Verbindungen auf dem Dienst-Port. Wer keine Nutzer hat, wird nach zwanzig Minuten abgeschaltet.',
      'Fordert jemand eine Rolle an, prüft der Regler den gemessenen freien Arbeitsspeicher gegen eine je Rolle hinterlegte Untergrenze. Reicht er, startet die Rolle und keine andere muss weichen. Reicht er nicht, weicht zuerst, was leer und ungeschützt ist, und wird vorher sauber heruntergefahren.',
      'Dienste, die auf ein Abbruch-Signal nicht sauber reagieren und ihren Zustand verlieren würden, bekommen beim Herunterfahren ihre eigenen Speicher- und Beende-Befehle auf die Server-Konsole geschickt. Das Standard-Signal allein würde bei ihnen den letzten Spielstand kosten.',
      'Solange die schweren Rollen zu Hause standen, lief der öffentliche Zugang ausschließlich über einen VPN-Tunnel zu einem eigenen Server am Netz-Rand: kein offener Port am Heimrouter, und für Dienste, die sich selbst bei einem öffentlichen Verzeichnis anmelden, lief sogar der gesamte ausgehende Verkehr durch diesen Tunnel, damit dort nicht die Anschluss-Adresse erscheint. Mit dem Umzug auf einen eigenen Server ist diese ganze Schicht ersatzlos entfallen.',
      'Der Regler selbst zog mit: dasselbe Programm läuft heute an zwei Orten und liest an jedem ein eigenes Profil, das sagt, welche Rollen es dort überhaupt gibt. Am einen Ort steuert er die umgezogenen Dienste, am anderen nur noch ein Windows-Lab. Zwei Wirte, ein Regler, kein zweiter Zweig im Code.',
      'Jeder Gast bekommt eine eigene Firewall-Regel: die Dienst-Ports nur aus dem Tunnel und vom Knoten, die Verwaltungs-Zugänge ausschließlich aus dem eigenen Netz.',
      'Gesteuert wird über eine kleine, token-geschützte Brücke im eigenen Netz: aus einem Chat-Befehl heraus oder über eine Weboberfläche, die zwischen Wecken und Verdrängen nach Rolle unterscheidet.',
      'Die Zustands-Daten der Rollen liegen im Dateisystem der Gäste und wurden von der dateibasierten Sicherung nicht erfasst. Ein Schritt vor jeder Sicherung zieht sie heraus, danach gehen sie verschlüsselt an einen entfernten Ort.',
      'Dasselbe Prinzip trägt inzwischen auch die gewöhnlichen Web-Dienste. Ein kleiner Wecker hält stellvertretend den Port eines schlafenden Dienstes: läuft er, reicht der Wecker durch; schläft er, startet der erste Aufruf ihn und der Besucher sieht eine Warteseite, die sich selbst neu lädt, bis der Dienst antwortet. Nach einer halben Stunde ohne Zugriff geht der Dienst wieder schlafen, gemessen an seiner eigenen Zugriffsspur.',
      'Auch hier steht die Rollen-Liste in einer Registrierdatei, und die Konfiguration des Weckers wird daraus erzeugt. Zwei Wahrheiten über dieselbe Sache wären der sichere Weg in den Drift.',
    ],
    architecture: {
      summary: 'Zugriffe von außen erreichen die Rollen direkt auf ihrem Wirt; der frühere Umweg über einen Tunnel entfiel mit dem Umzug. Ein Regler plant den Speicher des Wirts: er liest die Rollen aus einer Registrierdatei, fragt echte Auslastung ab und entscheidet über jeden Start am gemessenen freien Speicher. Belegte Rollen werden nie erzwungen geräumt, im Zweifel wird die Anfrage abgelehnt. Gesteuert wird über eine token-geschützte Brücke im eigenen Netz, und die Zustands-Daten gehen über einen Vor-Sicherungs-Schritt verschlüsselt an einen entfernten Ort.',
      tiers: [
        {
          label: 'Öffentlich',
          nodes: [
            {
              id: 'user',
              label: 'Zugriff von außen',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Steuerung',
          nodes: [
            {
              id: 'ui',
              label: 'Chat-Befehl · Weboberfläche',
              note: 'wecken · reservieren',
              kind: 'edge',
            },
            {
              id: 'bridge',
              label: 'Steuer-Brücke',
              note: 'nur eigenes Netz · Token',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Wirt',
          nodes: [
            {
              id: 'arbiter',
              label: 'Regler',
              note: 'Registrierdatei · Auslastung · freier Speicher',
              kind: 'core',
            },
            {
              id: 'guests',
              label: 'Rollen',
              note: 'systemd · sauberes Speichern beim Stopp',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            {
              id: 'state',
              label: 'Zustands-Daten',
              kind: 'data',
            },
            {
              id: 'offsite',
              label: 'Verschlüsselt off-site',
              note: 'über Vor-Sicherungs-Schritt',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'user',
          to: 'guests',
          label: 'direkt, ohne Umweg',
        },
        {
          from: 'ui',
          to: 'bridge',
        },
        {
          from: 'bridge',
          to: 'arbiter',
          label: 'wecken · reservieren',
        },
        {
          from: 'arbiter',
          to: 'guests',
          label: 'starten · abschalten, nie erzwungen',
        },
        {
          from: 'guests',
          to: 'state',
        },
        {
          from: 'state',
          to: 'offsite',
        },
      ],
    },
    result: [
      'Mehrere schwere Rollen teilen sich einen Knoten, ohne ihn je zu überbuchen. Über jeden Start entscheidet der gemessene freie Speicher gegen den angemeldeten Bedarf der Rolle und kein fest vergebener Platz. Reicht der Speicher, muss keine andere Rolle weichen.',
      'Wer eine Rolle gerade benutzt, verliert sie nicht. Ist es zu eng, weicht zuerst, was leer und ungeschützt ist; reicht auch das nicht, kommt eine Absage im Klartext statt eines Rauswurfs.',
      'Abgeschaltet wird nach gemessener Auslastung. Jede Rolle wird auf dem Weg abgefragt, der bei ihr tatsächlich die Nutzerzahl liefert.',
      'Eine neue Rolle aufzunehmen ist ein Eintrag in einer Registrierdatei, keine Code-Änderung am Regler. Auch der zweite Wirt, der später dazukam, brauchte keine zweite Fassung des Reglers, nur ein eigenes Profil.',
      'Rollen, die ihren Zustand bei einem einfachen Abbruch verlieren würden, speichern beim Herunterfahren nachweislich sauber.',
      'Die Zustands-Daten liegen verschlüsselt an einem entfernten Ort, obwohl sie in Gast-Dateisystemen liegen, die die normale Dateisicherung nicht sieht.',
      'Die halbe Konstruktion ist inzwischen ersatzlos verschwunden: Tunnel, Weiterleitungsregeln und die Sonderbehandlung für Dienste, die sich selbst öffentlich anmelden, waren nur nötig, solange die Rollen zu Hause standen.',
      'Auf zwei weiteren Rechnern schlafen sieben selten benutzte Web-Dienste, bis jemand sie aufruft. Das gibt gut ein Gigabyte Arbeitsspeicher zurück, ohne dass ein Besucher etwas anderes merkt als eine kurze Wartezeit beim ersten Aufruf.',
    ],
    decisions: [
      {
        title: 'Lieber verdrängen als überbuchen',
        body: 'Alles gleichzeitig laufen zu lassen hätte bedeutet, dass der Kernel unter Druck entscheidet, welcher Prozess stirbt, ohne Rücksicht darauf, ob gerade jemand damit arbeitet. Der Regler verdrängt stattdessen selbst und fährt den Vorgänger vorher sauber herunter, inklusive Speicherstand.',
      },
      {
        title: 'Wer arbeitet, wird nicht verdrängt',
        body: 'Der Regler konnte eine laufende Rolle auf Anweisung räumen. Gedacht war das als Notausgang, und es war genau falsch herum: die einzige Lage, in der man ihn gebraucht hätte, ist die, in der gerade jemand mit der Rolle arbeitet. Der Weg wurde ersatzlos gestrichen, und wer ihn heute noch aufruft, bekommt eine laute Absage statt einer stillen Wirkung. Ist der Speicher knapp, weicht zuerst, was leer und ungeschützt ist. Reicht das nicht, wird die Anfrage abgelehnt und begründet.',
      },
      {
        title: 'Aus einem Platz wurde eine Menge',
        body: 'Anfangs gab es genau einen Platz, und jeder Start bedeutete, dass ein anderer gehen musste. Das war einfach zu bauen und zu streng: zwei kleine Rollen hätten oft nebeneinander gepasst. Heute führt der Regler je Rolle eigene Uhren und entscheidet über jeden Start am gemessenen freien Speicher gegen den angemeldeten Bedarf. Frisch gestartete Rollen zählen eine Weile mit ihrem angemeldeten Wert mit, weil ihr Speicher im gemessenen Wert noch gar nicht sichtbar ist.',
      },
      {
        title: 'Auslastung messen, nicht schätzen',
        body: 'Eine Zeitschaltung oder ein Prozess-Merkmal hätte laufende Nutzung abgewürgt oder leere Dienste ewig am Leben gelassen. Deshalb wird je Dienst der Weg genommen, der die echte Nutzerzahl liefert, auch wenn das drei verschiedene Verfahren bedeutet. Nur so ist eine automatische Abschaltung überhaupt verantwortbar.',
      },
      {
        title: 'Rollen als Daten, nicht als Code',
        body: 'Die erste Fassung kannte genau einen Dienst und hatte ihn fest verdrahtet. Sobald der zweite dazukam, wurde daraus eine Registrierdatei: Zugangsdaten, Abfrage-Verfahren, Speicher-Untergrenze und Leerlauf-Frist je Eintrag. Seitdem ist jede weitere Rolle reine Konfiguration, und der Regler bleibt beim Wachsen gleich groß.',
      },
      {
        title: 'Kein Port am Heimanschluss',
        body: 'Eine Portfreigabe am Heimrouter hätte den Anschluss dauerhaft sichtbar gemacht und jede Rolle direkt exponiert. Der Umweg über einen eigenen Server am Netz-Rand kostet eine Tunnel-Strecke, hält die Anschluss-Adresse aber vollständig aus dem Spiel und lässt die Freigabe an einer Stelle verwalten, nicht an sieben.',
      },
      {
        title: 'Dem Standard-Abbruch nicht blind vertrauen',
        body: 'Zwei der Dienste beenden sich auf das übliche Abbruch-Signal, ohne ihren Zustand vollständig zu schreiben, was beim Verdrängen still Fortschritt gekostet hätte. Sie bekommen deshalb beim Herunterfahren ihre eigenen Speicher-Befehle auf die Konsole geschickt, und dass das greift, ist in den Server-Protokollen nachgeprüft.',
      },
      {
        title: 'Die Überwachung darf nicht wecken',
        body: 'Als die Web-Dienste schlafen lernten, hätte die bestehende Überwachung sie im Minutentakt wieder aufgeweckt: sie prüft, indem sie den Dienst aufruft, und genau das ist hier das Weck-Signal. Der Ausweg ist ein eigener Prüf-Pfad am Wecker, der immer antwortet und nie startet. Wer eine Verfügbarkeits-Prüfung auf ein bedarfsgesteuertes System legt, muss vorher wissen, was sein Messen selbst auslöst.',
      },
      {
        title: 'Der Umzug, der die halbe Konstruktion überflüssig machte',
        body: 'Der aufwendigste Teil dieses Systems diente der Tarnung der Anschluss-Adresse. Dazu gehörten ein Tunnel zu einem Server am Netz-Rand und eine Weiterleitungsregel je Rolle. Bei den Diensten, die sich selbst bei einem öffentlichen Verzeichnis anmelden, lief sogar der gesamte ausgehende Verkehr durch diesen Tunnel. Als die schweren Rollen auf einen eigenen Server umzogen, fiel diese Hälfte ersatzlos weg: dort gibt es keine Anschluss-Adresse zu verbergen. Je Rolle entfielen ein Tunnel-Ende, eine Weiterleitungsregel und eine Sonderbehandlung. Der Regler blieb, seine eigentliche Aufgabe ist davon unberührt. Der Aufwand hing also am Standort und nicht an der Sache.',
      },
      {
        title: 'Eine Verlagerung, die nicht stattfand',
        body: 'Ein kleiner Dienst sollte auf den x86-Cluster umziehen, um dem kleinen Rechner Speicher zu sparen. Beim Nachmessen zeigte sich, dass er von dort aus drei andere Dienste gar nicht erreicht, weil deren Firewall-Regeln bewusst auf genau einen Rechner zeigen. Der Umzug hätte drei Lockerungen gekostet und 220 Megabyte gebracht. Er wurde verworfen und der Dienst stattdessen bedarfsgesteuert, was denselben Speicher spart, ohne eine Grenze aufzuweichen.',
      },
    ],
    metrics: [
      {
        label: 'Schwere Rollen im Regler',
        value: 'neun, dazu ein Windows-Lab',
      },
      {
        label: 'Gleichzeitig aktiv',
        value: 'so viele, wie der Speicher trägt',
      },
      {
        label: 'Abschaltung bei Leerlauf',
        value: 'nach zwanzig Minuten',
      },
      {
        label: 'Erzwungene Verdrängung',
        value: 'gibt es nicht',
      },
    ],
    timeline: [
      {
        when: '2026 H2',
        what: 'Erste Rolle als eigener Gast mit systemd-Dienst, Regler mit fest verdrahteter Verdrängung',
      },
      {
        when: '2026 H2',
        what: 'Registrierdatei eingeführt: weitere Rollen sind ein Eintrag, keine Code-Änderung',
      },
      {
        when: '2026 H2',
        what: 'Öffentlicher Zugang über den Server am Netz-Rand, Anschluss-Adresse auch bei selbst-anmeldenden Diensten verborgen',
      },
      {
        when: '2026 H2',
        what: 'Sauberes Speichern beim Verdrängen, Abschaltung nach echter Auslastung, Zustands-Daten off-site',
      },
      {
        when: '2026 H2',
        what: 'Prinzip auf gewöhnliche Web-Dienste übertragen: sieben Anwendungen auf zwei weiteren Rechnern starten beim Aufruf',
      },
      {
        when: '2026 H2',
        what: 'Aus einem Platz wird eine Menge: mehrere Rollen laufen nebeneinander, solange der gemessene Speicher sie trägt',
      },
      {
        when: '2026 H2',
        what: 'Erzwungene Verdrängung ersatzlos gestrichen; die schweren Rollen ziehen auf einen eigenen Server, Tunnel und Weiterleitungen entfallen mit ihnen',
      },
    ],
    limits: [
      'Der Regler tauscht Verfügbarkeit gegen Arbeitsspeicher: ein Kaltstart kostet die Wecken-Zeit, bei der schwersten Rolle mehrere Minuten. Für selten gebrauchte Rollen ist das richtig, für Dienste, die durchgehend verfügbar sein müssen, wäre es das nicht.',
      'Ohne erzwungene Verdrängung kann eine Anfrage abgelehnt werden, obwohl theoretisch Speicher zu räumen wäre, nämlich dann, wenn die belegten Rollen gerade benutzt werden. Das ist die gewollte Seite des Tauschs. Wer sicher gehen will, reserviert seine Rolle vorher.',
      'Er plant genau einen Knoten, nicht einen Pool. Sobald mehrere Knoten Last teilen sollen, ist das die Grenze eines selbstgebauten Reglers und der Punkt, an dem ein etablierter Scheduler die bessere Wahl wird.',
      'Bei den bedarfsgesteuerten Web-Diensten hält der Wecker den Port stellvertretend. Umgekehrt heißt das, dass diese Dienste ihren Port nicht mehr selbst belegen dürfen. Wer das beim Aufnehmen eines neuen Dienstes übersieht, bekommt beim Wecken einen Konflikt statt eines Starts.',
    ],
  },
  enAlt: {
    problem: 'One node of the virtualization cluster was meant to carry seven heavy services, plus a Windows lab that gets brought up occasionally. There is only enough memory for one of those roles. They are almost never needed at the same time, but nobody knows in advance which one will be needed when. Both obvious answers are bad: running everything permanently blows the node and ultimately lets the kernel pick which process dies; starting and stopping everything by hand makes me the scheduler, and nothing is usable while I sleep. On top of that came a second requirement: the services had to be reachable from outside without opening a port on the home connection and without exposing its address.',
    approach: [
      'Every heavy role gets its own unprivileged guest on the node and runs there as a regular systemd service, not as a hand-started process in a session.',
      'A controller of my own schedules the node: it knows the roles as entries in a registry file. Adding a role means writing an entry, and the controller stays untouched.',
      'The controller does not guess whether a role is in use, it asks for real occupancy: depending on the service, through the game network’s server query, through the service’s own admin console, or through the number of established connections on its port. Whatever has no users is switched off after twenty minutes.',
      'When someone requests a role, the controller checks measured free memory against a per-role floor. If there is room, the role starts and nobody has to leave. If there is not, what is empty and unprotected gives way first, shut down cleanly beforehand.',
      'Services that do not react cleanly to a termination signal, and would lose their state, get their own save and quit commands sent to the server console on shutdown. The default path cannot be trusted here.',
      'While the heavy roles still sat at home, public access ran solely through a VPN tunnel to my own edge server: no open port on the home router, and for services that register themselves with a public directory, even all outbound traffic went through that tunnel so the home address would not show up there. With the move to a dedicated server, that entire layer fell away with nothing put in its place.',
      'The controller moved along: the same program now runs in two places and reads a profile at each one that says which roles exist there at all. In one place it drives the relocated services, in the other only a Windows lab. Two hosts, one controller, no second branch in the code.',
      'Every guest gets its own firewall rules: service ports only from the tunnel and the node, admin access only from my own network.',
      'Control runs through a small token-protected bridge inside my own network: from a chat command or a web interface that distinguishes waking a role from evicting one by role.',
      'The roles’ state data lives inside the guests’ filesystems and was not captured by the file-level backup. A step ahead of every backup run extracts it, after which it goes encrypted to a remote location.',
      'The same principle now carries the ordinary web services too. A small waker holds the port on behalf of a sleeping service: while it runs, the waker passes traffic through; while it sleeps, the first request starts it and the visitor gets a waiting page that reloads itself until the service answers. After half an hour without access the service goes back to sleep, measured from its own access trail.',
      'Here too the list of services lives in a registry file, and the waker configuration is generated from it. Two truths about the same thing would be a reliable path into drift.',
    ],
    architecture: {
      summary: 'Requests from outside reach the roles directly on their host; the former detour through a tunnel fell away with the move. A controller schedules the host’s memory: it reads the roles from a registry file, probes real occupancy, and decides every start against measured free memory. Occupied roles are never evicted by force, and in case of doubt the request is turned down. Control runs through a token-protected bridge inside my own network, and state data goes through a pre-backup step to an encrypted remote location.',
      tiers: [
        {
          label: 'Public',
          nodes: [
            {
              id: 'user',
              label: 'Access from outside',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Control',
          nodes: [
            {
              id: 'ui',
              label: 'Chat command · web interface',
              note: 'wake · reserve',
              kind: 'edge',
            },
            {
              id: 'bridge',
              label: 'Control bridge',
              note: 'own network only · token',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Host',
          nodes: [
            {
              id: 'arbiter',
              label: 'Controller',
              note: 'registry · occupancy · free memory',
              kind: 'core',
            },
            {
              id: 'guests',
              label: 'Roles',
              note: 'systemd · clean save on stop',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Data',
          nodes: [
            {
              id: 'state',
              label: 'State data',
              kind: 'data',
            },
            {
              id: 'offsite',
              label: 'Encrypted off-site',
              note: 'via pre-backup step',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'user',
          to: 'guests',
          label: 'direct, no detour',
        },
        {
          from: 'ui',
          to: 'bridge',
        },
        {
          from: 'bridge',
          to: 'arbiter',
          label: 'wake · reserve',
        },
        {
          from: 'arbiter',
          to: 'guests',
          label: 'start · switch off, never by force',
        },
        {
          from: 'guests',
          to: 'state',
        },
        {
          from: 'state',
          to: 'offsite',
        },
      ],
    },
    result: [
      'Several heavy roles share a host without ever overcommitting it. Every start is decided against measured free memory versus the role’s declared need, not against a fixed slot. If there is room, nobody has to leave.',
      'Whoever is using a role does not lose it. When memory runs short, what is empty and unprotected gives way first; if that is not enough, the answer is a plain refusal rather than an eviction.',
      'Shutdown follows measured occupancy: each role is queried the way that actually yields its user count.',
      'Adding a role is an entry in a registry file, not a code change to the controller. Even the second host that arrived later needed no second version of the controller, just its own profile.',
      'Roles that would lose their state on a plain termination now demonstrably save cleanly on shutdown.',
      'The state data sits encrypted at a remote location, even though it lives in guest filesystems that the ordinary file backup does not see.',
      'Half the construction has since vanished with nothing put in its place: tunnel, forwarding rules and the special handling for services that register themselves publicly were only ever needed while the roles sat at home.',
      'On two further machines, seven rarely used web services now sleep until somebody calls them up. That hands back a good gigabyte of memory, and a visitor notices nothing beyond a short wait on the first request.',
    ],
    decisions: [
      {
        title: 'Better to evict than to overcommit',
        body: 'Running everything at once would have meant the kernel decides under pressure which process dies, with no regard for whether someone is in the middle of using it. A controller that evicts deliberately and shuts down cleanly first trades an uncontrolled risk for a controlled decision.',
      },
      {
        title: 'Whoever is working does not get evicted',
        body: 'The controller could clear a running role on command. That was meant as an emergency exit, and it was exactly backwards: the one situation where you would reach for it is the one where somebody is in the middle of using that role. The path was removed with nothing put in its place, and anyone who still calls it gets a loud refusal instead of a silent effect. When memory is tight, what is empty and unprotected gives way first, and if that is not enough the request is turned down with a reason. A refusal you can understand beats an eviction nobody saw coming.',
      },
      {
        title: 'One slot became a set',
        body: 'At first there was exactly one slot, and every start meant somebody else had to go. That was simple to build and too strict: two small roles would often have fit side by side. Today the controller keeps separate clocks per role and decides every start against measured free memory versus the declared need. Freshly started roles count with their declared figure for a while, because their memory is not yet visible in the measured value.',
      },
      {
        title: 'Measure occupancy, do not estimate it',
        body: 'A timer or a process signal would either have cut off active use or kept empty services alive forever. So each service is queried the way that yields its true user count, even though that means three different techniques. Only then is automatic shutdown defensible at all.',
      },
      {
        title: 'Roles as data, not as code',
        body: 'The first version knew exactly one service and had it hard-wired. As soon as the second arrived, that became a registry file: credentials, probe method, memory floor and idle timeout per entry. Since then every further role is pure configuration, and the controller stays the same size as the fleet grows.',
      },
      {
        title: 'No port on the home connection',
        body: 'A port forward on the home router would have made the connection permanently visible and exposed every role directly. Routing through my own edge server costs a tunnel hop, but keeps the home address entirely out of play and puts the exposure in one place, not seven.',
      },
      {
        title: 'Do not trust the default shutdown blindly',
        body: 'Two of the services exit on the usual termination signal without fully writing their state, which would have quietly cost progress on every eviction. They therefore get their own save commands sent to the console on shutdown, and that this takes effect is verified in the server logs.',
      },
      {
        title: 'Monitoring must not wake anything',
        body: 'Once the web services learned to sleep, the existing monitoring would have woken them again every minute: it checks by calling the service, and that call is precisely the wake signal. The way out is a dedicated check path on the waker that always answers and never starts anything. Anyone putting an availability check on a demand-driven system needs to know in advance what their own measurement sets off.',
      },
      {
        title: 'The move that made half the construction pointless',
        body: 'The most elaborate part of this system never served scheduling, it served concealment: a tunnel to an edge server, a forwarding rule per role, and for the services that register themselves with a public directory, even all outbound traffic went through that tunnel so the home address would not appear there. When the heavy roles moved to a dedicated server, that half fell away with nothing put in its place, not because of a better solution but because there was nothing left to hide: the server stands publicly itself. Per role, a tunnel endpoint, a forwarding rule and a special case disappeared. The controller stayed, because its actual job is untouched by any of it. In hindsight the tunnel was not a solution but the price of a location that did not fit, and you only recognise the price once you stop paying it.',
      },
      {
        title: 'A migration that did not happen',
        body: 'A small service was meant to move onto the x86 cluster to free memory on the small machine. Measuring first showed that from there it cannot reach three other services at all, because their firewall rules deliberately point at exactly one machine. The move would have cost three exceptions and gained 220 megabytes. It was dropped, and the service became demand-driven instead, which saves the same memory without softening a boundary.',
      },
    ],
    metrics: [
      {
        label: 'Heavy roles in the controller',
        value: 'nine, plus a Windows lab',
      },
      {
        label: 'Active at a time',
        value: 'as many as memory carries',
      },
      {
        label: 'Shutdown when idle',
        value: 'after twenty minutes',
      },
      {
        label: 'Forced eviction',
        value: 'does not exist',
      },
    ],
    timeline: [
      {
        when: '2026 H2',
        what: 'First role as its own guest with a systemd service, controller with hard-wired eviction',
      },
      {
        when: '2026 H2',
        what: 'Registry file introduced: further roles are an entry, not a code change',
      },
      {
        when: '2026 H2',
        what: 'Public access via the edge server, home address hidden even for self-registering services',
      },
      {
        when: '2026 H2',
        what: 'Clean saving on eviction, shutdown by real occupancy, state data off-site',
      },
      {
        when: '2026 H2',
        what: 'Principle carried over to ordinary web services: seven applications on two further machines start on request',
      },
    ],
    limits: [
      'The controller trades availability for memory: a cold start costs the wake time, several minutes for the heaviest role. That is right for rarely needed roles; it would be wrong for services that must stay continuously available.',
      'Without forced eviction a request can be turned down even though memory could in theory be freed, namely when the occupied roles are in use. That is the intended side of the trade. Whoever wants certainty reserves their role in advance rather than hoping for good timing.',
      'It schedules exactly one node, not a pool. Once several nodes should share load, that is the limit of a controller of this kind and the point where an established scheduler becomes the better choice.',
      'For the demand-driven web services the waker holds the port on their behalf. The flip side is that those services may no longer bind that port themselves. Miss it while onboarding a new one and waking produces a conflict instead of a start.',
    ],
  },
};

export default ressourcenArbiter;
