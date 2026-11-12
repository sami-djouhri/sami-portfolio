import type { Fallstudie } from './typ';

const opsCockpit: Fallstudie = {
  problem: {
    de: 'Eine wachsende Flotte aus mehreren Hosts steuert man irgendwann nicht mehr per SSH und Dashboard-Hopping. Wer wissen will, was gerade läuft, müsste sich auf jeden Host einzeln einloggen, Auslastung und Temperatur einzeln ablesen, Container einzeln neu starten. Genau dieser Reflex, für Bequemlichkeit eine Host-Shell freizugeben, ist auch das größte Sicherheitsrisiko. Ich wollte eine zentrale Betreiber-Sicht über die ganze Flotte, bei der Härtung konsequent vor Komfort steht.',
    en: 'A growing fleet of several hosts eventually outgrows SSH and dashboard-hopping. To know what is running right now, you would log into each host, read off load and temperature one by one, restart containers one by one. And that very reflex, opening a host shell for convenience, is the biggest security risk of all. I wanted a central operator view over the whole fleet, one where hardening consistently comes before comfort.',
  },
  approach: [
    {
      de: 'Eine Fläche im internen Portal als Kontrollebene über die Flotte: Live-Metriken aller Hosts via Prometheus (Auslastung, Temperatur, Speicher, Platte), Service-Steuerung und Container-Logs an einer Stelle.',
      en: 'An area of the internal portal as a control plane over the fleet: live metrics for every host via Prometheus (load, temperature, memory, disk), service control and container logs in one place.',
    },
    {
      de: 'Zugriff auf jeden Host nie direkt, sondern über einen gehärteten Docker-Socket-Proxy mit minimalen Rechten und abgeschaltetem Container-Exec, sodass aus der Steuerung kein Einstiegspunkt wird.',
      en: 'Access to a host is never direct, always through a hardened Docker socket proxy with minimal rights and container exec disabled, so the control never becomes an entry point.',
    },
    {
      de: 'Den Zugriff auf genau eine Steuerebene firewall-sperren, auf der Kette, die veröffentlichte Container-Ports tatsächlich greift, und die Sperre setzen, bevor die Zwischenschicht überhaupt erreichbar ist.',
      en: 'Firewall-lock access down to exactly one control plane, on the chain that actually catches published container ports, and set the lock before the intermediary layer is even reachable.',
    },
    {
      de: 'Die Sperre als systemd-verankerten Dienst an den Container-Stack koppeln, damit sie Reboot und Neustart übersteht und nach dem Hochfahren kein Expositionsfenster aufgeht.',
      en: 'Anchor the lock as a systemd-backed service coupled to the container stack, so it survives reboot and restart and no exposure window opens after a boot.',
    },
    {
      de: 'Abweichungen zwischen erwartetem und tatsächlichem Service-Zustand erkennen, ohne die Dienste als Alarm zu werten, die ich selbst stillgelegt habe.',
      en: 'Detect drift between expected and actual service state, but deliberately treat intentionally retired services as expected and raise no alarm for them.',
    },
  ],
  architecture: {
    summary: {
      de: 'Der Browser spricht nur mit der eigenen Oberfläche, die serverseitig Metriken und Service-Status zusammenträgt; jeder Zugriff auf einen Host läuft über eine gehärtete Zwischenschicht ohne Container-Exec, die auf genau eine Steuerebene firewall-gesperrt und reboot-fest verankert ist, während eine Metrik-Quelle pro Host die Live-Werte liefert und eine Service-Map als Soll-Zustand den Drift-Abgleich speist.',
      en: 'The browser talks only to the dedicated interface, which aggregates metrics and service status server-side; every access to a host runs through a hardened intermediary layer without container exec, firewall-locked to exactly one control plane and reboot-proof anchored, while a metric source per host feeds the live values and a service map supplies the target state for the drift comparison.',
    },
    tiers: [
      {
        label: { de: 'Browser', en: 'Browser' },
        nodes: [
          {
            id: 'ui',
            kind: 'edge',
            label: { de: 'Kontroll-Oberfläche', en: 'Control interface' },
            note: { de: 'Portal-Fläche · Metriken · Logs', en: 'portal area · metrics · logs' },
          },
        ],
      },
      {
        label: { de: 'Steuerebene', en: 'Control plane' },
        nodes: [
          {
            id: 'control',
            kind: 'core',
            label: { de: 'Steuer-Backend', en: 'Control backend' },
            note: { de: 'serverseitiger Zugriff', en: 'server-side access' },
          },
          {
            id: 'drift',
            kind: 'core',
            label: { de: 'Drift-Abgleich', en: 'Drift comparison' },
            note: { de: 'Soll gegen Ist', en: 'target vs. actual' },
          },
        ],
      },
      {
        label: { de: 'Gehärteter Zugriff', en: 'Hardened access' },
        nodes: [
          {
            id: 'proxy',
            kind: 'core',
            label: { de: 'Socket-Zwischenschicht', en: 'Socket intermediary' },
            note: { de: 'Docker-Socket-Proxy · kein Exec', en: 'Docker socket proxy · no exec' },
          },
          {
            id: 'fw',
            kind: 'core',
            label: { de: 'Firewall-Lockdown', en: 'Firewall lockdown' },
            note: { de: 'eine Quelle, reboot-fest', en: 'one source, reboot-proof' },
          },
        ],
      },
      {
        label: { de: 'Pro Host', en: 'Per host' },
        nodes: [
          {
            id: 'metrics',
            kind: 'data',
            label: { de: 'Metrik-Quelle', en: 'Metric source' },
            note: { de: 'Prometheus · Auslastung · Temp', en: 'Prometheus · load · temp' },
          },
          {
            id: 'services',
            kind: 'consumer',
            label: { de: 'Container-Dienste', en: 'Container services' },
          },
          {
            id: 'map',
            kind: 'data',
            label: { de: 'Service-Map', en: 'Service map' },
            note: { de: 'erwarteter Zustand', en: 'expected state' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'ui',
        to: 'control',
        label: { de: 'nur eigene Oberfläche', en: 'only own interface' },
      },
      {
        from: 'control',
        to: 'proxy',
        label: { de: 'hinter Lockdown', en: 'behind lockdown' },
      },
      {
        from: 'fw',
        to: 'proxy',
        label: { de: 'eine Quelle erlaubt', en: 'one source allowed' },
      },
      {
        from: 'proxy',
        to: 'services',
        label: { de: 'Steuerung ohne Exec', en: 'control without exec' },
      },
      {
        from: 'metrics',
        to: 'control',
        label: { de: 'Live-Werte', en: 'live values' },
      },
      {
        from: 'map',
        to: 'drift',
        label: { de: 'Soll-Abgleich', en: 'target comparison' },
      },
    ],
  },
  result: [
    {
      de: 'Eine zentrale Betreiber-Sicht über die ganze Flotte: Live-Metriken, Service-Steuerung und Container-Logs aller Hosts an einer Stelle, ohne Einzel-Login.',
      en: 'A central operator view over the whole fleet: live metrics, service control and container logs for every host in one place, no per-host login.',
    },
    {
      de: 'Remote-Steuerung ausschließlich über die gehärtete Zwischenschicht: Exec abgeschaltet, Zugriff firewall-gesperrt auf eine Steuerebene, Fremdzugriff blockiert.',
      en: 'Remote control exclusively through the hardened intermediary layer: exec disabled, access firewall-locked to one control plane, foreign access blocked.',
    },
    {
      de: 'Der Lockdown übersteht Reboot und Neustart, weil er an den Container-Stack gekoppelt ist und schon vor der Zwischenschicht greift.',
      en: 'The lockdown survives reboot and restart because it is coupled to the container stack and takes effect before the intermediary layer, not after.',
    },
    {
      de: 'Die Drift-Erkennung kennt die absichtlich stillgelegten Dienste: aus erwarteten Stilllegungen kommt kein Fehlalarm mehr.',
      en: 'Drift detection that deliberately respects intentionally retired services: false alarms from expected retirements were brought to zero.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Härtung vor Komfort: keine Host-Shell',
        en: 'Hardening before comfort: no host shell',
      },
      body: {
        de: 'Ein Remote-Terminal wäre bequem und ist genau deshalb gefährlich. Die Oberfläche steuert Dienste und liest Logs, sie öffnet aber keine Shell, und Container-Exec ist im Proxy abgeschaltet. Wer das Frontend übernimmt, bekommt damit trotzdem keine Root-Shell auf dem Host.',
        en: 'A remote terminal would be convenient, which is exactly why it is dangerous. The interface controls services and reads logs, but it deliberately opens no shell and disables container exec. Comfort that opens up the attack surface stays out.',
      },
    },
    {
      title: {
        de: 'Lockdown auf der richtigen Kette, reboot-fest',
        en: 'Lockdown on the right chain, reboot-proof',
      },
      body: {
        de: 'Veröffentlichte Container-Ports umgehen die übliche Host-Firewall, deshalb sitzt die Sperre auf der Kette, die für Container-Verkehr wirklich greift, und lässt nur eine Steuerebene durch. Als systemd-verankerter Dienst an den Container-Stack gekoppelt übersteht sie Reboot und Neustart, ohne nach jedem Hochfahren ein Fenster zu öffnen.',
        en: 'Published container ports bypass the usual host firewall, so the lock sits on the chain that actually catches container traffic and lets only one control plane through. As a systemd-backed service coupled to the container stack, it survives reboot and restart without opening a window after every boot.',
      },
    },
    {
      title: { de: 'Drift respektiert erwarteten Zustand', en: 'Drift respects the expected state' },
      body: {
        de: 'Ein gestoppter Dienst ist nicht automatisch ein Fehler. Die Service-Map trägt den Soll-Zustand mitsamt den Diensten, die absichtlich aus sind; der Abgleich meldet nur echte Abweichungen. Eine Anzeige, in der dauerhaft rote Einträge stehen, die keine Fehler sind, schaut man nach zwei Wochen nicht mehr an.',
        en: 'A stopped service is not automatically an error. The service map carries the target state, deliberate retirements included, and the comparison flags only real deviations as drift. That keeps the display honest and quiet.',
      },
    },
    {
      title: {
        de: 'Die zweite Oberfläche wieder abgeschaltet',
        en: 'The second interface was shut down again',
      },
      body: {
        de: 'Neben der Fläche im Portal gab es eine eigenständige Oberfläche für dieselben Daten, dazu eine Android-App. Drei Stellen zeigten dieselben Werte, und jede brauchte ihre eigene Pflege. Im Oktober 2026 habe ich die eigenständige Oberfläche abgeschaltet. Vorher habe ich jede ihrer Ansichten einzeln daraufhin geprüft, ob es sie anderswo gibt; zwei waren bereits tot und riefen Endpunkte auf, die es nicht mehr gab. Der Quelltext ist archiviert, die Daten dahinter liegen unverändert in ihrem Dienst.',
        en: 'Next to the portal area there was a standalone interface for the same data, plus an Android app. Three places showed the same values, and each needed its own maintenance. In October 2026 I shut the standalone interface down. Before that I checked each of its views for an equivalent elsewhere; two were already dead and called endpoints that no longer existed. The source is archived and the data behind it sits unchanged in its own service.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Steuerung', en: 'Control' },
      value: { de: 'Multi-Host, eine Oberfläche', en: 'multi-host, one interface' },
    },
    {
      label: { de: 'Remote-Zugriff', en: 'Remote access' },
      value: { de: 'ohne Container-Exec', en: 'without container exec' },
    },
    {
      label: { de: 'Lockdown', en: 'Lockdown' },
      value: { de: 'reboot-fest, eine Quelle', en: 'reboot-proof, one source' },
    },
    {
      label: { de: 'Fehlalarme', en: 'False alarms' },
      value: { de: 'aus erwarteten Stilllegungen: beseitigt', en: 'brought to zero' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Kontroll-Oberfläche mit Live-Metriken aller Hosts, server-seitiger Zugriff',
        en: 'Control interface with live metrics of all hosts, server-side access',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Remote-Steuerung und Logs über gehärtete Zwischenschicht, Firewall-Lockdown reboot-fest verankert',
        en: 'Remote control and logs through hardened intermediary layer, firewall lockdown reboot-proof anchored',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Drift- und Ghost-Erkennung mit Respekt vor erwartetem Zustand, weiter wachsende Flotte angebunden',
        en: 'Drift and ghost detection respecting the expected state, further growing fleet connected',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Zweite, eigenständige Oberfläche nach Prüfung jeder einzelnen Ansicht abgeschaltet, Kontrollebene bleibt im Portal',
        en: 'Standalone second interface shut down after checking each view individually, control plane stays in the portal',
      },
    },
  ],
  limits: [
    {
      de: 'Die Kontrollebene liest viel und schreibt wenig: sie startet und stoppt Dienste und zeigt Logs, ersetzt aber kein Konfigurations-Management. Änderungen unterhalb der Container-Ebene laufen weiter über die dokumentierte Quelle.',
      en: 'The control plane is deliberately read-heavy and exec-free: it steers services and reads logs, but it does not replace full configuration management. Changes below the container level still run through the documented path via the source of truth.',
    },
    {
      de: 'Sie ist auf eine Flotte in eigener Hand zugeschnitten. Ein größerer, mehrmandantenfähiger Betrieb mit Rollen- und Rechtemodell bräuchte eine andere Zugriffsschicht als einen einzelnen firewall-gesperrten Steuerpfad.',
      en: 'It is tailored to a fleet in one owner’s hands. A larger, multi-tenant operation with a role and permission model would need a different access layer than a single firewall-locked control path.',
    },
  ],
};

export default opsCockpit;
