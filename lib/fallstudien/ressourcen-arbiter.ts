import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-14 (vorher Uebergangsform). Auch das
// Deutsche war ueberholt: es beschrieb den Regler noch auf einem Knoten des
// Heim-Clusters (die Spielserver laufen seit 22.08. host-nativ auf einem
// eigenen Server), nannte drei Abfrageverfahren (es sind vier) und sieben
// Web-Dienste auf Abruf (es sind 17).
//
// Messbefehle (Stand 2026-11-14):
// - Rollen und Bedarf: games.json des Reglers auf dem Spiele-Wirt, 9 Eintraege,
//   Summe ram_mb 23.800 MB; `free -m` dort: 15.998 MB gesamt.
// - Abfrageverfahren: Feld probe.type in derselben Datei: a2s, tcp-conn, rcon,
//   rcon-cli.
// - Fristen: idle_timeout_s 1200 bei allen neun; unused_timeout_s nirgends
//   gesetzt, also DEFAULT_UNUSED_TIMEOUT_S = 900 in arbiter.py.
// - Zweiter Ort: Host-Profil arbiter.json auf dem Heim-Knoten, roles.lab = true,
//   Spiele dort leer.
// - Bruecke: lauscht auf dem Spiele-Wirt, Paketfilter Vorgabe deny, offen nur
//   fuer das Netz der Uebersichtsseite; Tunnel-Unit im Haus aktiv.
// - Web-Dienste: services.json beider Wecker, 13 + 4 = 17, idle_timeout_s 1800
//   (einer 900), Grenzen max_wach / weck_budget / weck_fenster_s / reserve_mb.
// - Halb laufende Dienste: wake-gateway-Commit vom 2026-11-13 (reap_durchlauf).
//
// Weckposten, Updates, Welten und Sicherung stehen in der Fallstudie
// `spielserver` und werden hier nicht wiederholt. Keine Spiel- oder
// Gruppennamen (Grundsatz 5e).
const ressourcenArbiter: Fallstudie = {
  problem: {
    de: 'Neun Spielserver sollen auf einem gemieteten Server mit 16 GB Arbeitsspeicher laufen. Angemeldet brauchen sie zusammen rund 24 GB. Gleichzeitig gebraucht werden sie selten, aber wann welcher gebraucht wird, weiß vorher niemand. Alles dauerhaft laufen zu lassen überbucht den Wirt, und unter Druck entscheidet der Kernel, welcher Prozess stirbt. Alles von Hand zu starten macht mich zum Scheduler, und nachts kann dann niemand spielen. Im Haus gibt es dieselbe Lage kleiner: selten benutzte Web-Oberflächen belegen dauerhaft Speicher, obwohl sie an den meisten Tagen niemand öffnet.',
    en: 'Nine game servers are meant to run on a rented server with 16 GB of memory. Their declared needs add up to roughly 24 GB. They are rarely needed at the same time, but nobody knows in advance which one will be needed when. Running everything permanently overcommits the host, and under pressure the kernel decides which process dies. Starting everything by hand makes me the scheduler, and then nobody can play at night. At home the same situation exists on a smaller scale: rarely used web interfaces hold memory permanently, although on most days nobody opens them.',
  },
  approach: [
    {
      de: 'Ein eigener Regler plant den Speicher des Wirts. Er läuft jede Minute als systemd-Timer und kennt die Rollen als Einträge in einer Registrierdatei: Dienst, Abfrageweg, angemeldeter Bedarf, Speicher-Untergrenze und Leerlauf-Frist je Rolle. Eine neue Rolle ist ein neuer Eintrag, der Regler bleibt unverändert.',
      en: 'A controller of my own schedules the host’s memory. It runs every minute as a systemd timer and knows the roles as entries in a registry file: service, probe method, declared need, memory floor and idle timeout per role. A new role is a new entry, and the controller stays unchanged.',
    },
    {
      de: 'Gefragt wird die echte Auslastung, je Spiel auf dem Weg, der dort die Spielerzahl liefert. Das sind vier Verfahren: die Server-Abfrage des Steam-Protokolls, die Verwaltungs-Konsole des Servers, die Zahl der bestehenden Verbindungen auf dem Spielport und eine Konsole im Container.',
      en: 'It asks for real occupancy, per game through the route that yields the player count there. That makes four methods: the Steam protocol’s server query, the server’s admin console, the number of established connections on the game port, and a console inside the container.',
    },
    {
      de: 'Über jeden Start entscheidet der gemessene freie Speicher gegen die Untergrenze der Rolle. Reicht er, startet sie neben den laufenden. Reicht er nicht, weichen zuerst leere und ungeschützte Rollen, die am längsten ohne Spieler sind. Vorher bekommen sie ihre eigenen Speicher-Befehle auf die Konsole, weil zwei der Server auf das übliche Abbruch-Signal ihren Stand nicht vollständig schreiben.',
      en: 'Every start is decided by measured free memory against the role’s floor. If there is enough, the role starts next to the running ones. If not, empty and unprotected roles give way first, those longest without players first. Before that they get their own save commands on the console, because two of the servers do not fully write their state on the usual termination signal.',
    },
    {
      de: 'Frisch gestartete Rollen zählen drei Minuten lang mit ihrem angemeldeten Bedarf mit. Ihr Speicher ist im gemessenen Wert so früh noch nicht sichtbar, und zwei Starts kurz hintereinander würden sonst denselben Platz zweimal vergeben.',
      en: 'Freshly started roles count with their declared need for three minutes. Their memory is not yet visible in the measured value that early, and two starts in quick succession would otherwise hand out the same room twice.',
    },
    {
      de: 'Abgeschaltet wird in zwei Stufen. Eine Rolle, auf der jemand war und die seit zwanzig Minuten leer ist, geht aus. Eine geweckte Rolle, die nie jemand betreten hat, geht nach fünfzehn Minuten aus.',
      en: 'Shutdown happens in two stages. A role that had someone on it and has been empty for twenty minutes goes off. A role that was woken but never entered goes off after fifteen minutes.',
    },
    {
      de: 'Zwei Schalter wirken in entgegengesetzte Richtung. Eine Reservierung hält eine laufende Rolle oben, auch ohne Spieler, und schützt sie vor dem Verdrängen. Eine Wartungssperre hält eine schlafende Rolle unten, gegen jeden Weckweg. Von außen sieht eine gesperrte Rolle aus wie eine schlafende, deshalb meldet ein Alarm eine Sperre, die länger als sechs Stunden steht.',
      en: 'Two switches work in opposite directions. A reservation keeps a running role up, even without players, and protects it from eviction. A maintenance lock keeps a sleeping role down, against every wake path. From outside a locked role looks like a sleeping one, so an alert reports a lock that has stood for more than six hours.',
    },
    {
      de: 'Dasselbe Programm läuft an zwei Orten. Ein Profil je Wirt sagt, welche Rollen es dort gibt. Auf dem Spiele-Server steuert es die neun Spiele, auf einem Knoten im Haus nur eine Windows-Testumgebung. Die Virtualisierung kennt im Code genau eine Funktion.',
      en: 'The same program runs in two places. A profile per host says which roles exist there. On the game server it drives the nine games, on a node at home only a Windows test environment. Exactly one function in the code knows about virtualization.',
    },
    {
      de: 'Gesteuert wird über eine kleine Brücke mit Token. Auf dem Spiele-Server ist sie von außen gesperrt. Aus dem Haus führt ein SSH-Tunnel hin, mit einem eigenen Schlüssel, der genau diese eine Weiterleitung darf und keine Anmeldung.',
      en: 'Control runs through a small token-protected bridge. On the game server it is closed to the outside. From home an SSH tunnel leads to it, with a dedicated key that may open exactly this one forwarding and no login.',
    },
    {
      de: 'Für die Web-Dienste gibt es einen eigenen Wecker je Rechner. Ein nginx hält stellvertretend die Ports der schlafenden Dienste. Läuft ein Dienst, reicht der Wecker durch. Schläft er, startet ihn der erste Aufruf, und der Besucher sieht eine Warteseite, die sich neu lädt, bis der Dienst antwortet. Nach einer halben Stunde ohne Zugriff geht er wieder schlafen, gemessen an seiner eigenen Zugriffsspur.',
      en: 'For the web services there is a separate waker per machine. An nginx holds the ports of the sleeping services on their behalf. While a service runs, the waker passes traffic through. While it sleeps, the first request starts it, and the visitor sees a waiting page that reloads until the service answers. After half an hour without access it goes back to sleep, measured from its own access trail.',
    },
    {
      de: 'Der Wecker deckelt die Zahl gleichzeitig wacher Dienste. Ein Budget begrenzt die Starts in einem Fenster von zwei Minuten. Nach jedem Start muss ein Speicherboden frei bleiben. Die Liste der Dienste steht in einer Registrierdatei, und die nginx-Konfiguration wird daraus erzeugt.',
      en: 'The waker caps the number of services awake at the same time. A budget limits starts within a two-minute window. After every start a memory floor has to stay free. The list of services lives in a registry file, and the nginx configuration is generated from it.',
    },
  ],
  architecture: {
    summary: {
      de: 'Das Muster läuft in zwei Formen. Die Spielserver plant ein Regler auf ihrem eigenen Wirt: er liest die Rollen aus einer Registrierdatei, fragt die Spielerzahl ab und entscheidet jeden Start am freien Speicher. Angestoßen wird er über eine Brücke, die aus dem Haus nur durch einen Tunnel erreichbar ist. Die Web-Dienste plant ein Wecker je Rechner, der ihre Ports hält und beim ersten Aufruf startet. Keiner der beiden wirft jemanden aus einer laufenden Sitzung.',
      en: 'The pattern runs in two forms. The game servers are scheduled by a controller on their own host: it reads the roles from a registry file, probes the player count and decides every start against free memory. It is triggered through a bridge that can be reached from home only through a tunnel. The web services are scheduled by a waker per machine, which holds their ports and starts them on the first request. Neither of the two throws anybody out of a running session.',
    },
    tiers: [
      {
        label: { de: 'Anstoß', en: 'Trigger' },
        nodes: [
          {
            id: 'spieler',
            label: { de: 'Mitspieler', en: 'Players' },
            note: { de: 'Chat-Befehl · Übersicht', en: 'chat command · overview' },
            kind: 'edge',
          },
          {
            id: 'besucher',
            label: { de: 'Besucher', en: 'Visitors' },
            note: { de: 'Aufruf einer Web-Oberfläche', en: 'request to a web interface' },
            kind: 'edge',
          },
        ],
      },
      {
        label: { de: 'Steuerung', en: 'Control' },
        nodes: [
          {
            id: 'bruecke',
            label: { de: 'Steuer-Brücke', en: 'Control bridge' },
            note: { de: 'Token · nur über Tunnel', en: 'token · tunnel only' },
            kind: 'core',
          },
          {
            id: 'wecker',
            label: { de: 'Wecker', en: 'Waker' },
            note: { de: 'hält die Ports · Warteseite', en: 'holds the ports · waiting page' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Entscheidung', en: 'Decision' },
        nodes: [
          {
            id: 'regler',
            label: { de: 'Regler', en: 'Controller' },
            note: { de: 'Registrierdatei · Auslastung · freier Speicher', en: 'registry · occupancy · free memory' },
            kind: 'core',
          },
          {
            id: 'grenzen',
            label: { de: 'Grenzen', en: 'Limits' },
            note: { de: 'Anzahl · Startbudget · Speicherboden', en: 'count · start budget · memory floor' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Laufzeit', en: 'Runtime' },
        nodes: [
          {
            id: 'spiele',
            label: { de: 'Spielserver', en: 'Game servers' },
            note: { de: 'systemd · Speichern beim Stopp', en: 'systemd · save on stop' },
            kind: 'data',
          },
          {
            id: 'dienste',
            label: { de: 'Web-Dienste', en: 'Web services' },
            note: { de: 'Container auf zwei Rechnern', en: 'containers on two machines' },
            kind: 'data',
          },
        ],
      },
    ],
    flows: [
      { from: 'spieler', to: 'bruecke', label: { de: 'wecken · reservieren', en: 'wake · reserve' } },
      { from: 'bruecke', to: 'regler' },
      { from: 'regler', to: 'spiele', label: { de: 'starten · abschalten, nie erzwungen', en: 'start · switch off, never by force' } },
      { from: 'besucher', to: 'wecker', label: { de: 'erster Aufruf', en: 'first request' } },
      { from: 'wecker', to: 'grenzen', label: { de: 'prüfen', en: 'check' } },
      { from: 'grenzen', to: 'dienste', label: { de: 'starten · schlafen legen', en: 'start · put to sleep' } },
    ],
  },
  result: [
    {
      de: 'Neun Spielserver mit zusammen rund 24 GB angemeldetem Bedarf teilen sich einen Wirt mit 16 GB, ohne ihn zu überbuchen. Mehrere laufen gleichzeitig, solange der gemessene Speicher reicht.',
      en: 'Nine game servers with roughly 24 GB of declared need between them share a 16 GB host without overcommitting it. Several run at once as long as measured memory allows.',
    },
    {
      de: 'Wer spielt, verliert seinen Server nicht. Reicht der Speicher auch nach dem Räumen leerer Rollen nicht, kommt eine Absage im Klartext, bis in den Chat und die Übersicht.',
      en: 'Whoever is playing does not lose their server. If memory is still short after clearing empty roles, a plain refusal comes back, all the way to the chat and the overview.',
    },
    {
      de: 'Der zweite Wirt brauchte keine zweite Fassung des Reglers, nur ein eigenes Profil.',
      en: 'The second host needed no second version of the controller, just its own profile.',
    },
    {
      de: '17 Web-Dienste auf zwei Rechnern schlafen, bis jemand sie aufruft. Darunter sind die Web-Oberflächen der eigenen Haushalts-Apps.',
      en: '17 web services on two machines sleep until someone calls them up. Among them are the web interfaces of my own household apps.',
    },
    {
      de: 'Tunnel-Strecke, Weiterleitungen und die Sonderbehandlung für Dienste, die sich selbst öffentlich anmelden, sind mit dem Umzug der Spielserver ersatzlos entfallen.',
      en: 'The tunnel route, the forwarding rules and the special handling for services that register themselves publicly fell away with the move of the game servers, with nothing put in their place.',
    },
  ],
  decisions: [
    {
      title: { de: 'Wer arbeitet, wird nicht verdrängt', en: 'Whoever is working does not get evicted' },
      body: {
        de: 'Der Regler konnte eine laufende Rolle auf Anweisung räumen. Gedacht war das als Notausgang. Gebraucht hätte man ihn aber nur in der Lage, in der gerade jemand mit der Rolle arbeitet. Der Weg ist ersatzlos gestrichen, und wer ihn noch aufruft, bekommt eine Fehlermeldung statt einer stillen Wirkung. Ist der Speicher knapp, weicht zuerst, was leer und ungeschützt ist. Reicht das nicht, wird die Anfrage begründet abgelehnt.',
        en: 'The controller could clear a running role on command. That was meant as an emergency exit. The only situation in which you would have reached for it, though, is the one in which somebody is working with that role. The path was removed with nothing put in its place, and anyone who still calls it gets an error instead of a silent effect. When memory is tight, what is empty and unprotected gives way first. If that is not enough, the request is turned down with a reason.',
      },
    },
    {
      title: { de: 'Aus einem Platz wurde eine Menge', en: 'One slot became a set' },
      body: {
        de: 'Anfangs gab es genau einen Platz, und jeder Start bedeutete, dass ein anderer gehen musste. Das war einfach zu bauen und zu streng, denn zwei kleine Rollen hätten oft nebeneinander gepasst. Heute führt der Regler je Rolle eigene Uhren und entscheidet über jeden Start am gemessenen freien Speicher gegen den angemeldeten Bedarf.',
        en: 'At first there was exactly one slot, and every start meant somebody else had to go. That was simple to build and too strict, since two small roles would often have fit side by side. Today the controller keeps separate clocks per role and decides every start against measured free memory versus the declared need.',
      },
    },
    {
      title: { de: 'Auslastung messen, nicht schätzen', en: 'Measure occupancy, do not estimate it' },
      body: {
        de: 'Eine Zeitschaltung oder ein Prozess-Merkmal hätte laufende Nutzung abgewürgt oder leere Server ewig am Leben gelassen. Deshalb wird je Spiel der Weg genommen, der die echte Spielerzahl liefert, auch wenn das vier verschiedene Verfahren bedeutet. Erst damit lässt sich eine automatische Abschaltung verantworten.',
        en: 'A timer or a process signal would either have cut off active use or kept empty servers alive forever. So each game is queried the way that yields its true player count, even though that means four different methods. Only then can automatic shutdown be justified.',
      },
    },
    {
      title: { de: 'Geweckt und nie betreten', en: 'Woken and never entered' },
      body: {
        de: 'Die Leerlauf-Uhr startet, wenn der letzte Spieler geht. Ein Server, den jemand weckt und dann nie betritt, hatte nie einen Spieler, und seine Uhr lief deshalb nie an. Er blieb an, bis jemand ihn bemerkte. Eine zweite, kürzere Frist für Rollen ohne jeden Besuch schließt diese Lücke.',
        en: 'The idle clock starts when the last player leaves. A server that someone wakes and then never enters never had a player, so its clock never started. It stayed on until someone noticed. A second, shorter timeout for roles without any visit closes that gap.',
      },
    },
    {
      title: { de: 'Der Wecker braucht einen Speicherboden', en: 'The waker needs a memory floor' },
      body: {
        de: 'Die erste Grenze des Weckers zählte Dienste. Ein Dienst mit eigener Datenbank zählte dort genauso viel wie ein kleines Nachschlagewerk, obwohl er ein Vielfaches braucht. Ohne Speicherprüfung hätte der Wecker auch auf einem vollen Rechner weiter gestartet, ohne Fehlermeldung, und am Ende hätte der Kernel entschieden. Seitdem trägt jeder Dienst seinen Bedarf in der Registrierdatei, und vor jedem Start wird gegen den freien Speicher gerechnet. Der Regler der Spielserver arbeitet mit derselben Idee.',
        en: 'The waker’s first limit counted services. A service with its own database counted the same as a small reference work, although it needs several times as much. Without a memory check the waker would have kept starting on a full machine, without an error, and in the end the kernel would have decided. Since then every service carries its need in the registry file, and every start is calculated against free memory first. The game server controller works on the same idea.',
      },
    },
    {
      title: { de: 'Halb wach gilt als wach', en: 'Half awake counts as awake' },
      body: {
        de: 'Manche Dienste bestehen aus zwei Containern, einer Oberfläche und einer Schnittstelle. Der Wecker legte nur Dienste schlafen, die vollständig liefen. Fehlte einer der beiden, galt der Dienst als schlafend und wurde nie angefasst. So lief eine Oberfläche fünf Tage ohne ihre Schnittstelle weiter. Heute legt er auch halb laufende Dienste schlafen, und ein Test mit Gegenprobe hält das fest.',
        en: 'Some services consist of two containers, an interface and an API. The waker only put services to sleep that were fully running. If one of the two was missing, the service counted as asleep and was never touched. That is how an interface kept running for five days without its API. Today it puts half-running services to sleep as well, and a test with a counter-check pins that down.',
      },
    },
    {
      title: { de: 'Die Überwachung darf nicht wecken', en: 'Monitoring must not wake anything' },
      body: {
        de: 'Als die Web-Dienste schlafen lernten, hätte die bestehende Überwachung sie im Minutentakt wieder geweckt: sie prüft, indem sie den Dienst aufruft, und genau das ist hier das Weck-Signal. Der Ausweg ist ein eigener Prüf-Pfad am Wecker, der immer antwortet und nie startet.',
        en: 'Once the web services learned to sleep, the existing monitoring would have woken them again every minute: it checks by calling the service, and that call is precisely the wake signal. The way out is a dedicated check path on the waker that always answers and never starts anything.',
      },
    },
    {
      title: { de: 'Der Umzug, der die halbe Konstruktion überflüssig machte', en: 'The move that made half the construction unnecessary' },
      body: {
        de: 'Solange die Spielserver auf einem Knoten im Haus standen, diente der aufwendigste Teil des Systems dazu, die Anschluss-Adresse zu verbergen. Dazu gehörten ein Tunnel zu einem Server am Netz-Rand und eine Weiterleitungsregel je Rolle. Bei den Diensten, die sich selbst bei einem öffentlichen Verzeichnis anmelden, lief sogar der gesamte ausgehende Verkehr durch diesen Tunnel. Mit dem Umzug auf einen eigenen Server fiel diese Hälfte weg, weil es dort keine Anschluss-Adresse zu verbergen gibt. Der Regler zog mit und blieb im Code gleich.',
        en: 'While the game servers stood on a node at home, the most elaborate part of the system served to hide the home address. It took a tunnel to an edge server and a forwarding rule per role. For the services that register themselves with a public directory, even all outbound traffic went through that tunnel. With the move to a dedicated server this half fell away, because there is no home address to hide there. The controller moved along and stayed the same in the code.',
      },
    },
    {
      title: { de: 'Eine Verlagerung, die nicht stattfand', en: 'A migration that did not happen' },
      body: {
        de: 'Ein kleiner Dienst sollte auf den x86-Cluster umziehen, um dem kleinen Rechner Speicher zu sparen. Beim Nachmessen zeigte sich, dass er von dort aus drei andere Dienste gar nicht erreicht, weil deren Firewall-Regeln bewusst auf genau einen Rechner zeigen. Der Umzug hätte drei Lockerungen gekostet und 220 Megabyte gebracht. Er wurde verworfen, und der Dienst kam stattdessen unter den Wecker. Das spart denselben Speicher und lässt die Regeln, wie sie sind.',
        en: 'A small service was meant to move onto the x86 cluster to free memory on the small machine. Measuring first showed that from there it cannot reach three other services at all, because their firewall rules deliberately point at exactly one machine. The move would have cost three exceptions and gained 220 megabytes. It was dropped, and the service went under the waker instead. That saves the same memory and leaves the rules as they are.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Spielserver im Regler', en: 'Game servers in the controller' },
      value: { de: 'neun, rund 24 GB Bedarf auf 16 GB', en: 'nine, roughly 24 GB of need on 16 GB' },
    },
    {
      label: { de: 'Web-Dienste auf Abruf', en: 'Web services on demand' },
      value: { de: '17 auf zwei Rechnern', en: '17 on two machines' },
    },
    {
      label: { de: 'Abschaltung bei Leerlauf', en: 'Shutdown when idle' },
      value: { de: 'Spiele nach 20, Web nach 30 Minuten', en: 'games after 20, web after 30 minutes' },
    },
    {
      label: { de: 'Erzwungene Verdrängung', en: 'Forced eviction' },
      value: { de: 'gibt es nicht', en: 'does not exist' },
    },
  ],
  timeline: [
    {
      when: { de: 'Juli 2026', en: 'July 2026' },
      what: {
        de: 'Erste Rolle als eigener Gast auf einem Knoten im Haus, Regler mit fest verdrahteter Verdrängung',
        en: 'First role as its own guest on a node at home, controller with hard-wired eviction',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Registrierdatei, alle Spiele gleichrangig mit Abschaltung nach gemessener Auslastung',
        en: 'Registry file, all games on equal footing with shutdown by measured occupancy',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Web-Dienste starten beim ersten Aufruf, Prüf-Pfad für die Überwachung',
        en: 'Web services start on the first request, check path for monitoring',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Spielserver ziehen auf einen eigenen Server, Tunnel und Weiterleitungen entfallen; mehrere Rollen gleichzeitig, erzwungene Verdrängung gestrichen; Speicherboden im Wecker',
        en: 'Game servers move to a dedicated server, tunnel and forwarding rules fall away; several roles at once, forced eviction removed; memory floor in the waker',
      },
    },
    {
      when: { de: 'Oktober 2026', en: 'October 2026' },
      what: {
        de: 'Die Web-Oberflächen der eigenen Haushalts-Apps kommen unter den Wecker',
        en: 'The web interfaces of my own household apps go under the waker',
      },
    },
    {
      when: { de: 'November 2026', en: 'November 2026' },
      what: {
        de: 'Halb laufende Dienste werden schlafen gelegt, 17 Web-Dienste auf zwei Rechnern',
        en: 'Half-running services are put to sleep, 17 web services on two machines',
      },
    },
  ],
  limits: [
    {
      de: 'Der Regler tauscht Verfügbarkeit gegen Arbeitsspeicher. Ein Kaltstart kostet die Weckzeit, bei der schwersten Rolle mehrere Minuten. Für selten gebrauchte Rollen passt das, für Dienste, die durchgehend verfügbar sein müssen, nicht.',
      en: 'The controller trades availability for memory. A cold start costs the wake time, several minutes for the heaviest role. That fits rarely needed roles; it does not fit services that must stay available at all times.',
    },
    {
      de: 'Ohne erzwungene Verdrängung kann eine Anfrage abgelehnt werden, obwohl Speicher zu räumen wäre, nämlich dann, wenn die belegten Rollen gerade benutzt werden. Wer sicher gehen will, reserviert seine Rolle vorher.',
      en: 'Without forced eviction a request can be turned down even though memory could be freed, namely when the occupied roles are in use. Whoever wants certainty reserves their role in advance.',
    },
    {
      de: 'Er plant genau einen Wirt, nicht einen Pool. Sollen mehrere Rechner Last teilen, ist ein etablierter Scheduler die bessere Wahl.',
      en: 'It schedules exactly one host, not a pool. Once several machines should share load, an established scheduler is the better choice.',
    },
    {
      de: 'Der Wecker hält die Ports der schlafenden Dienste. Diese dürfen ihren Port deshalb nicht selbst belegen. Wer das beim Aufnehmen eines neuen Dienstes übersieht, bekommt beim Wecken einen Konflikt statt eines Starts.',
      en: 'The waker holds the ports of the sleeping services. Those services may therefore not bind their port themselves. Miss that while adding a new one and waking produces a conflict instead of a start.',
    },
    {
      de: 'Der Speicherboden des Weckers sieht den freien Speicher des ganzen Rechners. Belegt dort ein anderer Dienst viel, lehnt der Wecker Starts ab. Den Grund nennt dann nur das Protokoll des Weckers.',
      en: 'The waker’s memory floor sees the free memory of the whole machine. If another service there takes a lot, the waker turns starts down. The reason then only shows in the waker’s log.',
    },
  ],
};

export default ressourcenArbiter;
