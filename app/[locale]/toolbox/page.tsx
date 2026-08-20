import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { asLocale, localeAlternates, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { type Project, type ProjectStatus, getStack } from '@/lib/projects';
import { getProof } from '@/lib/proof';
import { getProjects } from '@/lib/store';
import { CountUp } from '../../components/CountUp';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader, SectionHeader } from '../../components/SectionHeader';
import { HeaderVisual } from '../../components/graphics/HeaderVisual';
import { LayerStack } from '../../components/graphics/LayerStack';
import { CommandEyebrow, Prompt, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';
import BarChart from '../../components/graphics/BarChart';

// ISR: Stack-Häufigkeit + Cluster-Kennzahlen aggregieren über den
// (CMS-pflegbaren) Projekt-Store und getProof (BUILD_TIME).
export const revalidate = 300;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'nav.toolbox'),
    description:
      locale === 'en'
        ? 'A toolbox with reasoning, daily setup and disclosed aggregate numbers across the portfolio. One place for stack, uses and stats.'
        : 'Womit ich arbeite und warum, dazu mein tägliches Setup und ein paar Zahlen über das Portfolio.',
    alternates: localeAlternates(locale, '/toolbox'),
    openGraph: {
      description:
        locale === 'en'
          ? 'A toolbox with reasoning: stack, daily setup and disclosed aggregate numbers across the portfolio.'
          : 'Womit ich arbeite und warum: Stack, tägliches Setup und ein paar Zahlen über das Portfolio.',
    },
  };
}

interface Rationale {
  label: string;
  body: string;
  wofur: string;
  nichtfur: string;
}

const RATIONALES_DE: Rationale[] = [
  {
    label: 'Infra & Ops',
    body: 'Docker Compose ist absichtlich kein Kubernetes. Ein Cluster-Scheduler löst hier kein Problem, das ich tatsächlich habe; lesbare Compose-Files mit Härtung pro Service schon. cloudflared statt offener Ports, WireGuard für persönliche Remote-Sessions, Authelia als zentraler OIDC-Provider.',
    wofur: 'Bis ca. 200 Services mit klaren Ownership-Grenzen.',
    nichtfur: 'Multi-Tenant-Workloads mit dynamischem Scheduling, dann ist k8s wirklich die Antwort.',
  },
  {
    label: 'Backend',
    body: 'FastAPI ist die Default-Wahl: kleine Service-Footprints, async aus dem Stand, sauberes OpenAPI ohne Decoder-Ring. Node/TypeScript dort, wo das Ökosystem näher liegt, Chat-Stack, eBay-Bridges, Web-Pakete.',
    wofur: 'Eigene Services, BFFs, Edge-API mit klarer Trennlinie zur DB.',
    nichtfur: 'Monolithische Geschäftsapplikationen mit hundert Tabellen, da nimmt man, was die Branche kennt.',
  },
  {
    label: 'Frontend',
    body: 'SvelteKit für Saganta-Shells: weniger Build-Magie, schnelle Hydration, gute SSR-Disziplin. Next.js, wenn React und App-Router-Konventionen den Wartungsaufwand senken. Compose Multiplatform für die App-Familie.',
    wofur: 'Eigen-Apps mit klarem Owner. Static-Builds, die LAN-First betreibbar sind.',
    nichtfur: 'Marketing-Sites mit fünf Builds pro Tag und CMS-Lock-in, dafür braucht es keinen App-Router.',
  },
  {
    label: 'AI / Daten',
    body: 'Claude für anspruchsvolle Inferenz und Vision, BGE-M3 via llama.cpp für lokale Embeddings, YOLO/TensorRT für Edge-Vision auf Jetson. RAG immer mit eigener Eval-Harness, ohne Baseline ist Tuning Aberglaube.',
    wofur: 'Hybrid-Suche, Bilddiagnose, klar abgegrenzte Inferenz-Domänen.',
    nichtfur: 'General-Purpose-Chatbots ohne Zweck, die füllen nur Logs.',
  },
];

const RATIONALES_EN: Rationale[] = [
  {
    label: 'Infra & Ops',
    body: 'Docker Compose is deliberately not Kubernetes. A cluster scheduler solves no problem I actually have; readable compose files with per-service hardening do. cloudflared instead of open ports, WireGuard for personal remote sessions, Authelia as the central OIDC provider.',
    wofur: 'Up to roughly 200 services with clear ownership boundaries.',
    nichtfur: 'Multi-tenant workloads with dynamic scheduling: that is where k8s really is the answer.',
  },
  {
    label: 'Backend',
    body: 'FastAPI is the default: small service footprints, async out of the box, clean OpenAPI without a decoder ring. Node/TypeScript where the ecosystem is closer: the chat stack, eBay bridges, web packages.',
    wofur: 'Own services, BFFs, an edge API with a clear line to the database.',
    nichtfur: 'Monolithic business applications with a hundred tables. There you reach for what the industry already knows.',
  },
  {
    label: 'Frontend',
    body: 'SvelteKit for the Saganta shells: less build magic, fast hydration, good SSR discipline. Next.js when React and App-Router conventions cut maintenance. Compose Multiplatform for the app family.',
    wofur: 'Own apps with a clear owner. Static builds that can run LAN-first.',
    nichtfur: 'Marketing sites with five builds a day and CMS lock-in: no App Router needed for that.',
  },
  {
    label: 'AI / Data',
    body: 'Claude for demanding inference and vision, BGE-M3 via llama.cpp for local embeddings, YOLO/TensorRT for edge vision on the Jetson. RAG always with my own eval harness: without a baseline, tuning is superstition.',
    wofur: 'Hybrid search, image diagnostics, clearly scoped inference domains.',
    nichtfur: 'General-purpose chatbots with no purpose. They only fill up logs.',
  },
];

interface UsesEntry {
  /** Gruppen-Titel (menschlich lesbar). */
  group: string;
  /** Kommentar-Header im „# slug“-Stil für den Mono-Look. */
  slug: string;
  items: { name: string; note?: string }[];
}

const USES_DE: UsesEntry[] = [
  {
    group: 'Hardware',
    slug: 'hardware',
    items: [
      { name: 'Raspberry Pi 5, Control-Plane' },
      { name: 'Raspberry Pi 5, Public/Deploy-Runtime' },
      { name: 'Raspberry Pi 5, lokale AI (Embeddings + kleines LLM)' },
      { name: '3-Node-x86-Proxmox-Cluster, schwere AI + Virtualisierung (LLMs, STT, TTS, Reranker, VMs)' },
      { name: 'Jetson Nano 4 GB, Edge-Inferenz für Vision-Aufgaben' },
      { name: 'TP-Link ER605, Edge-Router im Standalone-Mode' },
      { name: 'Speedport Smart 7, Glasfaser-WAN' },
      { name: 'Laptop mit Linux, Entwicklung & Pair-Sessions' },
    ],
  },
  {
    group: 'Editor & Workflow',
    slug: 'editor',
    items: [
      { name: 'Claude Code', note: 'AI-Pair-Programming in der Konsole' },
      { name: 'Neovim · LazyVim', note: 'für gezielte Code-Arbeit' },
      { name: 'VS Code', note: 'wenn Plugins gefragt sind' },
      { name: 'tmux', note: 'persistente Remote-Sessions auf den Pis' },
      { name: 'Obsidian', note: 'Memory + ZIELBILD + Runbooks' },
    ],
  },
  {
    group: 'Backend & Daten',
    slug: 'backend',
    items: [
      { name: 'Python · FastAPI', note: 'Default für eigene Services' },
      { name: 'Node · TypeScript', note: 'wo das Ökosystem näher liegt' },
      { name: 'PostgreSQL', note: 'für alles, was wirklich relational ist' },
      { name: 'SQLite', note: 'für ehrlich kleine Stores' },
      { name: 'SQLAlchemy 2', note: 'sync wie async' },
    ],
  },
  {
    group: 'Frontend',
    slug: 'frontend',
    items: [
      { name: 'Next.js · App Router', note: 'wenn React passt' },
      { name: 'SvelteKit', note: 'für Saganta-Shells' },
      { name: 'Tailwind CSS', note: 'überall' },
      { name: 'Compose Multiplatform', note: 'für die App-Familie' },
    ],
  },
  {
    group: 'Infra & Ops',
    slug: 'infra',
    items: [
      { name: 'Docker Compose', note: 'kein Kubernetes für ein Homelab' },
      { name: 'cloudflared', note: 'Tunnel statt öffentliche Ports' },
      { name: 'WireGuard', note: 'für persönliche Remote-Sessions' },
      { name: 'Authelia', note: 'OIDC-Provider für Eigen-Apps' },
      { name: 'Prometheus + Grafana', note: 'Metriken & Alerts' },
      { name: 'age', note: 'verschlüsseltes Secret-Management' },
    ],
  },
  {
    group: 'AI & RAG',
    slug: 'ai',
    items: [
      { name: 'Claude API · Sonnet/Opus', note: 'für ernsthafte Aufgaben' },
      { name: 'Claude Vision', note: 'für Bild- und Dokumentanalyse' },
      { name: 'BGE-M3 via llama.cpp', note: 'lokale Embeddings' },
      { name: 'YOLO + TensorRT', note: 'Edge-Vision auf dem Nano' },
    ],
  },
  {
    group: 'Dienste',
    slug: 'dienste',
    items: [
      { name: 'Cloudflare', note: 'DNS, Tunnel, kein Hosting' },
      { name: 'Hetzner', note: 'Off-Site-Backup-Ziel' },
      { name: 'Gitea (self-hosted)', note: 'Versionskontrolle; ausgewählte Projekte gespiegelt auf GitHub' },
    ],
  },
];

const USES_EN: UsesEntry[] = [
  {
    group: 'Hardware',
    slug: 'hardware',
    items: [
      { name: 'Raspberry Pi 5, control plane' },
      { name: 'Raspberry Pi 5, public/deploy runtime' },
      { name: 'Raspberry Pi 5, local AI (embeddings + a small LLM)' },
      { name: '3-node x86 Proxmox cluster, heavy AI + virtualization (LLMs, STT, TTS, reranker, VMs)' },
      { name: 'Jetson Nano 4 GB, edge inference for vision tasks' },
      { name: 'TP-Link ER605, edge router in standalone mode' },
      { name: 'Speedport Smart 7, fibre WAN' },
      { name: 'Linux laptop, development & pair sessions' },
    ],
  },
  {
    group: 'Editor & Workflow',
    slug: 'editor',
    items: [
      { name: 'Claude Code', note: 'AI pair programming in the console' },
      { name: 'Neovim · LazyVim', note: 'for focused code work' },
      { name: 'VS Code', note: 'when plugins are needed' },
      { name: 'tmux', note: 'persistent remote sessions on the Pis' },
      { name: 'Obsidian', note: 'memory + target picture + runbooks' },
    ],
  },
  {
    group: 'Backend & Data',
    slug: 'backend',
    items: [
      { name: 'Python · FastAPI', note: 'default for my own services' },
      { name: 'Node · TypeScript', note: 'where the ecosystem is closer' },
      { name: 'PostgreSQL', note: 'for anything that is truly relational' },
      { name: 'SQLite', note: 'for honestly small stores' },
      { name: 'SQLAlchemy 2', note: 'sync and async alike' },
    ],
  },
  {
    group: 'Frontend',
    slug: 'frontend',
    items: [
      { name: 'Next.js · App Router', note: 'when React fits' },
      { name: 'SvelteKit', note: 'for the Saganta shells' },
      { name: 'Tailwind CSS', note: 'everywhere' },
      { name: 'Compose Multiplatform', note: 'for the app family' },
    ],
  },
  {
    group: 'Infra & Ops',
    slug: 'infra',
    items: [
      { name: 'Docker Compose', note: 'no Kubernetes for a homelab' },
      { name: 'cloudflared', note: 'tunnels instead of open ports' },
      { name: 'WireGuard', note: 'for personal remote sessions' },
      { name: 'Authelia', note: 'OIDC provider for my own apps' },
      { name: 'Prometheus + Grafana', note: 'metrics & alerts' },
      { name: 'age', note: 'encrypted secret management' },
    ],
  },
  {
    group: 'AI & RAG',
    slug: 'ai',
    items: [
      { name: 'Claude API · Sonnet/Opus', note: 'for serious tasks' },
      { name: 'Claude Vision', note: 'for image and document analysis' },
      { name: 'BGE-M3 via llama.cpp', note: 'local embeddings' },
      { name: 'YOLO + TensorRT', note: 'edge vision on the Nano' },
    ],
  },
  {
    group: 'Services',
    slug: 'dienste',
    items: [
      { name: 'Cloudflare', note: 'DNS, tunnels, no hosting' },
      { name: 'Hetzner', note: 'off-site backup target' },
      { name: 'Gitea (self-hosted)', note: 'version control; selected projects mirrored on GitHub' },
    ],
  },
];

// status → menschliches Label je Sprache.
const STATUS_LABELS: Record<Locale, Record<ProjectStatus, string>> = {
  de: {
    live: 'live',
    'im-aufbau': 'im Aufbau',
    wartung: 'in Wartung',
    pivot: 'eingestellt',
  },
  en: {
    live: 'live',
    'im-aufbau': 'in progress',
    wartung: 'maintenance',
    pivot: 'discontinued',
  },
};

// status-dot-Modifier je Status. 'im-aufbau' hat keine eigene CSS-Klasse →
// auf den Build-Puls mappen (Amber), statt einen unsichtbaren Dot zu rendern.
const STATUS_DOT: Record<ProjectStatus, string> = {
  live: 'status-dot--live',
  'im-aufbau': 'status-dot--build',
  wartung: 'status-dot--wartung',
  pivot: 'status-dot--pivot',
};

function anchors(locale: Locale) {
  return [
    { href: '#philosophie', label: locale === 'en' ? 'Philosophy' : 'Philosophie' },
    { href: '#setup', label: 'Setup' },
    { href: '#zahlen', label: locale === 'en' ? 'Numbers' : 'Zahlen' },
  ];
}

// Häufigkeit eines Werkzeugs über das Portfolio. EINMAL definiert, von
// #philosophie (Top-5) und #zahlen (Tag-Cloud) gemeinsam genutzt.
function stackFrequency(projects: Project[]) {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default async function ToolboxPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  const proof = getProof();
  const projects = await getProjects();

  const STACK = getStack(locale);
  const RATIONALES = en ? RATIONALES_EN : RATIONALES_DE;
  const USES = en ? USES_EN : USES_DE;

  const frequency = stackFrequency(projects);
  const topFive = frequency.slice(0, 5);

  const domainCounts = new Map<string, number>();
  const statusCounts = new Map<ProjectStatus, number>();
  for (const p of projects) {
    domainCounts.set(p.domain, (domainCounts.get(p.domain) ?? 0) + 1);
    statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
  }
  const domainSorted = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxDomain = domainSorted[0]?.[1] ?? 1;
  const statusSorted = [...statusCounts.entries()].sort((a, b) => b[1] - a[1]);

  const hero = USES[0];
  const restUses = hero ? USES.slice(1) : USES;

  return (
    <div className="relative">
      <TopBar active="/toolbox" locale={locale} />

      <main id="main" className="mx-auto max-w-5xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <HeaderVisual visual={<LayerStack className="ml-auto h-full w-auto" />}>
          <PageHeader
            eyebrow="ls ~/toolbox"
            title={en ? 'Toolbox, setup, numbers.' : 'Werkzeugkasten, Setup, Zahlen.'}
            lead={
              en
                ? 'What things are built with and why, what sits on the desk every day, and the aggregate numbers behind it. Tool choice is a maintenance decision, not a fashion statement.'
                : 'Womit gebaut wird und warum, was täglich am Rechner liegt, und die Aggregat-Zahlen dahinter. Werkzeug-Wahl ist eine Wartungsentscheidung, keine Mode.'
            }
            command
          />
        </HeaderVisual>

        {/* Dezente Anker-Navigation. */}
        <nav
          aria-label={en ? 'Sections' : 'Abschnitte'}
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted"
        >
          <span aria-hidden className="text-muted-dim">$ cd</span>
          {anchors(locale).map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {a.label}
            </a>
          ))}
        </nav>

        {/* ---------------- #philosophie ---------------- */}
        <section id="philosophie" className="scroll-mt-24 pt-20">
          <SectionHeader index="01" eyebrow="ls ~/stack" title={en ? 'The toolbox' : 'Der Werkzeugkasten'} />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
            {en
              ? 'Four disciplines, kept deliberately small. What is not here is not missing by accident. It just never found a place in operation.'
              : 'Vier Disziplinen, bewusst klein gehalten. Was hier nicht steht, fehlt nicht aus Versehen, sondern weil es keinen Platz im Betrieb gefunden hat.'}
          </p>
          <div className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40">
            <WindowBar title="~/stack" right={<CommandEyebrow>tree -L 1</CommandEyebrow>} />
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {STACK.map((cat) => (
                <div key={cat.label} className="bg-bg p-5 sm:p-6">
                  <p className="font-mono text-xs lowercase tracking-widest text-muted-dim">
                    # {cat.label.toLowerCase()}
                  </p>
                  <ul className="mt-3 space-y-1.5 font-mono text-sm text-text/90">
                    {cat.items.map((it) => (
                      <li key={it} className="flex items-baseline gap-2">
                        <span aria-hidden className="text-accent">›</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-16">
            <SectionHeader
              index="02"
              eyebrow="grep -r 'warum' ~/stack"
              title={en ? 'Four disciplines, four reasons' : 'Vier Disziplinen, vier Begründungen'}
            />
            <Reveal as="ol" stagger className="mt-10 space-y-10">
              {RATIONALES.map((r, i) => {
                const cat = STACK.find((c) => c.label === r.label);
                return (
                  <li
                    key={r.label}
                    className="grid gap-8 border-b border-border/60 pb-10 last:border-0 md:grid-cols-12"
                  >
                    <div className="md:col-span-3">
                      <p className="font-mono text-xs uppercase tracking-widest text-accent">
                        {(i + 1).toString().padStart(2, '0')} · {r.label}
                      </p>
                      {cat ? (
                        <ul className="mt-4 space-y-1.5 font-mono text-sm text-text/80">
                          {cat.items.map((it) => (
                            <li key={it} className="flex items-baseline gap-2">
                              <span aria-hidden className="text-accent/70">›</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="md:col-span-9">
                      <p className="pull-quote">{r.body}</p>
                      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="label">{en ? 'Fits' : 'Passt für'}</dt>
                          <dd className="mt-2 text-text/90">{r.wofur}</dd>
                        </div>
                        <div>
                          <dt className="label">{en ? 'Does not fit' : 'Passt nicht für'}</dt>
                          <dd className="mt-2 text-muted">{r.nichtfur}</dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                );
              })}
            </Reveal>
          </div>
        </section>

        {/* ---------------- #setup ---------------- */}
        <section id="setup" className="scroll-mt-24 pt-20">
          <SectionHeader index="03" eyebrow="uname -a" title={en ? 'What sits on the desk' : 'Was am Tisch liegt'} />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
            {en
              ? 'Inspired by the “uses” format from the indie-web community. Where it fits, there is a self-owned alternative to a commercial service; where it does not, the commercial service is named honestly.'
              : 'Inspiriert vom „uses“-Format aus der Indie-Web-Community. Wo es passt, gibt es Eigentums-Alternativen zu kommerziellen Diensten, wo nicht, steht ehrlich der kommerzielle Dienst.'}
          </p>

          {hero ? (
            <div className="pt-8">
              <UsesWindow group={hero} index="01" hero />
            </div>
          ) : null}

          <div className="pt-10">
            <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
              <div>
                <CommandEyebrow>ls ~/uses</CommandEyebrow>
                <h3 className="mt-2 font-mono text-xl font-medium uppercase tracking-wide text-text sm:text-2xl">
                  {en ? 'Software and services' : 'Software und Dienste'}
                </h3>
              </div>
              <span aria-hidden className="hidden font-mono text-sm text-accent/70 sm:block">
                [{restUses.length.toString().padStart(2, '0')} {en ? 'families' : 'Familien'}]
              </span>
            </div>

            <Reveal as="div" stagger className="mt-8 grid gap-5 sm:grid-cols-2">
              {restUses.map((g, i) => (
                <UsesWindow key={g.group} group={g} index={(i + 2).toString().padStart(2, '0')} />
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------------- #zahlen ---------------- */}
        <section id="zahlen" className="scroll-mt-24 pt-20">
          <SectionHeader index="04" eyebrow="./stats.sh --aggregate" title={en ? 'Numbers in the open' : 'Zahlen, die offen liegen'} />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
            {en
              ? 'An aggregate view of the portfolio and the operation behind it. No hostnames, no internal identifiers, only what makes sense in public.'
              : 'Aggregat-Sicht aufs Portfolio und den Betrieb dahinter. Keine Hostnames, keine internen Identifier, nur das, was öffentlich Sinn ergibt.'}
          </p>

          <div
            aria-label={en ? 'Live aggregate of the operation' : 'Live-Aggregat des Betriebs'}
            className="mt-8 overflow-hidden rounded-lg border border-border shadow-panel"
          >
            <WindowBar
              title="stats --aggregate"
              right={
                // Ehrlichkeit: dies ist die statische Selbstauskunft (Service-Map),
                // NICHT extern gemessen wie der Live-Streifen der Startseite. Deshalb
                // ein neutraler „Momentaufnahme“-Marker statt eines grünen online-Pulses.
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
                  <span className="status-dot status-dot--pivot" aria-hidden />
                  {en ? 'snapshot' : 'Momentaufnahme'}
                </span>
              }
            />
            <div className="grid gap-px bg-border sm:grid-cols-2 md:grid-cols-12">
              <div className="bg-bg p-6 sm:col-span-2 sm:p-8 md:col-span-6">
                <p className="label">{en ? 'In production' : 'Im Dauerbetrieb'}</p>
                <div className="mt-3 stat-major text-accent glow-text">
                  <CountUp to={proof.services} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {en
                    ? `services live · ${proof.drift} drift in the service map`
                    : `Services live · ${proof.drift} Drift in der Service-Map`}
                </p>
              </div>
              <Minor
                label="Hosts"
                value={proof.hosts}
                hint="Control · Public · AI · Edge · x86"
              />
              <Minor
                label={en ? 'Since' : 'Seit'}
                value="2024"
                hint={en ? 'self-run' : 'Eigenbetrieb'}
              />
            </div>
          </div>
          {proof.deployed ? (
            <p className="mt-4 font-mono text-xs text-muted-dim">
              <span aria-hidden className="mr-2 text-term">›</span>
              {en
                ? `Last deploy: ${proof.deployed.age_label} (${proof.deployed.iso}).`
                : `Letztes Deploy: ${proof.deployed.age_label} (${proof.deployed.iso}).`}
            </p>
          ) : null}

          <div className="pt-16">
            <SectionHeader
              index="05"
              eyebrow="ls projekte/ | sort domain"
              title={en ? 'Projects per domain' : 'Projekte pro Domäne'}
            />
            <Reveal className="mt-8 overflow-hidden rounded-panel border border-border bg-surface/40 shadow-panel">
              <WindowBar title="projekte --by-domain" />
              <div className="p-5 text-accent sm:p-7">
                <BarChart
                  className="w-full"
                  ariaLabel={en ? 'Bar chart: number of projects per domain' : 'Balkendiagramm: Anzahl Projekte je Domäne'}
                  data={domainSorted.map(([domain, count]) => ({ label: domain, value: count }))}
                  max={maxDomain}
                />
              </div>
            </Reveal>
          </div>

          <div className="pt-16">
            <SectionHeader index="06" eyebrow="grep -c status projekte/*" title={en ? 'Status distribution' : 'Status-Verteilung'} />
            <div className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40">
              <WindowBar title="systemctl status projekte" />
              <Reveal as="ul" stagger className="divide-y divide-border/60">
                {statusSorted.map(([status, count]) => (
                  <li key={status} className="flex items-baseline gap-4 px-5 py-4 sm:px-6">
                    <span className="stat-minor w-12 shrink-0 tabular-nums text-text">{count}</span>
                    <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                      <span className={`status-dot ${STATUS_DOT[status]}`} aria-hidden />
                      {STATUS_LABELS[locale][status]}
                    </span>
                  </li>
                ))}
              </Reveal>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-dim">
              <span aria-hidden className="mr-2 text-accent/70">›</span>
              {en
                ? `${projects.length} projects in the portfolio in total.`
                : `${projects.length} Projekte im Portfolio gesamt.`}
            </p>
          </div>

          <div className="pt-16">
            <SectionHeader
              index="07"
              eyebrow="sort -rn stack/häufigkeit"
              title={en ? 'Stack as a tag cloud' : 'Stack als Tag-Cloud'}
            />
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              {en
                ? 'The bigger the word, the more often the tool shows up across the portfolio.'
                : 'Je größer das Wort, desto öfter taucht das Werkzeug im Portfolio auf.'}
            </p>
            <ul className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              {frequency.map(([name, count]) => {
                const size =
                  count >= 4
                    ? 'text-3xl text-text'
                    : count >= 2
                      ? 'text-xl text-text/85'
                      : 'text-sm text-muted';
                return (
                  <li key={name} className={`font-display leading-tight ${size}`}>
                    {name}
                    <sup className="ml-1 font-mono text-[0.65rem] text-muted-dim">{count}</sup>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface/40">
              <WindowBar title="~/stack: usage --top 5" />
              <ol className="space-y-3 p-5 sm:p-6">
                {topFive.map(([name, count], i) => {
                  const max = topFive[0]?.[1] ?? 1;
                  return (
                    <li key={name} className="bar-row">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted">
                        {(i + 1).toString().padStart(2, '0')} · {name}
                      </span>
                      <span className="bar-track" aria-hidden>
                        <span
                          className="bar-fill block"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </span>
                      <span className="font-mono text-sm text-text/90">
                        <CountUp to={count} suffix="×" />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function Minor({
  value,
  label,
  hint,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="bg-bg p-5 sm:p-6 md:col-span-3">
      <p className="label">{label}</p>
      <div className="mt-2 stat-minor">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-dim">{hint}</div> : null}
    </div>
  );
}

function UsesWindow({
  group,
  index,
  hero = false,
}: {
  group: UsesEntry;
  index: string;
  hero?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface/40">
      <WindowBar
        title={`~/uses/${group.slug}`}
        right={
          <span aria-hidden className="font-mono text-[0.65rem] uppercase tracking-widest text-accent/70">
            {index}
          </span>
        }
      />
      <div className="p-5 sm:p-6">
        {hero ? (
          <Prompt path={`~/uses/${group.slug}`} command="ls -lh" className="text-xs" />
        ) : null}
        <p className={`font-mono text-xs text-muted-dim${hero ? ' mt-4' : ''}`}>
          <span aria-hidden>#</span> {group.group}
        </p>
        <ul className="mt-4 space-y-2.5 font-mono text-sm">
          {group.items.map((item) => (
            <li key={item.name} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span aria-hidden className="text-accent">
                ›
              </span>
              <span className="text-text/90">{item.name}</span>
              {item.note ? (
                <span className="text-muted-dim">
                  <span aria-hidden>· </span>
                  {item.note}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
