import type { ProjectDetail } from './projects';

export const PROJECT_DETAILS_EN_1: Record<string, ProjectDetail> = {
  saganta: {
    modules: ['Mail', 'Calendar', 'Valuables', 'Pantry', 'Meal planning', 'Postal mail', 'Project deck'],
    problem:
      'Productivity tools live scattered across third parties: mail with one, calendar with another, tasks with a third. Each pushes its own agenda, forces me into its UI, and rarely ships a native app that shares the same data as the browser. I wanted a suite that feels like one coherent product, that I own, where I actually control the data, and where a single login carries both web and mobile.',
    approach: [
      'A SvelteKit shell as the central launchpad, with theme, locale and pinning; every sub-app shares auth, look and settings.',
      'Everything shared lives as its own package in a pnpm monorepo that Turborepo builds along the dependency graph (UI components with a command palette (⌘K), design tokens, an auth library and an SDK), built once and consumed by every app. That is what carries the unified look and the "one brand" feel.',
      'One backend-for-frontend (BFF in FastAPI) per domain, so the browser never reaches straight into a backend: a frontend only talks to its domain BFF, which checks the session, translates it into the actual backend call and passes back only the fields that are allowed. Auth bridging, logging and a uniform interface live right here; the real backend never sees the open network.',
      'Identity runs through a lean auth service of my own, built on better-auth. An early attempt on an external OIDC stack got dropped again: an own, understandable session layer fits the suite better.',
      'The same auth service issues a short-lived backend token for the native Kotlin apps, so Android uses the same identity as the web without a second login path.',
      'Containers sit segmented in separate network zones. The browser only ever sees the shell and the frontends; the BFFs never face the public.',
    ],
    architecture: {
      summary:
        'Browser and native Kotlin apps share one session against the SvelteKit shell and the sub-app frontends; a self-built auth service on better-auth issues the web session and a short-lived mobile token. Each domain hides its real backend behind a backend-for-frontend that checks identity and passes through only what is allowed; native backends and databases stay behind that BFF layer.',
      tiers: [
        {
          label: 'Clients',
          nodes: [
            { id: 'shell', label: 'Web shell', note: 'SvelteKit · launchpad', kind: 'edge' },
            { id: 'subapps', label: 'Sub-app frontends', kind: 'edge' },
            { id: 'native', label: 'Native Android apps', note: 'Kotlin · per sub-app', kind: 'edge' },
          ],
        },
        {
          label: 'Identity',
          nodes: [
            { id: 'auth', label: 'Self-built auth service', note: 'better-auth · session + mobile token', kind: 'core' },
          ],
        },
        {
          label: 'BFF layer',
          nodes: [
            { id: 'mailbff', label: 'Mail BFF', kind: 'core' },
            { id: 'calbff', label: 'Calendar BFF', kind: 'core' },
            { id: 'assetbff', label: 'Assets BFF', kind: 'core' },
            { id: 'deckbff', label: 'Project-deck BFF', kind: 'core' },
          ],
        },
        {
          label: 'Backends & data',
          nodes: [
            { id: 'mailagg', label: 'Mail aggregator', note: 'external accounts bundled', kind: 'consumer' },
            { id: 'calnative', label: 'Calendar · Assets', note: 'FastAPI own backend', kind: 'consumer' },
            { id: 'db', label: 'Domain databases', note: 'SQLite per domain', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'shell', to: 'auth', label: 'web session' },
        { from: 'native', to: 'auth', label: 'mobile token' },
        { from: 'shell', to: 'mailbff', label: 'authenticated' },
        { from: 'mailbff', to: 'mailagg', label: 'bundled' },
        { from: 'calbff', to: 'calnative', label: 'encapsulated' },
        { from: 'deckbff', to: 'db' },
      ],
    },
    result: [
      'The suite is live and reads as a single brand from the outside: shell, sub-apps, settings and branding all line up.',
      'Mail, news, calendar, assets and a project deck run in production; the mail part bundles external accounts without duplicating a mail server.',
      'The first sub-apps have native Android companions that reuse the web identity through a short-lived backend token: one login, two surfaces.',
      'Theme and locale settings are centralized in the shell and inherited by every sub-app. New domains arrive with their own BFF, nothing existing gets rebuilt.',
    ],
    decisions: [
      {
        title: 'A self-built auth service, not a foreign OIDC stack',
        body: 'An early attempt to run identity through a heavyweight external provider was deliberately dropped. A lean session layer of my own is easy to reason about, fits the suite exactly, and issues a mobile token for the native apps without extra machinery.',
      },
      {
        title: 'Why there is no mail server here',
        body: 'The mail part aggregates existing external accounts and sends over their paths. That buys a unified view, and I do not have to run a second mail stack.',
      },
      {
        title: 'An own backend for assets and the project deck',
        body: 'Where no mature third-party backend fits, I build one: own DB, own logic, clean coupling to the other domains.',
      },
      {
        title: 'Shared code as a package, not copy-paste',
        body: 'What several apps need (UI components, design tokens, an auth library) lives in versioned monorepo packages that every app consumes. The suite looks all of a piece, and one fix lands everywhere, without me re-applying it frontend by frontend.',
      },
    ],
    timeline: [
      { when: 'Q1 2026', what: 'Shell, self-built auth service and first sub-apps live' },
      { when: 'Q2 2026', what: 'Mail aggregator, calendar, assets and project deck in production' },
      { when: 'Q2 2026', what: 'Native Android companions on a shared mobile token' },
      { when: 'later', what: 'Docs, wiki, more sub-apps as needed, no roadmap inflation' },
    ],
    metrics: [
      { label: 'Sub-apps', value: 'Shell · Mail · News · Calendar · Assets · Project deck' },
      { label: 'Shared packages', value: 'UI · design tokens · auth · SDK' },
      { label: 'Clients', value: 'web and native Android' },
      { label: 'Auth backend', value: 'self-built auth service' },
    ],
  },

  homelab: {
    problem:
      'Home labs drift into tinkering debt: 30 containers, each with its own compose, no shared map, no hardening, no backups. The moment someone asks "what is actually running right now", a hole opens up. I wanted the opposite: inventory, network segmentation, hardening waves and a provable DR plan.',
    approach: [
      'A service map as the single source of truth. Every compose definition goes in there first and nowhere else, and cross-host drift is pulled hourly against Gitea.',
      'Container hardening in documented waves: read_only, dropped capabilities, no-new-privileges, separate user IDs. Exceptions get justified, not hidden.',
      'Four network zones (proxy, core, apps, mgmt) with clear rules about who sees whom. No direct Docker socket access for consumers; everything goes through socket proxies.',
      'A self-built event spine: several producers (search, alerts, deals, mail, mailbox) write into one central MQTT bus, and brain-bus rules triage the alerts with dedup and cooldown.',
    ],
    architecture: {
      summary:
        'Access comes in over tunnel and VPN to the control plane, which as the single source of truth drives the runtime hosts. An event spine gathers every producer, and an ops layer of monitoring, off-site backup and secret vault runs crosswise underneath.',
      tiers: [
        {
          label: 'Access',
          nodes: [
            { id: 'tunnel', label: 'Reverse tunnel', note: 'public ingress', kind: 'edge' },
            { id: 'vpn', label: 'VPN', note: 'admin-only', kind: 'edge' },
          ],
        },
        {
          label: 'Control plane',
          nodes: [
            { id: 'map', label: 'Service map', note: 'single source of truth', kind: 'core' },
            { id: 'spine', label: 'Event spine', note: 'MQTT bus', kind: 'core' },
            { id: 'kg', label: 'Knowledge gateway', note: 'adapters', kind: 'core' },
            { id: 'rules', label: 'Alert rules', note: 'dedup · cooldown', kind: 'core' },
          ],
        },
        {
          label: 'Runtime',
          nodes: [
            { id: 'apps', label: 'Public apps & shops', kind: 'consumer' },
            { id: 'ai', label: 'AI compute', note: 'local models · 4-tier router', kind: 'consumer' },
            { id: 'edge', label: 'Edge inference', kind: 'consumer' },
          ],
        },
        {
          label: 'Ops layer',
          nodes: [
            { id: 'mon', label: 'Monitoring', note: 'Prometheus · Grafana · Blackbox', kind: 'data' },
            { id: 'backup', label: 'Off-site backup', note: 'restic, DR runbook', kind: 'data' },
            { id: 'vault', label: 'Secret vault', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'tunnel', to: 'apps', label: 'public apps only' },
        { from: 'map', to: 'apps', label: 'compose definition' },
        { from: 'spine', to: 'rules', label: 'producer → triage' },
        { from: 'ai', to: 'mon', label: 'scrape' },
      ],
    },
    result: [
      'Over 160 services run live across the host fleet, zero drift against the canonical source, hardening wave 3 complete.',
      'The cluster now includes a small x86 virtualization cluster alongside the original single-board nodes; several AI services, among them a larger local language model as a quality lane, were relocated there cleanly, with no drift in the map.',
      'The knowledge gateway is searchable across eleven adapters, and an active route probe flags public domains about to tip over before anyone notices.',
      'A DR runbook with an RTO/RPO matrix, encrypted off-site backup live, and a restore drill that runs automatically on a schedule.',
    ],
    decisions: [
      {
        title: 'Why there is no service mesh',
        body: 'Linkerd or Istio are overkill for a home setup. nginx + cloudflared + WireGuard + segmented compose networks do exactly what is needed.',
      },
      {
        title: 'Hardening in waves, not one big bang',
        body: 'Each wave takes on one clearly bounded class of container. Exceptions like s6-overlay images or Tecnativa socket proxies are written down as permanent exceptions.',
      },
      {
        title: 'Brain-bus for alerts',
        body: 'Teaching each service its own push channel would not have paid off. Everything flows through MQTT → brain-bus rules → ntfy/Discord. Dedup and cooldown live in one place.',
      },
    ],
    timeline: [
      { when: '2024', what: 'Cluster bring-up, first containers' },
      { when: '2025', what: 'Service map, hardening waves 1 and 2, network zones' },
      { when: '2026 H1', what: 'Wave 3, event spine, knowledge gateway, active route probe' },
      { when: '2026 H1', what: 'x86 virtualization cluster integrated, AI services relocated without drift' },
      { when: '2026 H2', what: 'Local AI layer deepened: larger language model as a quality lane, dedicated voice node' },
    ],
    metrics: [
      { label: 'Live services', value: '165 across the fleet' },
      { label: 'Drift', value: '0 against the source' },
      { label: 'Hardening waves', value: '3 complete' },
      { label: 'Hosts', value: 'control plane · public · AI · edge · 3× x86' },
    ],
    limits: [
      'Operations rest on one person: I am the build, the on-call and the documentation at once. That works in self-operation; in a team, role separation, a four-eyes principle and change reviews would take the place of one-person discipline.',
      'Everything sits at a single site on one home connection. There is no geo-redundancy and no automatic failover, if the line goes down the documented recovery kicks in, not a second site.',
      'The load is real but modest: one household, not hundreds of concurrent users. The architecture is built for maintainability and hardening, not for the load spikes that would justify a cluster scheduler like Kubernetes.',
    ],
  },

  lernen: {
    problem:
      'Learning platforms on the market are generic: either LMS heavyweights or flashcard apps. Neither fits someone learning across several domains at once: IT certifications, driving school, school material, general knowledge. Each domain has its own logic, its own visualizations, its own pace.',
    approach: [
      'Six standalone Next.js apps, not one monolith. Each has its own SQLite database embedded in the app (better-sqlite3), its own theme, its own auth; what does not belong together does not get built together.',
      'Shared web building blocks through a design system (`claude-design`); Tailwind and Compose tokens are synced into every app, never copy-pasted.',
      'Three pilot apps native on Android via Compose Multiplatform, with Hilt dependency injection and Custom-Tab login.',
      'A hub as a card dashboard that ties the apps together, its own stack too, not a wrapper.',
    ],
    architecture: {
      summary:
        'Hub, six web apps and the Android pilots share a design system and the learning logic through sync scripts, but each app runs fully isolated with its own database, auth and theme. Share what should be shared, keep the rest apart.',
      tiers: [
        {
          label: 'Entry points',
          nodes: [
            { id: 'hub', label: 'Hub', note: 'card dashboard', kind: 'edge' },
            { id: 'web', label: 'Six web apps', kind: 'edge' },
            { id: 'android', label: 'Android pilots', kind: 'edge' },
          ],
        },
        {
          label: 'Shared building blocks',
          nodes: [
            { id: 'design', label: 'Design system', note: 'web + Compose tokens', kind: 'core' },
            { id: 'logic', label: 'Learning logic', kind: 'core' },
            { id: 'sync', label: 'Sync scripts', note: 'no copy-paste', kind: 'core' },
          ],
        },
        {
          label: 'Per app isolated',
          nodes: [
            { id: 'db', label: 'Own database', note: 'SQLite, per app', kind: 'data' },
            { id: 'auth', label: 'Own auth', kind: 'data' },
            { id: 'theme', label: 'Own theme', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'design', to: 'web', label: 'synced' },
        { from: 'design', to: 'android', label: 'Compose tokens' },
        { from: 'web', to: 'db', label: 'separate per app' },
      ],
    },
    result: [
      'Six apps live on a shared core, with honest empty states everywhere; an earlier monolith was retired in favor of the split apps.',
      'An exam simulator pulls real mock exams from domain-specific question pools and grades them per topic, without grinding through a fixed list.',
      'Subscription and entitlement logic separates free from premium per app, including expiry downgrade and protection against double redemption.',
      'Native Android builds for the apps, with their own password login in the shared core, so nobody is forced into a third-party sign-in.',
    ],
    decisions: [
      {
        title: 'Why six apps',
        body: 'Plugins, modules and roles inside a monolith carry their own overhead. Six lean apps on a shared design system are cheaper in the long run than one shared data model that gets in every domain\'s way; the original monolith was deliberately given up for it.',
      },
      {
        title: 'An exam simulator from pools, not a fixed list',
        body: 'A real exam simulation needs rotating questions weighted by topic. The questions sit in domain-specific pools; each run draws a fresh selection and grades it by topic at the end.',
      },
      {
        title: 'Entitlement as a verified claim',
        body: 'Premium is not a flag but a verified claim with an expiry and protection against double or foreign redemption, so access stays clean even after a subscription ends.',
      },
    ],
    timeline: [
      { when: '2025', what: 'First web apps, design system set up' },
      { when: '2026 H1', what: 'Six apps live, monolith retired, native Android builds' },
      { when: '2026 H1', what: 'Exam simulator and subscription logic pulled across the apps' },
    ],
    metrics: [
      { label: 'Web apps', value: '6 live on one core' },
      { label: 'Android', value: 'native builds with password login' },
      { label: 'Exam simulator', value: 'from pools, graded by topic' },
    ],
  },

  marktwatch: {
    problem:
      'A used-market deal watcher lives or dies by two dangers: false alarms that bury the real signal under noise and burn attention, and any irreversible action (clearing a watchlist, billing an external model) firing by accident. I wanted transparent scoring with real probability behind a "buy", a layered false-positive defense, and hard gates on everything the engine does that cannot be taken back.',
    approach: [
      'An async crawler across multiple sources behind a shared interface, with a circuit breaker per source so a dead source cannot stall the run and a new source stays a class patch.',
      'A false-positive defense in several layers. First a free, rule-based pattern check (accessories, spare parts, damage, bundles, variant listings), then a small language model as cheap pre-triage only for borderline cases, both behind a shared gate that the real-time alert and the daily digest must equally pass.',
      'Quantitative deal math: market statistics from a time-weighted 30-day window (realized auction prices against open asks, robust dispersion via median absolute deviation), then a lognormal-t model that yields the expected margin and the bad case alongside it (a 5% quantile of the profit and the expected shortfall below it) plus a Kelly-style stake and a probabilistic safe-maximum bid.',
      'A downside gate: a candidate only becomes "buy" once its 5% quantile profit clears a floor. A deal that only looks good on average but loses in the bad case is held back.',
      'Everything irreversible sits behind an explicit two-flag gate; observation as the default, no write to the outside without deliberate configuration.',
    ],
    architecture: {
      summary:
        'Several source crawlers behind a shared interface feed a layered false-positive defense: first a free rule filter, then a small language model as pre-triage for borderline cases, then a shared gate that the real-time alert and the daily digest both have to pass. What gets through is scored with time-weighted market statistics and a lognormal-t model that also puts a number on the bad case; a downside gate holds back deals whose 5% quantile loses. Everything irreversible has to pass a two-flag gate, with observation as the default.',
      tiers: [
        {
          label: 'Sources',
          nodes: [
            { id: 'crawl', label: 'Async crawler', note: 'shared interface', kind: 'edge' },
            { id: 'breaker', label: 'Circuit breaker', note: 'per source', kind: 'edge' },
          ],
        },
        {
          label: 'False-positive defense',
          nodes: [
            { id: 'rules', label: 'Rule patterns', note: 'free', kind: 'core' },
            { id: 'triage', label: 'Small language model', note: 'pre-triage, budgeted', kind: 'core' },
            { id: 'fpgate', label: 'Shared gate', note: 'real-time + digest', kind: 'core' },
          ],
        },
        {
          label: 'Scoring',
          nodes: [
            { id: 'stats', label: 'Market statistics', note: 'time-weighted, robust', kind: 'core' },
            { id: 'dealmath', label: 'Lognormal-t deal math', note: 'P05 · CVaR · Kelly', kind: 'core' },
            { id: 'downside', label: 'Downside gate', note: 'bad case bearable', kind: 'core' },
          ],
        },
        {
          label: 'Output & safety',
          nodes: [
            { id: 'alert', label: 'Throttled alerts', kind: 'consumer' },
            { id: 'digest', label: 'Daily digest', kind: 'consumer' },
            { id: 'twoflag', label: 'Two-flag gate', note: 'for the irreversible', kind: 'core' },
          ],
        },
      ],
      flows: [
        { from: 'crawl', to: 'rules', label: 'raw hits' },
        { from: 'rules', to: 'triage', label: 'borderline only' },
        { from: 'triage', to: 'fpgate' },
        { from: 'fpgate', to: 'stats', label: 'what gets through' },
        { from: 'stats', to: 'dealmath' },
        { from: 'dealmath', to: 'downside', label: 'bad case' },
        { from: 'downside', to: 'alert', label: '"buy" only' },
        { from: 'downside', to: 'digest' },
      ],
    },
    result: [
      'Live on a public host with a tunnel callback; irreversible actions sit behind two flags, with observation as the default.',
      'A "buy" carries a traceable probability: expected margin together with the bad case (5% quantile and the expected shortfall below it), and no bare percent-below-median number.',
      'After a false-alarm burst, the real-time alert and the daily digest flow through the same filter gate; the real signal stands clear again while noise stays out.',
      'Steady-state operation stays cheap: the expensive model triage runs only for borderline cases and against a daily budget, the rest is deterministic rule logic.',
      'The scorer is testable independently of the live crawler; the quant math is backed by its own test layer, so fast regression stays possible.',
    ],
    decisions: [
      {
        title: 'Why a distribution, not a point estimate',
        body: 'A single "fair price" hides the risk. A lognormal-t model with a small sample size yields the 5% quantile of the profit and the expected shortfall below it, plus a Kelly-style stake. Behind "buy" there is a quantified downside.',
      },
      {
        title: 'A shared gate after the false-alarm burst',
        body: 'Scattered single filters once let a wave of false alarms through while the reference data had quietly fallen away. The answer was one gate that both real-time and digest must pass, plus anchor guards against "too good to be true" without sales evidence.',
      },
      {
        title: 'A small model only for borderline cases',
        body: 'A language model on every hit would be slow and expensive. The free rule filter decides the clear cases; the model is pulled only on uncertainty and against a daily budget, and fails open on an outage without stopping the run.',
      },
      {
        title: 'The irreversible behind two flags',
        body: 'A rule in the wiki protects nothing. Watchlist cleanup and every write to the outside require a mode flag AND an explicit apply flag; everything else stays a dry run, with observation as the default.',
      },
    ],
    timeline: [
      { when: '2025', what: 'Crawler base, first source, weighted scorer' },
      { when: '2026 H1', what: 'Time-weighted market statistics, lognormal-t deal math with downside and Kelly, safety layer' },
      { when: '2026 H1', what: 'Central false-positive gate after an alarm burst, rule plus model triage, anchor guards' },
      { when: '2026 H2', what: 'More sources, daily digest, invite multiuser with a per-user budget and rate limit' },
    ],
    metrics: [
      { label: 'Scoring', value: 'expected margin + downside (P05 · CVaR)' },
      { label: 'False-positive defense', value: 'rules → small model → gate' },
      { label: 'The irreversible', value: 'two-flag gate · observation by default' },
      { label: 'Access', value: 'invite-only · per-user budget' },
    ],
  },

  shops: {
    problem:
      'Running several WordPress shops without each one drifting into its own special state. WordPress out of the box is not hardened, updates can tip over, security headers are usually missing, and the more shops there are, the more each one drifts.',
    approach: [
      'Canonical hardening templates on the control plane, deployed versioned per shop from one shared source.',
      'Security headers, cache strategy and hardening rules baked into the template as standard, not added by hand per shop.',
      'Container hardening per instance: read-only root with tmpfs for write paths, a segmented network zone, port binding kept local behind the reverse proxy.',
      'A uniform deploy path into the data volume. No shop keeps its own special route; new instances inherit the whole bundle.',
    ],
    architecture: {
      summary:
        'A canonical hardening source on the control plane feeds every shop instance the same template bundle. Each instance runs isolated with its own data volume behind a shared reverse proxy, so new instances inherit the hardening ready-made.',
      tiers: [
        {
          label: 'Access',
          nodes: [{ id: 'proxy', label: 'Reverse proxy / tunnel', kind: 'edge' }],
        },
        {
          label: 'Hardening source',
          nodes: [
            { id: 'tpl', label: 'Hardening templates', note: 'canonical · versioned', kind: 'core' },
            { id: 'hdr', label: 'Security headers', kind: 'core' },
            { id: 'cache', label: 'Cache rules', kind: 'core' },
          ],
        },
        {
          label: 'Shop instances',
          nodes: [
            { id: 'shop', label: 'WooCommerce instances', note: 'read-only · tmpfs', kind: 'consumer' },
          ],
        },
        {
          label: 'Data',
          nodes: [{ id: 'vol', label: 'Data volume', note: 'separate per shop', kind: 'data' }],
        },
      ],
      flows: [
        { from: 'tpl', to: 'shop', label: 'deploy into the volume' },
        { from: 'proxy', to: 'shop', label: 'public' },
        { from: 'shop', to: 'vol' },
      ],
    },
    result: [
      'Several shop instances run on the same hardened substrate, with clear update and restore paths.',
      'New instances start from the finished hardening bundle, not a bare WordPress install.',
      'Drift risk stays low: the shops read what the control plane writes, so corrections land everywhere at once.',
    ],
    decisions: [
      {
        title: 'Templates on the control plane',
        body: 'Per-shop drift was the core problem. Keeping the templates canonical solves it: the shop reads what the control plane writes and no longer maintains its own copy.',
      },
      {
        title: 'Hardening in the template, not per shop',
        body: 'Hardening set by hand per shop is hardening you eventually forget on one of them. In the template it is the default, and every new instance gets it for free.',
      },
    ],
    timeline: [
      { when: '2024', what: 'First shops, hardening templates made canonical' },
      { when: '2025', what: 'Uniform deploy path, security headers and cache as standard' },
      { when: '2026', what: 'Container hardening (read-only, tmpfs, network zones) rolled across all shops' },
    ],
    metrics: [
      { label: 'Shops', value: 'several, hardened' },
      { label: 'Template source', value: 'canonical · versioned' },
      { label: 'Hardening', value: 'read-only · tmpfs · headers' },
    ],
  },


  'wissens-foederation': {
    problem:
      'Knowledge in my own stack is scattered across many services: documents in an archive, notes in a vault, inventory in the warehouse, market data in the deal engine, letters in the mailbox, appointments in the calendar. Each has its own persistence, its own search logic, its own auth. Finding anything means knowing which system holds it and logging into each one separately. I wanted to ask a single question and get one unified answer across all sources, without the asking side ever learning which service delivered it.',
    approach: [
      'One adapter per source, all against the same narrow interface. Wiring in a new source is a new adapter, not a rebuild of the core.',
      'Aggregation on purpose at query time, not via an own crawler. No second index, no scheduler keeping a separate truth in sync; each source stays solely responsible for its own data.',
      'Token auth per backend. Each adapter reaches its source over a secured internal search interface, and the asking side never sees any of the raw ones.',
      'Every query lands as an event on the own event bus, so other services can follow and evaluate how the knowledge layer is used.',
      'The unified hits can optionally be re-ranked by an embedding model (dense reranking), off by default for latency and switchable per request where answer quality matters more than speed.',
      'Deliberate honesty about the limits: only the adapters that are really wired in get listed. When doc drift once claimed extra sources, I checked them and took them back out.',
    ],
    architecture: {
      summary:
        'A consumer asks one question against a single search endpoint. The federation layer fans it out over one adapter per source, each adapter reaching its source token-authenticated through that source\'s internal search interface, and the result comes back unified. Aggregation happens at query time with no index of its own, and every search is written as an event onto the bus, all without the consumer ever knowing the sources behind it.',
      tiers: [
        {
          label: 'Consumers',
          nodes: [
            {
              id: 'consumer',
              label: 'Own services',
              note: 'one backend',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Federation layer',
          nodes: [
            {
              id: 'search',
              label: 'Search endpoint',
              note: 'one question',
              kind: 'core',
            },
            {
              id: 'fanout',
              label: 'Fan-out',
              note: 'at query time',
              kind: 'core',
            },
            {
              id: 'merge',
              label: 'Unification',
              note: 'one result',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Adapters',
          nodes: [
            {
              id: 'adapters',
              label: 'Adapter per source',
              note: 'shared interface',
              kind: 'core',
            },
            {
              id: 'auth',
              label: 'Token auth',
              note: 'per backend',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Sources',
          nodes: [
            {
              id: 'docs',
              label: 'Documents · notes',
              kind: 'data',
            },
            {
              id: 'ops',
              label: 'Inventory · market data',
              kind: 'data',
            },
            {
              id: 'corr',
              label: 'Letters · calendar',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Observation',
          nodes: [
            {
              id: 'bus',
              label: 'Event bus',
              note: 'search as event',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'consumer',
          to: 'search',
          label: 'one question',
        },
        {
          from: 'search',
          to: 'fanout',
        },
        {
          from: 'fanout',
          to: 'adapters',
          label: 'onto all sources',
        },
        {
          from: 'adapters',
          to: 'auth',
          label: 'token-authenticated',
        },
        {
          from: 'auth',
          to: 'docs',
          label: 'internal search interface',
        },
        {
          from: 'adapters',
          to: 'merge',
        },
        {
          from: 'merge',
          to: 'consumer',
          label: 'one result',
        },
        {
          from: 'search',
          to: 'bus',
          label: 'search as event',
        },
      ],
    },
    result: [
      'Eleven real sources are searchable through a single search API, every backend access token-secured.',
      'Other own services treat the knowledge layer as one backend without knowing the sources behind it; the frontend stays separated from the raw systems.',
      'Wiring in a new source is a new adapter against an existing interface, not a change to the core.',
      'Every search runs as an event over the own bus, so the knowledge layer is observable itself.',
    ],
    decisions: [
      {
        title: 'Why there is no index of my own',
        body: 'An own crawler with its own index would have created a second truth that needs constant re-syncing and lies between updates. Instead the federation queries the sources directly at query time: each source owns its data, and the layer keeps no copy.',
      },
      {
        title: 'Adapter pattern with auth per backend',
        body: 'Each source gets an adapter against the same interface, and each adapter carries its own token-authenticated connection. That keeps the sources cleanly encapsulated, lets new ones dock without touching the core, and gives every backend its own bounded trust boundary. There is no shared master key.',
      },
      {
        title: 'Documented limits, not a dressed-up scope',
        body: 'Only what is really wired in gets listed. When doc drift once claimed more sources than existed, I checked it and corrected it. An honest source list is worth more to me than an impressive one that does not hold.',
      },
    ],
    metrics: [
      {
        label: 'Wired-in sources',
        value: '11, heterogeneous',
      },
      {
        label: 'Aggregation',
        value: 'at query time, no own index',
      },
      {
        label: 'Auth',
        value: 'token-based per backend',
      },
      {
        label: 'Event integration',
        value: 'search as an event on the bus',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Federation core, first adapters, token auth per backend',
      },
      {
        when: '2026 H1',
        what: 'First sources wired in, unified result, on-query aggregation',
      },
      {
        when: '2026 H2',
        what: 'Binding to the event bus, grown to eleven sources',
      },
    ],
  },

  'home-digital-twin': {
    problem:
      'Home Assistant holds a strong data base, but the frontend it ships is an endless wall of cards: switches, sensors and histories pile up in lists, while the actual object, the house, appears nowhere. A house is thought of in space: living room, kitchen, office, floors. Control should follow that geography. I wanted to actually see my home: in 2D for quick everyday control, in 3D for the spatial overview of rooms and floors, both on the same live status. Rendering turned out to be the easy part. The separation is harder: layout knowledge (which room, which floor, where a device sits) belongs to the surface; device truth (on, off, temperature) belongs to home automation. Mix the two and every new device forces a frontend rebuild.',
    approach: [
      'A standalone web frontend with two interchangeable room modes on one shared data layer: a 2D floor plan for fast everyday control, a 3D scene for moving between rooms and floors. Neither is an island; both show the same live status.',
      'A backend as an auth capsule: the access token to home automation stays server-side and the browser never sees it. The backend captures snapshots in its own store and serves climate and status histories per room, comparable across rooms.',
      'A live bridge over WebSocket makes state changes show up the moment they happen. A smart home should feel smart, and that includes lights that flip instantly, not in second-long jumps.',
      'Dynamic entity mapping at runtime: new devices surface on their own and drop into a room via drag-and-drop. The layout is data, not code, so new rooms and devices attach without touching anything existing.',
      'A deliberate layer boundary: layout knowledge lives in the twin, device truth stays in home automation. The twin invents no second device state; it just renders the existing one in space.',
    ],
    architecture: {
      summary:
        'The frontend shows house and devices in 2D and 3D on one shared data layer. A twin backend holds the access token server-side, persists snapshots for climate histories, and alone carries the layout knowledge about rooms and floors, while a WebSocket bridge surfaces home-automation state changes at once, no polling. Control commands run the same way back; the browser never touches the device source directly.',
      tiers: [
        {
          label: 'Frontend',
          nodes: [
            {
              id: 'plan',
              label: '2D floor plan',
              note: 'everyday control',
              kind: 'edge',
            },
            {
              id: 'scene',
              label: '3D scene',
              note: 'spatial overview',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Twin backend',
          nodes: [
            {
              id: 'authcap',
              label: 'Auth capsule',
              note: 'token server-side',
              kind: 'core',
            },
            {
              id: 'snap',
              label: 'Snapshot persistence',
              note: 'climate histories',
              kind: 'core',
            },
            {
              id: 'layout',
              label: 'Layout model',
              note: 'rooms, floors, drag-and-drop',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Live bridge',
          nodes: [
            {
              id: 'ws',
              label: 'WebSocket bridge',
              note: 'no polling',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Device truth',
          nodes: [
            {
              id: 'ha',
              label: 'Home automation',
              note: 'single source of the devices',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'plan',
          to: 'authcap',
          label: 'control command',
        },
        {
          from: 'authcap',
          to: 'ws',
        },
        {
          from: 'ws',
          to: 'ha',
          label: 'token encapsulated',
        },
        {
          from: 'ha',
          to: 'scene',
          label: 'live status',
        },
        {
          from: 'snap',
          to: 'plan',
          label: 'climate history',
        },
      ],
    },
    result: [
      'A spatial view of the house in 2D and 3D, both on the same live status.',
      'Climate histories per room, comparable across rooms, because the snapshots live server-side and the frontend need not invent its own caching.',
      'Direct device control right in the floor plan, no jumping into subpages: no search first, operate second.',
      'A clean split between layout knowledge in the twin and device truth in home automation, so new rooms and devices attach without rebuilding anything.',
      'The access token never leaves the server: the frontend controls through the auth capsule and carries no credentials itself.',
    ],
    decisions: [
      {
        title: 'An own frontend, not a custom card in the home-automation stack',
        body: 'Embedded custom cards stay boxed in by their platform: a limited layout engine, no real 3D, constrained interaction. A standalone frontend hands over full control of the layout model, scene rendering and control logic. The extra investment buys headroom you do not have to renegotiate later.',
      },
      {
        title: '2D and 3D in one system, not either-or',
        body: '2D is the everyday tool, fast and close at hand. 3D is the overview and the aha moment for visitors. Both are worth having, and because both sit on the same data layer, the second view costs no second data model, just a second view.',
      },
      {
        title: 'Backend as auth capsule, not a token in the browser',
        body: 'The access token to home automation has no place in the client. Encapsulated server-side, the browser never sees it, and the same backend persists the snapshots on the side, so histories are there without the frontend reinventing state-keeping and caching.',
      },
      {
        title: 'WebSocket, not polling',
        body: 'A periodic poll feels sluggish and burns load for standstill. Over an event-driven live bridge, a light in the floor plan changes the instant it really switches. That immediacy is exactly what separates a dashboard from a control surface.',
      },
      {
        title: 'Layout as data, not code',
        body: 'Device placement and room layout are runtime configuration, not source. New devices appear automatically and get placed by drag-and-drop. The boundary stays clean: what changes often (layout) is editable, what is stable (pipeline) stays code.',
      },
    ],
    metrics: [
      {
        label: 'Representation',
        value: '2D floor plan and 3D scene',
      },
      {
        label: 'Live bridge',
        value: 'WebSocket, event-driven',
      },
      {
        label: 'Layout',
        value: 'drag-and-drop, auto-import at runtime',
      },
      {
        label: 'Histories',
        value: 'climate per room, persisted server-side',
      },
    ],
    timeline: [
      {
        when: 'Q1 2026',
        what: '2D floor plan, backend as auth capsule, live bridge over WebSocket',
      },
      {
        when: 'Q2 2026',
        what: '3D scene on the same data layer, climate histories per room',
      },
      {
        when: 'H2 2026',
        what: 'More rooms, device auto-import refined, layout editor expanded',
      },
    ],
  },

  'homelab-app': {
    problem:
      'A homelab running around the clock wants to be operated even when I am not at the desk: restart a stuck service, glance at the host metrics, read a slice of a log, triage an open item. A mobile web surface feels foreign for that, and raw remote access into the home network is neither secure nor practical day to day. What I wanted was a native companion that feels like its own product, secures access down to the device level, and is still in hand within seconds.',
    approach: [
      'A native Android app with Jetpack Compose and an MVVM cut. A hybrid wrapper would not have carried it: this app gets used daily and has to sit inside system functions like biometrics and the camera.',
      'A repository between surface and network picks, per call, between the real gateway and a static demo dataset, so the app stays fully explorable even with no gateway at all.',
      'Pairing is the security core: a QR code carries the gateway address and CA fingerprint, a device-bound EC key is created in the Android KeyStore and exchanged as a CSR for a JWT and client certificate; the private key never leaves the device.',
      'Running calls authenticate with a bearer JWT and additionally with mTLS once the gateway answers over TLS; tokens and certificates sit AES-GCM-encrypted in the local store and are excluded from the device backup.',
      'Access runs solely over my own VPN, the release build forbids cleartext HTTP, and every mutating action additionally sits behind a local confirmation via biometrics or device PIN.',
      'Built deliberately honest: the actual authorization, rate limits and authentication are enforced server-side by the gateway; the checks in the app are additional layers, not a replacement.',
    ],
    architecture: {
      summary:
        'The Compose surface never talks to the gateway directly, only to a repository that, depending on mode, works live over the private gateway or against static demo data. Pairing happens once via QR: a device-bound EC key is created in the Android KeyStore, a CSR is signed by the gateway into a JWT and client certificate, and both land AES-GCM-encrypted in the local store. After that every call runs over Retrofit with a bearer JWT and mTLS, solely through my own VPN, and every mutating action sits behind a local confirmation.',
      tiers: [
        {
          label: 'Surface',
          nodes: [
            {
              id: 'compose',
              label: 'Compose UI',
              note: 'MVVM, one screen per area',
              kind: 'edge',
            },
            {
              id: 'confirm',
              label: 'Local confirmation',
              note: 'biometrics/PIN before mutation',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Pairing & keys',
          nodes: [
            {
              id: 'pairing',
              label: 'Pairing via QR',
              note: 'fingerprint pinning',
              kind: 'core',
            },
            {
              id: 'keystore',
              label: 'Android KeyStore',
              note: 'EC-P256, non-exportable',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Data layer',
          nodes: [
            {
              id: 'repo',
              label: 'Repository',
              note: 'live or demo',
              kind: 'core',
            },
            {
              id: 'store',
              label: 'Encrypted store',
              note: 'token/cert via AES-GCM',
              kind: 'core',
            },
            {
              id: 'demo',
              label: 'Demo mode',
              note: 'static data, no gateway',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Access & gateway',
          nodes: [
            {
              id: 'transport',
              label: 'Retrofit + mTLS',
              note: 'bearer JWT, TLS required',
              kind: 'consumer',
            },
            {
              id: 'gateway',
              label: 'Private gateway',
              note: 'metrics · services · inbox',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'compose',
          to: 'repo',
          label: 'never reads directly',
        },
        {
          from: 'compose',
          to: 'confirm',
          label: 'before every mutation',
        },
        {
          from: 'pairing',
          to: 'keystore',
          label: 'creates device key',
        },
        {
          from: 'keystore',
          to: 'transport',
          label: 'client cert for mTLS',
        },
        {
          from: 'repo',
          to: 'demo',
          label: 'without a gateway',
        },
        {
          from: 'repo',
          to: 'transport',
          label: 'online calls',
        },
        {
          from: 'transport',
          to: 'gateway',
          label: 'through the VPN, encapsulated',
        },
      ],
    },
    result: [
      'Start, stop or restart a container, read host metrics and logs, triage open items, all from the phone and reachable within seconds.',
      'A public demo mode shows the app fully without a gateway, without real network details ever leaving the repository.',
      'Access stays limited to my own VPN, the device key is non-exportable, and every write needs a local confirmation.',
      'A new capability is one more screen plus a gateway endpoint, not a rebuild of the security or data path.',
    ],
    decisions: [
      {
        title: 'Native, not cross-platform',
        body: 'For a daily companion app native Compose is leaner and closer to Android system functions like biometrics, the camera and the KeyStore. The choice follows the usage pattern, not the fashion.',
      },
      {
        title: 'Pairing by QR, no password',
        body: 'During pairing the device creates a non-exportable key of its own and exchanges it for a certificate. So there is no secret to be typed or intercepted, and access is bound to this exact device.',
      },
      {
        title: 'Access only through my own VPN',
        body: 'No gateway is publicly reachable. The app reaches the home network solely over my own VPN, with no cleartext HTTP at all in the release build. Convenience is not traded here for attack surface.',
      },
      {
        title: 'Security belongs on the server',
        body: 'The app checks locally, but the truth about authorization and rate limits lives in the gateway. Client-side checks are additional layers, so a tampered device does not become an open door.',
      },
    ],
    metrics: [
      {
        label: 'Platform',
        value: 'Android native (minSdk 28)',
      },
      {
        label: 'Architecture',
        value: 'Compose · MVVM · Hilt',
      },
      {
        label: 'Areas',
        value: 'overview · services · inbox',
      },
      {
        label: 'Access',
        value: 'VPN + mTLS + local confirmation',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Native Compose app in an MVVM cut, overview with host metrics, service list with start/stop/restart and logs',
      },
      {
        when: '2026 H1',
        what: 'Pairing via QR: device-bound KeyStore key, CSR exchanged for a JWT and client certificate, fingerprint pinning, encrypted local store',
      },
      {
        when: '2026 H2',
        what: 'Inbox triage, mTLS requirement and cleartext lockout in the release, public demo mode, local confirmation before every mutation',
      },
    ],
  },

  'homelab-sentinel': {
    problem:
      'A home lab running around the clock needs an on-call person, and that is me alone. Without a push channel, that means staring at dashboards constantly and still missing the one event that matters. I wanted the opposite: a sentinel that speaks up on its own when something wobbles, that leaves the decision to me, and that survives a restart without leaving dead buttons behind in the chat.',
    approach: [
      'Push as a principle: the bot reports on its own and I never poll it. The pager is the chat channel\'s existing mobile push, which is already on my phone, so there is no second notification stack.',
      'A cog architecture: each concern gets its own module (from container health through backups, updates and security audits to VPN peer status), pausable and rewritable one at a time, without touching the core.',
      'The bot is a consumer of the own event bus, not a second measurement layer. Signals get deduplicated centrally, triaged with cooldown and delivered bundled. No service has to learn its own push path.',
      'Every intervention runs through a confirmation flow: transient things the bus retries itself within a limit, consequential ones land as a release button with a diagnosis on me.',
      'Buttons are built restart-proof: their meaning sits in the action itself and resolves over a global interaction listener, not out of volatile memory. After a restart, no dead button remains.',
    ],
    architecture: {
      summary:
        'The bot consumes the event bus and measures nothing itself. Signals run from the central bus into the bot core, which routes them to topic-scoped cogs, raises a release button for any intervening step, and sends the result as a chat push, mobile included. Consequential steps run only after my release.',
      tiers: [
        {
          label: 'Source',
          nodes: [
            {
              id: 'spine',
              label: 'Event bus',
              note: 'deduplicated',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Bot core',
          nodes: [
            {
              id: 'loader',
              label: 'Cog loader',
              note: 'restart-proof',
              kind: 'core',
            },
            {
              id: 'confirm',
              label: 'Confirmation flow',
              note: 'release button',
              kind: 'core',
            },
            {
              id: 'dispatch',
              label: 'Action dispatch',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Cogs',
          nodes: [
            {
              id: 'health',
              label: 'Health and updates',
              kind: 'consumer',
            },
            {
              id: 'backup',
              label: 'Backups',
              kind: 'consumer',
            },
            {
              id: 'sec',
              label: 'Security and VPN peers',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Output',
          nodes: [
            {
              id: 'push',
              label: 'Chat push',
              note: 'mobile',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'spine',
          to: 'loader',
          label: 'alert',
        },
        {
          from: 'health',
          to: 'confirm',
          label: 'release',
        },
        {
          from: 'dispatch',
          to: 'spine',
          label: 'action from the chat',
        },
      ],
    },
    result: [
      'Eight cogs cover monitoring, backups, updates, security and connection status, each concern its own, individually pausable module.',
      'Push-worthy events (a restart loop, an expiring certificate, storage pressure) reach me within seconds, while everything maintainable stays quiet in the background.',
      'A release button replaces silent automation: transient things retry on their own up to a limit, and an expired release still executes on a real click without dead-ending.',
      'Buttons survive a bot restart without going dead; whatever was shown before stays clickable.',
      'On-call goes quiet: the sentinel speaks up when there is something to do, and stays silent otherwise.',
    ],
    decisions: [
      {
        title: 'An own bot, not an off-the-shelf tool',
        body: 'A pure push tool would be quicker to stand up. But an own bot brings command interface, action dispatch and integrated logic under one roof, which pays off the moment the sentinel has to act on demand.',
      },
      {
        title: 'Bus as alert source, bot as consumer',
        body: 'No service has to learn its own bot push. Everything runs first through the event bus with dedup and cooldown, and the bot is just one of several consumers. That heads off the alert flood that solo on-call otherwise goes numb to.',
      },
      {
        title: 'Release before intervention, not silent automation',
        body: 'Self-healing is tempting, but a wrong intervention with no query is worse than a missed one. Transient things the bus may retry itself within a hard limit; consequential ones land as a button on me, with an attempt counter guarding against endless loops.',
      },
      {
        title: 'Buttons with no volatile state',
        body: 'Buttons whose meaning lives only in memory are dead after every restart. Instead they carry their meaning in the action itself, resolved over a global interaction listener, so every button survives a restart without re-firing alerts.',
      },
    ],
    metrics: [
      {
        label: 'Cogs',
        value: '12 in production',
      },
      {
        label: 'Push channel',
        value: 'chat, mobile included',
      },
      {
        label: 'Alert latency',
        value: 'seconds, not minutes',
      },
      {
        label: 'Intervention',
        value: 'only after release',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Bot base with cog architecture, binding to the event bus',
      },
      {
        when: '2026 H1',
        what: 'Cogs for health, backups, updates, security and VPN peers',
      },
      {
        when: '2026 H1',
        what: 'Confirmation flow with release button, restart-proof buttons, auto-retry with an attempt limit',
      },
      {
        when: '2026 H2',
        what: 'Action dispatch for chat triggers, more cogs as needed',
      },
    ],
  },

  'ai-vision': {
    problem:
      'First-generation edge hardware is stubborn: tight memory, an older OS and toolchain layer, a GPU architecture almost nothing off the shelf fits. Standard install paths break at spots you only see on impact. And yet the built-in GPU is usable once you understand the platform quirks and steer around them. The goal was dependable image recognition locally in my own network, with no cloud dependency, so other own services can request image tasks without data leaving the house.',
    approach: [
      'Platform inventory first: figure out which libraries the hardware actually ships and which architecture even has runnable packages, before writing a single line of inference code.',
      'Put inference behind a lean HTTP API that listens locally only and plugs into a compute router: other own services call the same interface without ever knowing the hardware.',
      'Solve each platform stumbling block exactly once, write it down and tick it off, from memory quirks through fragile dependency chains to the permission quirks of the GPU binding. The documentation is part of the result, not an afterthought.',
      'Move write-heavy persistence off the internal card onto sturdier storage on purpose, because ML loads do not let simple-class flash last long.',
      'Hardening as the default: minimal capabilities, separate data paths, no direct outside access. The inference is a consumption target inside the home network, not an open door.',
    ],
    architecture: {
      summary:
        'Other own services do not call the model directly but a compute router; it hands off to a local inference server that runs the model on the edge GPU and loads its weights from sturdy storage. The whole hardware binding stays sealed at a single, swappable spot, and new recognition tasks arrive over the same interface without a consumer binding its code to the GPU.',
      tiers: [
        {
          label: 'Consumers',
          nodes: [
            {
              id: 'svc',
              label: 'Own services',
              note: 'image tasks',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Access',
          nodes: [
            {
              id: 'router',
              label: 'Compute router',
              note: 'one API',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Inference',
          nodes: [
            {
              id: 'api',
              label: 'Inference server',
              note: 'reachable locally only',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Hardware',
          nodes: [
            {
              id: 'gpu',
              label: 'Edge GPU',
              kind: 'data',
            },
            {
              id: 'store',
              label: 'Model weights',
              note: 'sturdy storage',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'svc',
          to: 'router',
          label: 'image task',
        },
        {
          from: 'router',
          to: 'api',
        },
        {
          from: 'api',
          to: 'gpu',
          label: 'local inference',
        },
        {
          from: 'api',
          to: 'store',
          label: 'loads weights',
        },
      ],
    },
    result: [
      'A recognition model live on own edge hardware, wired into the rest of the own stack, with warm inference in a fraction of a second.',
      'Cloud inference for these image tasks fully gone: the captures do not leave the home network.',
      'A documented, reproducible platform path: future models and new recognition tasks build on the same foundation, and the bring-up only has to happen once.',
      'After a hardware rework on the storage, the service came back up from a saved state without re-fetching the model; the documented path proved itself when it counted.',
    ],
    decisions: [
      {
        title: 'Work with the platform, not against it',
        body: 'A hardware upgrade is often simply not an option on the first generation. Running at it gets you nowhere, so I built a documented path that accepts the platform\'s quirks and gets productive precisely through that. The stumbling blocks become recorded knowledge, not recurring pain.',
      },
      {
        title: 'Decouple inference behind an API',
        body: 'Direct access to the model would tie every consumer to the concrete hardware. A local HTTP interface decouples it: new tasks and new models move into the same architecture without rewriting any calling service.',
      },
      {
        title: 'Persistence on sturdy storage',
        body: 'Simple-class flash does not survive write-heavy ML loads for long. Putting the weights and caches on more resilient storage fixes it for good with minimal effort and turns creeping data loss into a closed matter.',
      },
      {
        title: 'Edge, not cloud, for image tasks',
        body: 'Local inference keeps the captures in my own network and frees the service from third parties and their pricing and availability. The one-time bring-up buys lasting data sovereignty.',
      },
    ],
    metrics: [
      {
        label: 'Inference location',
        value: 'own edge GPU',
      },
      {
        label: 'Data path',
        value: 'stays in the home network',
      },
      {
        label: 'Extensibility',
        value: 'modular over one API',
      },
      {
        label: 'Platform path',
        value: 'documented, reproducible',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Platform bring-up, local inference server, binding into the compute router',
      },
      {
        when: '2026 H1',
        what: 'Persistence moved onto sturdy storage, platform stumbling blocks documented and ticked off',
      },
      {
        when: '2026 H2',
        what: 'Recovery after hardware rework from a saved state, foundation laid for further recognition tasks',
      },
    ],
  },
};
