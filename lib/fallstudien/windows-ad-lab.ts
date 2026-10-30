import type { Fallstudie } from './typ';

const windowsAdLab: Fallstudie = {
  problem: {
    de: 'Linux betreibe ich täglich, Windows Server und Active Directory kannte ich bisher vor allem aus der Theorie. Für klassische Administrations-Rollen ist beides Alltag: Domäne, Benutzerverwaltung, Gruppenrichtlinien. Diese Lücke schließe ich praktisch, mit einem eigenen Lab.',
    en: 'I run Linux every day; Windows Server and Active Directory I mostly knew from theory. For classic administration roles both are daily business: domains, user management, group policy. I am closing that gap in practice, with a lab of my own.',
  },
  approach: [
    {
      de: 'Ein abgeschottetes Lab auf dem eigenen x86-Virtualisierungs-Cluster: ein Windows Server als Domänencontroller und ein Windows-Client als getrennte virtuelle Maschinen.',
      en: 'An isolated lab on my own x86 virtualization cluster: a Windows Server as domain controller and a Windows client as separate virtual machines.',
    },
    {
      de: 'Bewusst UEFI mit Secure Boot, kein Legacy-BIOS, dazu ein virtuelles TPM. Die Maschinen laufen on-demand, damit der Arbeitsspeicher für die produktiven Dienste frei bleibt.',
      en: 'Deliberately UEFI with Secure Boot, no legacy BIOS, plus a virtual TPM. The machines run on demand, which keeps memory free for the production services.',
    },
    {
      de: 'Der Domänen-Aufbau steht: die Active-Directory-Rolle, DNS und eine eigene Domäne sind eingerichtet, dazu erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe; als Nächstes die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt des Clients.',
      en: 'The domain build-out stands: the Active Directory role, DNS and my own domain are set up, along with the first organizational units, a test user and a security group; next come group policy in depth and joining the client to the domain.',
    },
    {
      de: 'Der Aufbau ist sauber dokumentiert, damit der Weg nachvollziehbar und wiederholbar bleibt.',
      en: 'The build is cleanly documented, so the path stays understandable and repeatable.',
    },
  ],
  architecture: {
    summary: {
      de: 'Auf einem Knoten des eigenen x86-Virtualisierungs-Clusters laufen zwei Windows-Maschinen als getrennte virtuelle Maschinen, beide mit UEFI, Secure Boot und virtuellem TPM: ein Server in der Rolle des Domänencontrollers, der die Active-Directory-Domäne mit integriertem DNS trägt, und ein Client, dessen Domänen-Beitritt noch aussteht. Im Verzeichnis liegen erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe; die Gruppenrichtlinien folgen. Das Lab läuft on-demand und weicht der produktiven Last.',
      en: 'On one node of my own x86 virtualization cluster, two Windows machines run as separate virtual machines, both with UEFI, Secure Boot and a virtual TPM: a server in the domain controller role carrying the Active Directory domain with integrated DNS, and a client whose domain join is still pending. The directory holds the first organizational units, a test user and a security group; group policy follows. The lab runs on demand and yields to production load.',
    },
    tiers: [
      {
        label: { de: 'Virtualisierung', en: 'Virtualization' },
        nodes: [
          {
            id: 'node',
            kind: 'edge',
            label: { de: 'Cluster-Knoten', en: 'Cluster node' },
            note: {
              de: 'on-demand, weicht produktiver Last',
              en: 'on demand, yields to production load',
            },
          },
        ],
      },
      {
        label: { de: 'Maschinen', en: 'Machines' },
        nodes: [
          {
            id: 'dc',
            kind: 'core',
            label: { de: 'Domänencontroller', en: 'Domain controller' },
            note: {
              de: 'UEFI · Secure Boot · virtuelles TPM',
              en: 'UEFI · Secure Boot · virtual TPM',
            },
          },
          {
            id: 'client',
            kind: 'consumer',
            label: { de: 'Client', en: 'Client' },
            note: { de: 'Domänen-Beitritt steht aus', en: 'domain join pending' },
          },
        ],
      },
      {
        label: { de: 'Verzeichnisdienst', en: 'Directory service' },
        nodes: [
          {
            id: 'ad',
            kind: 'core',
            label: { de: 'Active-Directory-Domäne', en: 'Active Directory domain' },
          },
          {
            id: 'dns',
            kind: 'core',
            label: { de: 'Integriertes DNS', en: 'Integrated DNS' },
          },
        ],
      },
      {
        label: { de: 'Verzeichnis-Inhalt', en: 'Directory content' },
        nodes: [
          {
            id: 'ou',
            kind: 'data',
            label: { de: 'Organisationseinheiten', en: 'Organizational units' },
          },
          {
            id: 'users',
            kind: 'data',
            label: { de: 'Benutzer + Gruppen', en: 'Users + groups' },
          },
          {
            id: 'gpo',
            kind: 'data',
            label: { de: 'Gruppenrichtlinien', en: 'Group policy' },
            note: { de: 'als Nächstes', en: 'next up' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'node',
        to: 'dc',
        label: { de: 'nur bei Bedarf', en: 'only when needed' },
      },
      {
        from: 'node',
        to: 'client',
      },
      {
        from: 'dc',
        to: 'ad',
      },
      {
        from: 'dc',
        to: 'dns',
        label: { de: 'in der Domäne integriert', en: 'integrated in the domain' },
      },
      {
        from: 'ad',
        to: 'ou',
      },
      {
        from: 'ad',
        to: 'users',
      },
      {
        from: 'ad',
        to: 'gpo',
        label: { de: 'folgt', en: 'follows' },
      },
      {
        from: 'client',
        to: 'ad',
        label: { de: 'Beitritt folgt', en: 'join follows' },
      },
    ],
  },
  result: [
    {
      de: 'Der Domänencontroller läuft, die Active-Directory-Domäne steht mit eigenem, integriertem DNS; erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe sind angelegt.',
      en: 'The domain controller is up, the Active Directory domain stands with its own integrated DNS; the first organizational units, a test user and a security group exist.',
    },
    {
      de: 'Als Nächstes tritt der Client der Domäne bei, danach kommen die Gruppenrichtlinien in der Tiefe. Bis dahin steht das Projekt als im Aufbau da.',
      en: 'The client joins the domain next, and group policy follows in depth; the state stays honestly marked as in progress, without claiming more than already runs.',
    },
  ],
  decisions: [
    {
      title: { de: 'On-demand, nicht im Dauerbetrieb', en: 'On demand, not always on' },
      body: {
        de: 'Das Lab läuft nur, wenn ich daran arbeite. Das hält Arbeitsspeicher für die produktiven Dienste frei und passt zum Lern-Charakter.',
        en: 'The lab runs only while I work on it. That keeps memory free for the production services and fits its learning purpose.',
      },
    },
    {
      title: { de: 'UEFI und Secure Boot von Anfang an', en: 'UEFI and Secure Boot from the start' },
      body: {
        de: 'Aktuelle Windows-Installationen setzen UEFI, Secure Boot und ein TPM voraus. Mit Legacy-BIOS hätte ich mir ein Lab gebaut, das mit dem, was in Firmen läuft, wenig zu tun hat.',
        en: 'Closer to a real, current Windows environment than legacy BIOS, and a deliberate approach to firmware settings and a virtual TPM.',
      },
    },
    {
      title: { de: 'Neben dem Linux-Schwerpunkt', en: 'Alongside the Linux focus' },
      body: {
        de: 'Das Homelab bleibt Linux-zentriert. Das Windows-Lab verbreitert die Praxis gezielt um die klassischen Administrations-Themen, ohne den Schwerpunkt zu verschieben.',
        en: 'The homelab stays Linux-centric. The Windows lab broadens practice into classic administration topics without shifting the focus.',
      },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Virtualisierung aufgesetzt, Windows-Server- und Client-VM bootbereit',
        en: 'Virtualization set up, Windows server and client VM boot-ready',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Domänencontroller live: Active-Directory-Domäne mit integriertem DNS, erste Organisationseinheiten, Benutzer und Gruppen',
        en: 'Domain controller live: Active Directory domain with integrated DNS, first organizational units, users and groups',
      },
    },
    {
      when: { de: 'als Nächstes', en: 'next' },
      what: {
        de: 'Gruppenrichtlinien in der Tiefe und Domänen-Beitritt des Clients',
        en: 'Group policy in depth and joining the client to the domain',
      },
    },
  ],
  limits: [
    {
      de: 'Das ist erklärtermaßen ein Lernlabor, kein Produktivbetrieb: eine Domäne, wenige Objekte, keine echten Nutzer und keine über Jahre gewachsene Rechte-Struktur. Es zeigt geübte Handgriffe, nicht den Betrieb einer Unternehmens-Domäne.',
      en: 'This is avowedly a learning lab, not production: one domain, a handful of objects, no real users and no permission structure grown over years. It shows practiced steps, not the operation of an enterprise domain.',
    },
    {
      de: 'Das Lab ist im Aufbau: Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt des Clients stehen noch aus.',
      en: 'The state is deliberately in progress: group policy in depth and the client’s domain join are still pending. The page claims no more than what already runs.',
    },
  ],
};

export default windowsAdLab;
