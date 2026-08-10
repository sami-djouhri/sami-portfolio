import type { ProjectDetail } from './projects';

export const PROJECT_DETAILS_EN_2: Record<string, ProjectDetail> = {
  postfach: {
    problem:
      'Digitizing paper mail is an everyday pain, especially for small and mid-sized businesses: letters pile up, nothing is searchable, and the obvious fix pushes you into a cloud DMS or a third-party mailbox that you hand your trust and your data to at once. A photographed letter is skewed, badly lit and full of background, a long way from a clean record. I wanted the whole path covered, from throwaway phone photo to a filed, searchable entry inside my own network, without a single document ever leaving the house.',
    approach: [
      'Image preparation as its own upstream step: before any text is read, a classic computer-vision stage turns the skewed photo into a straightened, legible scan. It runs as a standalone service and can be tuned in isolation.',
      'Classic computer vision for what it does deterministically and cheaply (find the document, fix the perspective, prep for OCR), and a language model only afterwards for what needs understanding: pulling title and sender from the full text.',
      'A robust fallback instead of hard errors: if image preparation is skipped or chokes on a bad photo, the original gets filed anyway, and the user never hits a dead end.',
      'Clean integration inward: every finished scan emits an event on my own event bus, and a token-secured internal search interface makes the archive discoverable to the cross-cutting knowledge layer, without consumers ever touching the raw backend.',
    ],
    architecture: {
      summary:
        'A photo comes in through the interface. If it is an image, a dedicated preparation service finds and straightens the document and returns a clean scan. OCR reads the text, a language model extracts title and sender. The finished record is filed, emits an event on the event bus, and becomes available to the knowledge layer through a token-secured internal search interface. If preparation fails, the original is filed instead.',
      tiers: [
        {
          label: 'Intake',
          nodes: [
            {
              id: 'upload',
              label: 'Photo upload',
              note: 'browser',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Preparation & extraction',
          nodes: [
            {
              id: 'vision',
              label: 'Image preparation',
              note: 'own service, de-skewed scan',
              kind: 'core',
            },
            {
              id: 'ocr',
              label: 'OCR',
              note: 'full text from the scan',
              kind: 'core',
            },
            {
              id: 'llm',
              label: 'LLM extraction',
              note: 'title and sender',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Storage',
          nodes: [
            {
              id: 'store',
              label: 'Record storage',
              note: 'searchable',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Consumers',
          nodes: [
            {
              id: 'bus',
              label: 'Event bus',
              note: 'scan done',
              kind: 'consumer',
            },
            {
              id: 'search',
              label: 'Internal search interface',
              note: 'token-secured',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'upload',
          to: 'vision',
          label: 'only for images',
        },
        {
          from: 'vision',
          to: 'ocr',
          label: 'de-skewed scan',
        },
        {
          from: 'ocr',
          to: 'llm',
          label: 'full text',
        },
        {
          from: 'llm',
          to: 'store',
        },
        {
          from: 'store',
          to: 'bus',
          label: 'event',
        },
        {
          from: 'store',
          to: 'search',
          label: 'for knowledge layer',
        },
      ],
    },
    result: [
      'A letter shot at an angle becomes a filed entry with recognized title, sender and usable full text, no manual rework.',
      'Image preparation, OCR and storage run entirely inside my own network: no cloud DMS, no third-party mailbox.',
      'Through the token-secured internal interface, every finished scan is part of the cross-cutting knowledge layer, searchable alongside every other source.',
      'The path is fault-tolerant: if image preparation does not take, the original lands in the system rather than an error.',
    ],
    decisions: [
      {
        title: 'Classic image preparation before the language model',
        body: 'Finding and straightening a document is something deterministic computer vision does more reliably and more cheaply than a model, and in a dedicated, separately tunable service. The language model only steps in where understanding is needed: title and sender from the full text. You pay for model capability only where it actually counts.',
      },
      {
        title: 'Fallback instead of error message',
        body: 'An image pipeline can fail on a bad photo. Rather than reject the upload, the system files the original. The user always gets a result: preparation is an improvement, not a gate.',
      },
      {
        title: 'Integration via event bus and internal search',
        body: 'Instead of running the mailbox as an island, it emits an event for every scan and exposes a token-secured internal search. That folds the archive into the cross-cutting knowledge layer, with no other service ever needing to know the raw backend.',
      },
    ],
    metrics: [
      {
        label: 'Image preparation',
        value: 'own service, upstream',
      },
      {
        label: 'Data storage',
        value: 'entirely on my own hardware',
      },
      {
        label: 'Integration',
        value: 'event bus and internal search',
      },
    ],
    lessons: [
      'Cutting image preparation into its own service pays off: you can see at a glance whether the straightening or the OCR is costing you quality, and tune that step alone.',
      'Classic computer vision and a language model are not rivals; they split the work by strength: the model never has to straighten, the preparation never has to understand.',
      'A robust fallback decides whether a pipeline like this gets used at all: hit a dead end once and you stop taking photos.',
    ],
    timeline: [
      { when: '2026 H1', what: 'Image preparation as its own upstream service, then OCR and LLM extraction' },
      { when: '2026 H1', what: 'Event-bus notification per scan and a token-secured internal search for the knowledge layer' },
      { when: 'later', what: 'Preparation and extraction tuned photo by photo, robust fallback as the default' },
    ],
  },
  'news-engine': {
    problem:
      'Take several news sources seriously and you drown in duplicates: the same event shows up tenfold, in several languages, with different spin. An aggregator that only counts articles rewards the loudest single post instead of the most broadly corroborated fact. The obvious fix, letting a strong language model handle every step, is unaffordable for continuous operation and makes running costs impossible to predict. I wanted the opposite: an engine that understands stories, not articles, with a cloud bill that sits at zero in normal operation.',
    approach: [
      'Every item is first enriched locally and deterministically (language, entities, location, and a relevance signal that separates supra-regional significance from purely local noise), all before any money is spent.',
      'Own embeddings give incremental clustering its semantic basis: similar items land in the same story across language boundaries, with category and time-window bounds to guard against false merges.',
      'A multi-signal story scorer weights by source count, trend and source quality, so broad corroboration beats a single high score.',
      'An explicit cost layer separates cheap volume from expensive top-end: a router picks local or cloud per step, a budget guard enforces hard daily and monthly caps, a call log records every external call, and a deterministic fallback takes over the moment the strong model is off or capped.',
      'The data layer was laid down additively beside the existing one and tested against a live copy, so the rebuild to the story layer never touched the running operation.',
    ],
    architecture: {
      summary:
        'Incoming items pass first through a local enrichment and filter stage, then via own embeddings into incremental clustering that bundles them into stories across language and source; a multi-signal scorer condenses each story, and only the few demanding steps take the cost layer of router, budget guard and call log out to a cloud model, while a deterministic fallback carries standard operation at no external cost.',
      tiers: [
        {
          label: 'Intake',
          nodes: [
            {
              id: 'feeds',
              label: 'Source feeds',
              note: 'many origins',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Local pre-stage',
          nodes: [
            {
              id: 'enrich',
              label: 'Enrichment',
              note: 'language · entities · location',
              kind: 'core',
            },
            {
              id: 'filter',
              label: 'Relevance filter',
              note: 'supra-regional vs. noise',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Story formation',
          nodes: [
            {
              id: 'embed',
              label: 'Own embeddings',
              note: 'local · cross-lingual',
              kind: 'core',
            },
            {
              id: 'cluster',
              label: 'Incremental clustering',
              note: 'story assignment',
              kind: 'core',
            },
            {
              id: 'scorer',
              label: 'Story scorer',
              note: 'multi-source beats single',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Cost layer',
          nodes: [
            {
              id: 'router',
              label: 'Model router',
              note: 'local or cloud',
              kind: 'core',
            },
            {
              id: 'guard',
              label: 'Budget guard',
              note: 'hard caps',
              kind: 'core',
            },
            {
              id: 'log',
              label: 'Call log',
              kind: 'core',
            },
            {
              id: 'fallback',
              label: 'Local fallback',
              note: 'deterministic',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Models & storage',
          nodes: [
            {
              id: 'cloud',
              label: 'Cloud editor-in-chief',
              note: 'top-end only',
              kind: 'data',
            },
            {
              id: 'store',
              label: 'Story store',
              note: 'provenance · cost per story',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'feeds',
          to: 'enrich',
        },
        {
          from: 'enrich',
          to: 'filter',
          label: 'before cloud cost',
        },
        {
          from: 'filter',
          to: 'embed',
        },
        {
          from: 'embed',
          to: 'cluster',
          label: 'semantic',
        },
        {
          from: 'cluster',
          to: 'scorer',
          label: 'per story',
        },
        {
          from: 'scorer',
          to: 'router',
          label: 'only demanding steps',
        },
        {
          from: 'router',
          to: 'cloud',
          label: 'under budget',
        },
        {
          from: 'router',
          to: 'fallback',
          label: 'standard · 0 cost',
        },
        {
          from: 'guard',
          to: 'router',
          label: 'cap reached',
        },
        {
          from: 'scorer',
          to: 'store',
          label: 'with provenance',
        },
      ],
    },
    result: [
      'The story layer is live as the first build-out stage: similar items from different sources come together in one story, while locally trivial material stays apart.',
      'Standard operation costs nothing externally, because the deterministic fallback carries the volume and the cloud model only switches in behind hard caps.',
      'Every story carries its provenance and its cost: you can trace which sources back it and whether it was condensed externally at all.',
      'The data layer was laid down additively beside the existing one; the running operation stayed untouched through the rebuild.',
    ],
    decisions: [
      {
        title: 'Local as default, cloud as exception',
        body: 'The expensive cloud is the last resort, not the default: behind router, budget guard and call log. Quality stays available where it counts, without the running bill scaling with the article count.',
      },
      {
        title: 'Relevance filter before any spend',
        body: 'A local stage first separates supra-regional significance from noise, then the engine decides how much effort to spend. No money goes to items that get sorted out anyway.',
      },
      {
        title: 'Stories, not articles, as the unit',
        body: 'The condensation weights by source count, trend and source quality, so a broadly corroborated fact stands ahead of a single high score. That is what separates an engine from an aggregator.',
      },
    ],
    metrics: [
      {
        label: 'External cost in standard operation',
        value: '0 €',
      },
      {
        label: 'Cloud calls',
        value: 'behind hard daily and monthly caps',
      },
      {
        label: 'Clustering',
        value: 'cross-lingual via own embeddings',
      },
      {
        label: 'Build-out stage',
        value: 'story layer live, more to follow',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Story layer live: local enrichment, clustering, multi-signal scorer, cost layer',
      },
      {
        when: '2026 H1',
        what: 'Additive data layer tested against a live copy, deterministic fallback as default',
      },
      {
        when: '2026 H2',
        what: 'Sharper story scoring, batch processing of condensations, connecting further consumers',
      },
    ],
    lessons: [
      'A cost layer belongs in the architecture, not in the operating manual. Router, budget guard and call log in the path force the expensive cloud into the exception, instead of relying on discipline at runtime.',
      'A deterministic fallback is more than a saving measure: it keeps the engine fully functional even when the strong model is off or capped.',
      'Lay the data layer down beside the existing one and test against a live copy, and you can rebuild to the story layer without risking the running operation.',
    ],
  },
  concierge: {
    problem:
      'An off-the-shelf assistant means every request goes to the cloud: running cost for trivia, your language and personal knowledge in someone else’s hands, and no reliable brake on actions that change the system. I wanted to own the assistant core: run it locally, route it cost-consciously by model tier, and build it so a risky action like a restart never happens without explicit approval.',
    approach: [
      'A single intake gateway unifies text, voice transcript and API requests; a fast classifier reads intent without executing anything itself.',
      'An orchestrator decides per request on model role, knowledge space and tool authorization: everyday tasks and the daily briefing run on a small local model at no external cost, demanding steps go deliberately to a strong one.',
      'Every action runs over exactly one tool bus: schema check, content validation, timeout, risk tier and a traceable audit log. There is no second way to trigger an action.',
      'A risky operation produces a persistent approval request with an expiry instead of an execution, and only goes live through a separate confirmation step; an already-confirmed faked into the call is deliberately rejected.',
      'A knowledge layer picks the right space per question with a documented rationale; an incremental briefing pool keeps candidates current by freshness, source and feedback.',
    ],
    architecture: {
      summary:
        'Voice, text and API inputs meet a shared gateway, an intent step classifies without executing, an orchestrator picks model tier and knowledge space, and every action runs exclusively over a tool bus with risk tier and audit: a risky action produces a persistent approval instead of an immediate execution, while the knowledge layer and briefing pool supply context.',
      tiers: [
        {
          label: 'Intake',
          nodes: [
            {
              id: 'voice',
              label: 'Voice intake',
              note: 'transcript',
              kind: 'edge',
            },
            {
              id: 'text',
              label: 'Text and API intake',
              kind: 'edge',
            },
            {
              id: 'gateway',
              label: 'Intake gateway',
              note: 'unified',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Decision',
          nodes: [
            {
              id: 'intent',
              label: 'Intent classification',
              note: 'executes nothing',
              kind: 'core',
            },
            {
              id: 'orchestrator',
              label: 'Orchestrator',
              note: 'model role and knowledge space',
              kind: 'core',
            },
            {
              id: 'toolbus',
              label: 'Tool bus',
              note: 'schema, risk tier, audit',
              kind: 'core',
            },
            {
              id: 'approval',
              label: 'Approval stage',
              note: 'persistent, with expiry',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Model tiers',
          nodes: [
            {
              id: 'small',
              label: 'Local model',
              note: 'everyday, briefing',
              kind: 'consumer',
            },
            {
              id: 'large',
              label: 'Strong model',
              note: 'the demanding',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Knowledge and context',
          nodes: [
            {
              id: 'rag',
              label: 'Knowledge layer',
              note: 'space per question',
              kind: 'data',
            },
            {
              id: 'briefing',
              label: 'Briefing pool',
              note: 'scoring, eviction',
              kind: 'data',
            },
            {
              id: 'audit',
              label: 'Audit log',
              note: 'every action',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'voice',
          to: 'gateway',
          label: 'transcript',
        },
        {
          from: 'text',
          to: 'gateway',
        },
        {
          from: 'gateway',
          to: 'intent',
          label: 'classified',
        },
        {
          from: 'intent',
          to: 'orchestrator',
          label: 'intent',
        },
        {
          from: 'orchestrator',
          to: 'small',
          label: 'everyday, local',
        },
        {
          from: 'orchestrator',
          to: 'large',
          label: 'deliberately external',
        },
        {
          from: 'orchestrator',
          to: 'rag',
          label: 'knowledge space',
        },
        {
          from: 'orchestrator',
          to: 'toolbus',
          label: 'action',
        },
        {
          from: 'toolbus',
          to: 'approval',
          label: 'if risky',
        },
        {
          from: 'toolbus',
          to: 'audit',
          label: 'logged',
        },
      ],
    },
    result: [
      'Trivia and the daily briefing run on the local model at no external cost; the strong model is pulled only for the few demanding steps.',
      'A risky action like a host restart cannot run without an explicit, separate approval, not even from a client that fakes a confirmation.',
      'Every executed action sits traceably in the audit log; the knowledge layer picks the space per question with a documented rationale.',
      'The health check draws an honest line between mandatory building blocks and optional upstreams: if an optional service fails, the local voice core still reads as healthy rather than being flagged broken.',
    ],
    decisions: [
      {
        title: 'Exactly one path for actions',
        body: 'Actions run exclusively over the tool bus: schema, validation, timeout, risk tier and audit. The classifier deliberately executes nothing. There is no second, unchecked door for an action to slip through.',
      },
      {
        title: 'Approval instead of trust',
        body: 'A risky tool returns a persistent approval request with an expiry rather than an execution, going live only via a separate confirmation step. An already-confirmed faked into the call is rejected, so the approval path cannot be bypassed.',
      },
      {
        title: 'Cost through model tiers, not a saving mode',
        body: 'Rather than send everything to the cloud, the orchestrator decides per request: local model for everyday tasks and the briefing, strong model only where quality counts. Cost control comes from the architecture, not a downstream limit.',
      },
    ],
    lessons: [
      'One execution path for actions beats many scattered safety prompts: what can only pass through a single door can be checked and logged in one place.',
      'Health checks have to separate mandatory from optional dependencies, or an optional failure will falsely report the whole core as broken.',
      'Decide locally and deterministically what needs an expensive answer before the model call, and costs stay low on their own.',
    ],
    metrics: [
      { label: 'Model tiers', value: 'local for everyday · strong only deliberately' },
      { label: 'Action path', value: 'one tool bus · schema · risk tier · audit' },
      { label: 'Risky action', value: 'persistent approval with expiry' },
      { label: 'Intakes', value: 'voice · text · API unified' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Intake gateway, intent classification and tool bus with audit in place' },
      { when: '2026 H1', what: 'Model tiers local/strong, risky actions only via persistent approval' },
      { when: '2026 H2', what: 'Per-question knowledge layer and incremental briefing pool wired in' },
      { when: 'later', what: 'Further tools and knowledge spaces attach to the same checked path' },
    ],
  },
  'defense-in-depth': {
    problem:
      'A self-operated infrastructure is only as secure as its weakest layer. Set a few headers or park a firewall out front and you have hardened one layer while leaving all the rest open: privileged containers, flat networks, shared identity, untested backups. I wanted the opposite: a defense that ties together container, network, edge, identity and recovery, documented per exception rather than pointwise, and operationally ready rather than configured once.',
    approach: [
      'Containers minimally privileged by default: read-only root, dropped capabilities, no root, no new privileges. Docker access only through restricted proxies, every exception justified and kept in an inventory instead of hidden.',
      'Network cut into zones (ingress, brain, apps, ops) with one rule per container. A dedicated watcher streams connection joins against an approved whitelist and flags every unauthorized join in real time; sensitive service-to-service paths are additionally authenticated both ways via an mTLS sidecar.',
      'Identity centralized via Authelia (SSO/OIDC), sign-in protection with lockout windows, and a real-IP fix so the true client address gets logged behind the edge instead of the tunnel address.',
      'Intrusion detection at the edge with Crowdsec, deliberately detection-only: anomalies push over my own event bus, and automatic banning stays bound to manual approval to rule out self-inflicted harm to productive infrastructure.',
      'Encrypted off-site backup (restic) per host with separate repos and a recurring restore drill, so recovery is proven, not just documented.',
    ],
    architecture: {
      summary:
        'Identity and access terminate at the edge and get checked via SSO before requests reach the zone-cut services; each service runs minimally privileged with Docker access only through a proxy, a detection layer of network watcher and intrusion detection pushes anomalies over the event bus, and a resilience layer of encrypted off-site backup and restore drill sits crosswise beneath it all.',
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
              note: 'Authelia · sign-in protection',
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
              note: 'Crowdsec · detection-only',
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
              note: 'restic · encrypted',
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
      'Container hardening across the whole fleet effectively complete, remaining exceptions justified as standing ones and kept in an inventory instead of silently tolerated.',
      'Network segmented into four zones with one rule per container, drift detection live across multiple hosts, unauthorized connections announcing themselves in real time on the event bus.',
      'Central SSO with tightened sign-in protection and real client-IP logging behind the edge, audit-relevant services retained long-term in the audit stream.',
      'Encrypted off-site backup per host with separate repos and an automated restore drill, recovery proven rather than merely planned.',
    ],
    decisions: [
      {
        title: 'Detection-only instead of automatic banning',
        body: 'Intrusion detection at the edge runs deliberately without an active blocking mechanism. A live auto-ban behind the edge could have taken down my own tunnel or productive services on a mislogged source address. Detection and push notification are live; the active banning stays bound to a deliberate approval: detection without self-harm.',
      },
      {
        title: 'Hardening in waves with an exception inventory',
        body: 'Instead of a big bang, each wave takes on a clearly bounded container class. Images that cannot run read-only are kept as standing exceptions with a justification, rather than letting the hardening fail on them. A documented exception is more honest than a silent one.',
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
    lessons: [
      'Security is not a feature but a property of every layer. One hardened spot with the rest left open is a false sense of security.',
      'Detection must not break anything. Detection-only with a human in the loop protects productive infrastructure from the own goal of an overeager auto-ban.',
      'A backup that has never been restored is a guess. Only the recurring restore drill turns hoped-for into proven.',
      'Recovery needs a second opinion too: an independent outpost that cross-checks backups and reachability from outside the cluster catches the case where the cluster itself can no longer raise the alarm.',
    ],
  },
  'ops-cockpit': {
    problem:
      'A growing fleet of several hosts eventually outgrows SSH and dashboard-hopping. To know what is running right now, you would log into each host, read off load and temperature one by one, restart containers one by one. And that very reflex, opening a host shell for convenience, is the biggest security risk of all. I wanted a central operator view over the whole fleet, one where hardening consistently comes before comfort.',
    approach: [
      'A dedicated interface as a control plane over the fleet: live metrics for every host via Prometheus (load, temperature, memory, disk), service control and container logs in one place.',
      'Access to a host is never direct, always through a hardened Docker socket proxy with minimal rights and container exec disabled, so the control never becomes an entry point.',
      'Firewall-lock access down to exactly one control plane, on the chain that actually catches published container ports, and set the lock before the intermediary layer is even reachable.',
      'Anchor the lock as a systemd-backed service coupled to the container stack, so it survives reboot and restart instead of opening an exposure window after every boot.',
      'Detect drift between expected and actual service state, but deliberately treat intentionally retired services as expected instead of raising an alarm.',
    ],
    architecture: {
      summary:
        'The browser talks only to the dedicated interface, which aggregates metrics and service status server-side; every access to a host runs through a hardened intermediary layer without container exec, firewall-locked to exactly one control plane and reboot-proof anchored, while a metric source per host feeds the live values and a service map supplies the target state for the drift comparison.',
      tiers: [
        {
          label: 'Browser',
          nodes: [
            {
              id: 'ui',
              label: 'Control interface',
              note: 'Next.js · metrics · logs',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Control plane',
          nodes: [
            {
              id: 'control',
              label: 'Control backend',
              note: 'server-side access',
              kind: 'core',
            },
            {
              id: 'drift',
              label: 'Drift comparison',
              note: 'target vs. actual',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Hardened access',
          nodes: [
            {
              id: 'proxy',
              label: 'Socket intermediary',
              note: 'Docker socket proxy · no exec',
              kind: 'core',
            },
            {
              id: 'fw',
              label: 'Firewall lockdown',
              note: 'one source, reboot-proof',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Per host',
          nodes: [
            {
              id: 'metrics',
              label: 'Metric source',
              note: 'Prometheus · load · temp',
              kind: 'data',
            },
            {
              id: 'services',
              label: 'Container services',
              kind: 'consumer',
            },
            {
              id: 'map',
              label: 'Service map',
              note: 'expected state',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'ui',
          to: 'control',
          label: 'only own interface',
        },
        {
          from: 'control',
          to: 'proxy',
          label: 'behind lockdown',
        },
        {
          from: 'fw',
          to: 'proxy',
          label: 'one source allowed',
        },
        {
          from: 'proxy',
          to: 'services',
          label: 'control without exec',
        },
        {
          from: 'metrics',
          to: 'control',
          label: 'live values',
        },
        {
          from: 'map',
          to: 'drift',
          label: 'target comparison',
        },
      ],
    },
    result: [
      'A central operator view over the whole fleet: live metrics, service control and container logs for every host in one place, no per-host login.',
      'Remote control exclusively through the hardened intermediary layer: exec disabled, access firewall-locked to one control plane, foreign access blocked.',
      'The lockdown survives reboot and restart because it is coupled to the container stack and takes effect before the intermediary layer, not after.',
      'Drift detection that deliberately respects intentionally retired services: false alarms from expected retirements were brought to zero.',
    ],
    decisions: [
      {
        title: 'Hardening before comfort: no host shell',
        body: 'A remote terminal would be convenient, which is exactly why it is dangerous. The interface controls services and reads logs, but it deliberately opens no shell and disables container exec. Comfort that opens up the attack surface stays out.',
      },
      {
        title: 'Lockdown on the right chain, reboot-proof',
        body: 'Published container ports bypass the usual host firewall, so the lock sits on the chain that actually catches container traffic and lets only one control plane through. As a systemd-backed service coupled to the container stack, it survives reboot and restart instead of opening a window after every boot.',
      },
      {
        title: 'Drift respects the expected state',
        body: 'A stopped service is not automatically an error. The service map carries the target state, deliberate retirements included, and the comparison flags only real deviations as drift. That keeps the display honest instead of noisy.',
      },
    ],
    metrics: [
      {
        label: 'Control',
        value: 'multi-host, one interface',
      },
      {
        label: 'Remote access',
        value: 'without container exec',
      },
      {
        label: 'Lockdown',
        value: 'reboot-proof, one source',
      },
      {
        label: 'False alarms',
        value: 'brought to zero',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Control interface with live metrics of all hosts, server-side access',
      },
      {
        when: '2026 H1',
        what: 'Remote control and logs through hardened intermediary layer, firewall lockdown reboot-proof anchored',
      },
      {
        when: '2026 H2',
        what: 'Drift and ghost detection respecting the expected state, further growing fleet connected',
      },
    ],
    lessons: [
      'Published container ports bypass the usual host firewall. Assume them safe and you leave a gap open that no classic firewall command closes.',
      'A lock that does not survive a reboot is not a lock. Persistence belongs coupled to the container stack, not re-applied by hand.',
      'Drift detection is only worth as much as its target state. Without respect for deliberate retirements it just produces noise you eventually look past.',
    ],
  },
  gartiko: {
    problem:
      'Plant-care knowledge lived scattered: in a community bot, in notes, in people’s heads. Anyone caring for a plant needs inventory, care phases and knowledge in one place, and as a publicly reachable product, not an internal tool. At the same time, a public portal on your own infrastructure must show no administration surface to the outside: operation has to be exposable without exposing the care interface along with it.',
    approach: [
      'Web portal (PHP behind Apache) and community bot share one substrate: a shared SQLite database as the knowledge base, so content is maintained once and lands on both surfaces.',
      'A species atlas as the care backbone: per plant species, care defaults (height range, growth curve, phases) are stored, from which a species picker pulls sensible presets when adding a plant instead of empty fields. The atlas has grown from a handful to dozens of species.',
      'The same atlas feeds the community answers: questions are answered species-accurately from the stored data instead of generically, and for species without their own entry that is honestly flagged as such.',
      'The public part runs behind a tunnel edge on my own infrastructure: no open ports at the home connection, TLS and a protective layer at the edge, and in the PHP runtime itself dangerous functions (exec, shell_exec and the like) are hard-disabled.',
      'The admin path is hard-rejected right at the public edge and only reachable from my own network; the separation sits in the route, not in a login form.',
      'Inventories, care phases and reminders are cut as their own data model, so the portal carries plants of all kinds generically instead of clinging to a niche.',
    ],
    architecture: {
      summary:
        'Visitors reach the portal via a tunnel edge that terminates TLS and rejects the admin path. Behind it sits the web application, which shares database and knowledge base with the community bot. The care interface is only reachable from my own network.',
      tiers: [
        {
          label: 'Public',
          nodes: [
            { id: 'visitor', label: 'Visitor', kind: 'edge' },
            { id: 'edge', label: 'Tunnel edge', note: 'TLS · admin path blocked', kind: 'edge' },
          ],
        },
        {
          label: 'Application',
          nodes: [
            { id: 'web', label: 'Web portal', note: 'PHP · Apache', kind: 'core' },
            { id: 'bot', label: 'Community bot', note: 'same knowledge base', kind: 'core' },
          ],
        },
        {
          label: 'Data',
          nodes: [
            { id: 'db', label: 'Database', note: 'SQLite · inventories + phases', kind: 'data' },
            { id: 'wissen', label: 'Knowledge base', note: 'curated', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'visitor', to: 'edge', label: 'HTTPS' },
        { from: 'edge', to: 'web', label: 'public routes only' },
        { from: 'web', to: 'db' },
        { from: 'web', to: 'wissen', label: 'reads curated' },
        { from: 'bot', to: 'wissen', label: 'same source' },
      ],
    },
    result: [
      'The portal is publicly reachable under its own domain and runs entirely on my own infrastructure.',
      'Web interface and community bot draw from the same knowledge base; content is maintained once, not twice.',
      'The species atlas now carries dozens of plant species with stored care defaults; the species picker turns them into sensible presets when adding a plant instead of empty fields.',
      'The admin area is unreachable from outside: the boundary sits at the edge, not in the login form.',
    ],
    decisions: [
      {
        title: 'Generic instead of niche',
        body: 'The data model is deliberately cut for plants of all kinds. A generic model carries any future direction; a niche model would have forced a rebuild at the first pivot.',
      },
      {
        title: 'A species atlas as the care backbone',
        body: 'Instead of typing care values per plant freely, they sit per species in the atlas: height, growth curve, phases. The species picker pulls presets from it, and the same data makes the community answers species-accurate instead of generic. One source, two uses.',
      },
      {
        title: 'Admin lock at the edge instead of in the app',
        body: 'The administration path is rejected right at the public edge. A login form would have been an attack surface; a route that does not exist from outside is not.',
      },
      {
        title: 'One substrate for two surfaces',
        body: 'Bot and portal share knowledge base and operation. Two separate systems would have meant double maintenance and content that drifts apart.',
      },
    ],
    timeline: [
      { when: 'H1 2026', what: 'Portal public under its own domain, edge hardening' },
      { when: 'Q2 2026', what: 'Generic plant data model, community connection' },
      { when: 'Q2 2026', what: 'Species atlas with care defaults, species picker, species-accurate answers' },
      { when: 'later', what: 'further care domains and species on the same substrate' },
    ],
    metrics: [
      { label: 'Reach', value: 'public · own domain · own infrastructure' },
      { label: 'Species atlas', value: 'dozens of species with care defaults' },
      { label: 'Knowledge base', value: 'one source · portal + bot' },
      { label: 'Admin', value: 'blocked at the edge · own network only' },
    ],
    lessons: [
      'A public product on your own infrastructure is feasible if the administration surface is never exposed along with it from the start.',
      'Two surfaces on one knowledge base keep content honest: what the bot knows, the portal shows too, and vice versa.',
      'Storing care defaults per species beats free input fields: the user starts with sensible values, and the same data carries the species-accurate answers at once.',
    ],
  },
  rackforge: {
    problem:
      'For a shop selling 3D-printed parts, no standard shop system fits cleanly: the same shape comes in many colors, much of it is only printed to order, and the inventory is not finished articles on a shelf but filament rolls and a few pre-produced pieces. A kit shop forces this model into its article logic and then you fight the platform instead of working with it. I wanted to build the whole shop myself: own data model, own checkout, own inventory rules that fit make-to-order.',
    approach: [
      'A dedicated product catalog with detail pages generated from the master data, so a product change is made in one place and the rest follows.',
      'A color-aware cart: the same shape in different colors is its own line item; the cart key carries article and color separately, so nothing gets falsely merged.',
      'An inventory engine that keeps filament rolls and finished printed parts apart: not in stock means made to order, not sold out, and a completed print is booked against the inventory.',
      'A self-written upload path for uploaded print files, with an own multipart parser that hard-enforces allowed formats and a size limit rather than leaning on a third-party library.',
      'A token-protected admin, a honeypot against bot orders and an export to the common shop format, so the custom build stays connectable.',
    ],
    architecture: {
      summary:
        'The browser talks to a dedicated shop backend that carries catalog, color-aware cart and checkout; a self-written upload path checks uploaded files against format and size limits, an inventory engine keeps filament and finished parts separate and books prints, and a token-protected admin plus an export to the common shop format sit alongside.',
      tiers: [
        {
          label: 'Storefront',
          nodes: [
            { id: 'catalog', label: 'Product catalog', note: 'generated detail pages', kind: 'edge' },
            { id: 'cart', label: 'Cart', note: 'key: article + color', kind: 'edge' },
            { id: 'upload', label: 'File upload', note: 'own parser', kind: 'edge' },
          ],
        },
        {
          label: 'Shop backend',
          nodes: [
            { id: 'checkout', label: 'Checkout', note: 'own data model', kind: 'core' },
            { id: 'validate', label: 'Upload check', note: 'format · size', kind: 'core' },
            { id: 'admin', label: 'Admin', note: 'token-protected · honeypot', kind: 'core' },
          ],
        },
        {
          label: 'Inventory & data',
          nodes: [
            { id: 'filament', label: 'Filament inventory', kind: 'data' },
            { id: 'finished', label: 'Finished-part inventory', note: 'made to order when empty', kind: 'data' },
            { id: 'orders', label: 'Orders', kind: 'data' },
          ],
        },
        {
          label: 'Connection',
          nodes: [
            { id: 'export', label: 'Shop-format export', kind: 'consumer' },
            { id: 'notify', label: 'Order notification', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'catalog', to: 'cart', label: 'separate per color' },
        { from: 'cart', to: 'checkout' },
        { from: 'upload', to: 'validate', label: 'format · size' },
        { from: 'checkout', to: 'orders' },
        { from: 'orders', to: 'finished', label: 'print booked' },
        { from: 'orders', to: 'notify' },
        { from: 'orders', to: 'export' },
      ],
    },
    result: [
      'A complete shop without a shop framework: catalog, color-aware cart, checkout and inventory logic are all own code, not a plugin tangle.',
      'The inventory engine maps make-to-order cleanly: not in stock means orderable rather than sold out, and a completed print is booked against the inventory.',
      'The own upload path accepts uploaded print files and rejects anything outside the allowed format or over the size limit.',
      'The shop is in pre-launch and the model holds: token admin, honeypot and an export to the common shop format are in place.',
    ],
    decisions: [
      {
        title: 'Custom build instead of a shop kit',
        body: 'A standard shop would have pressed the model of colors, make-to-order and filament inventory into its article logic. A dedicated, lean data model maps exactly this case without fighting the platform.',
      },
      {
        title: 'Color in the cart key',
        body: 'The same shape in two colors is two line items, not a quantity of two. Keeping color and article separate in the cart key prevents the silent merging that a generic shop trips over.',
      },
      {
        title: 'Own upload parser with hard limits',
        body: 'Uploaded files are an attack surface. A self-written multipart parser that only passes allowed formats and a fixed size limit keeps control in my own code instead of handing it to a third-party library.',
      },
    ],
    metrics: [
      { label: 'Shop framework', value: 'none, custom build' },
      { label: 'Inventory', value: 'filament and finished parts separate' },
      { label: 'Upload', value: 'own parser, format and size limit' },
      { label: 'Status', value: 'pre-launch, model holds' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Own data model, catalog with generated detail pages, color-aware cart' },
      { when: '2026 H1', what: 'Inventory engine for filament and finished parts, own file upload, token admin' },
      { when: '2026 H2', what: 'Product images, checkout polish, transition into productive operation' },
    ],
    lessons: [
      'When the business model does not fit a standard shop’s article logic, the custom build is often the shorter path than the endless fight against the platform.',
      'Variant handling stands or falls with the key: keeping color and article separate prevents silent mis-aggregation in the cart.',
      'File uploads are an attack surface, not a convenience feature. Format and size belong hard-enforced in your own code.',
    ],
  },
  'cms-baukasten': {
    problem:
      'Small websites need content management, but a heavyweight third-party CMS is oversized for a simple site: constant updates, a large attack surface, more plugin than content. At the same time, you do not want to rebuild every small site from scratch. I wanted my own, deliberately lean foundation: enough to maintain content comfortably, and cut so a new site becomes a configuration question instead of a rebuild.',
    approach: [
      'A dedicated, lean CMS (PHP behind Apache, MySQL database) as a template instead of a third-party system: only the building blocks a small content site really needs, but understandable and maintainable.',
      'A care interface reachable only from my own network; at the public edge the admin path is hard-rejected rather than relying on a password alone.',
      'The public part reads from a dedicated data store and is served fast and statically, separated from the writing admin path.',
      'Feature modules (contact form, newsletter, consent, imprint/privacy) are activated per site only when needed; the module loader is hardened against path tricks, so each page carries only what it truly needs.',
      'Beyond manual maintenance, articles can be ingested automatically over a token-authenticated ingest interface, so a blog generator, for one, feeds posts in without anyone opening the admin.',
      'Backed by a dedicated, lean test harness: fast unit tests without a database plus integration tests against a throwaway database, in place of a heavy test framework.',
      'A first site already runs on this foundation and a second now inherits the same image; from there the template is generalized so further sites inherit the same base.',
    ],
    architecture: {
      summary:
        'Visitors reach only the public, statically served part, which reads from a dedicated data store; the writing care interface is reachable only from my own network and is hard-rejected at the public edge, so the same template can be carried across multiple sites.',
      tiers: [
        {
          label: 'Public',
          nodes: [
            { id: 'edge', label: 'Reverse proxy', note: 'admin path rejected', kind: 'edge' },
            { id: 'public', label: 'Public site', note: 'statically delivered', kind: 'edge' },
          ],
        },
        {
          label: 'CMS core',
          nodes: [
            { id: 'render', label: 'Delivery layer', note: 'reads content', kind: 'core' },
            { id: 'admin', label: 'Care interface', note: 'own network only', kind: 'core' },
          ],
        },
        {
          label: 'Data',
          nodes: [
            { id: 'store', label: 'Content store', kind: 'data' },
            { id: 'media', label: 'Media', kind: 'data' },
          ],
        },
        {
          label: 'Further sites',
          nodes: [
            { id: 'tenant', label: 'Further sites', note: 'inherit the template', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'edge', to: 'public', label: 'public only' },
        { from: 'public', to: 'render' },
        { from: 'render', to: 'store', label: 'reading' },
        { from: 'admin', to: 'store', label: 'writing, internal' },
        { from: 'store', to: 'tenant', label: 'template inherited' },
      ],
    },
    result: [
      'A dedicated, lean CMS foundation already carries two live sites on a shared image, rather than sitting on a heavyweight third-party system.',
      'The care interface is reachable only from my own network; the admin path is hard-rejected at the public edge.',
      'The public part stays fast and static, with the writing path separated from it.',
      'The template is cut so a new site inherits the base instead of being rebuilt.',
    ],
    decisions: [
      {
        title: 'Own lean CMS instead of a third-party heavyweight',
        body: 'For a small content site, a large third-party CMS is more attack surface and update burden than benefit. A dedicated, understandable foundation does exactly what is needed and stays maintainable.',
      },
      {
        title: 'Admin only in my own network, not just behind a password',
        body: 'A publicly reachable admin interface is a standing target. Rejecting the care path entirely at the edge, rather than parking it behind a password, removes the attack surface from the outset.',
      },
      {
        title: 'Built as a template, not a one-off',
        body: 'The first site is also the blueprint: what can be generalized becomes the template, so the next site inherits the same base instead of getting a fresh one.',
      },
    ],
    metrics: [
      { label: 'Base', value: 'own CMS · PHP · Apache · MySQL' },
      { label: 'Admin access', value: 'own network only' },
      { label: 'Delivery', value: 'public static' },
      { label: 'Goal', value: 'template for further sites' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Lean own CMS built, first live site migrated onto it' },
      { when: '2026 H1', what: 'Admin restricted to my own network, public part split off statically' },
      { when: '2026 H2', what: 'Generalization into a reusable template' },
    ],
    lessons: [
      'For a small site, a dedicated lean CMS is often safer and more maintainable than a large third-party system with its constant update burden.',
      'An admin interface does not belong on the public network. Rejecting it at the edge is stronger than any password in front of it.',
      'Think of the first site as a template and you save the rebuild on the second site.',
    ],
  },
  'edge-hosting': {
    problem:
      'Publicly reachable services and a private home network do not belong in the same network segment: an exposed web service that gets compromised must not stand in the same room as the private infrastructure. At the same time, you do not want to leave mail for your own domains permanently to a third-party mailbox. I wanted a public server that deliberately stands as a separate zone next to the home network, carries several sites under one uniform security posture, and takes over mail for the own domains itself.',
    approach: [
      'Stand up a dedicated public server (Debian) as a separate edge zone, deliberately away from the private home segment, so an exposed service never sits right next to the internal infrastructure.',
      'A TLS reverse proxy (Caddy with automatic TLS) terminates all domains and forwards only locally to the containers behind it, which open no port of their own to the outside.',
      'The services run hardened: read-only file system, dropped rights, write paths only through clearly named volumes, uniform across every site.',
      'A dedicated mail server (mailcow) takes over sending and receiving for the own domains instead of leaving it to a third-party mailbox.',
      'The server doubles as an off-site position, physically separated from the home network.',
      'The edge location doubles as an independent outpost: from outside the home network an external watcher (Gatus) continuously checks the public reachability of all sites, verifies the off-site backups from a third location, and holds a dead-man switch that alerts over a home-independent channel if the home cluster goes quiet.',
    ],
    architecture: {
      summary:
        'At the public server, domains meet a TLS reverse proxy that terminates them and forwards only locally to hardened, read-only containers; a dedicated mail server carries sending and receiving for the own domains, and the whole zone stands deliberately separated from the private home segment as an off-site position.',
      tiers: [
        {
          label: 'Public',
          nodes: [
            { id: 'dns', label: 'Domains', kind: 'edge' },
            { id: 'proxy', label: 'TLS reverse proxy', note: 'Caddy · auto-TLS', kind: 'edge' },
          ],
        },
        {
          label: 'Edge zone',
          nodes: [
            { id: 'sites', label: 'Site containers', note: 'read-only · dropped rights', kind: 'core' },
            { id: 'mail', label: 'Own mail server', note: 'mailcow · sending + receiving', kind: 'core' },
          ],
        },
        {
          label: 'Data',
          nodes: [
            { id: 'vol', label: 'Volumes', note: 'clearly named write paths', kind: 'data' },
            { id: 'mbox', label: 'Mailboxes', kind: 'data' },
          ],
        },
        {
          label: 'Separation',
          nodes: [
            { id: 'isolation', label: 'Separated from the home segment', note: 'off-site', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'dns', to: 'proxy', label: 'all domains' },
        { from: 'proxy', to: 'sites', label: 'local only' },
        { from: 'sites', to: 'vol' },
        { from: 'mail', to: 'mbox' },
        { from: 'sites', to: 'isolation', label: 'outside the home network' },
      ],
    },
    result: [
      'Publicly reachable services run in a deliberately separated edge zone, not in the same segment as the private infrastructure.',
      'A TLS reverse proxy terminates all domains and forwards only locally; the containers open no port of their own to the outside.',
      'A dedicated mail server carries sending and receiving for the own domains instead of leaving them to a third party.',
      'Several sites share the same, uniformly hardened substrate; the server also serves as an off-site position away from the home network.',
      'The edge location also serves as an independent outpost: it watches the public reachability of the sites from outside, verifies backups from a third location, and reports over a home-independent channel when the home network goes down.',
    ],
    decisions: [
      {
        title: 'Check from outside, not just from within',
        body: 'Monitoring that runs inside the same cluster it watches goes silent exactly when that cluster fails. The edge location already stands separate from the home network, so it takes on the counter-check from outside: reachability of the public sites, independent verification of the off-site backups, and a dead-man switch that alerts over a home-independent channel when nothing comes from home anymore.',
      },
      {
        title: 'Separate zone instead of extending the home network',
        body: 'Hanging public services into the home network would have placed a compromised web service right next to the private infrastructure. A dedicated server as a separate zone draws that boundary into the topology, not just a firewall rule.',
      },
      {
        title: 'Reverse proxy as the only public point',
        body: 'Only the proxy terminates TLS and is reachable; the containers behind it open no port of their own to the outside. A single, controlled entry point instead of many open services.',
      },
      {
        title: 'Own mail server for the own domains',
        body: 'Leaving mail permanently to a third-party mailbox gives control and data out of your hands. A dedicated mail server (mailcow) on the edge host keeps sending and receiving of the own domains under my own operation.',
      },
    ],
    metrics: [
      { label: 'Zone', value: 'separated from the home segment' },
      { label: 'Public entry', value: 'TLS reverse proxy only' },
      { label: 'Mail', value: 'own server, own domains' },
      { label: 'Containers', value: 'read-only, dropped rights' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Public server provisioned as a separate edge zone, TLS reverse proxy in front' },
      { when: '2026 H1', what: 'First sites migrated hardened, own mail server for the own domains' },
      { when: '2026 H2', what: 'Further sites onto the same substrate, off-site role solidified' },
      { when: '2026 H2', what: 'Edge location built out into an independent outpost: external reachability watcher, backup verification from outside, and a dead-man switch' },
    ],
    lessons: [
      'Exposed services belong topologically separated from the private network, not just held apart by a rule inside the same segment.',
      'A single public entry point is easier to secure than many open ports, each maintained on its own.',
      'Running your own mail server is effort, but it keeps sending and receiving of the own domains under your control instead of in someone else’s hands.',
      'Monitoring from outside catches exactly the case an internal one never sees: if the whole cluster fails, only an independent location can still raise the alarm.',
    ],
  },

  'modell-vermittlung': {
    problem:
      'With every service that called a language model, the same problem grew in several places at once: each carried its own key, each hard-wired its own model, and nobody had a cost picture across the whole. A single service with a loop at the wrong moment would have quietly drained a month’s budget before anyone saw it. I wanted neither to keep separate billing per service nor to copy the same switching and failover code everywhere. It needed one place that all AI calls pass through, with a cap per service and a clear path for when one side falls away.',
    approach: [
      'One gate in front of all language models: a single endpoint that speaks both the Anthropic- and the OpenAI-compatible request format, so existing services run through it without a rewrite; they just point at a different address.',
      'Each consumer gets its own key with its own monthly budget as a runaway guard, plus a model allow-list. If a service runs hot, it hits its own cap, not everyone else’s budget.',
      'Hybrid routing by task instead of one blanket rule: cost-sensitive, frequent calls go to a locally run model that runs at no external cost; the few calls that need real cloud quality go to a cloud model. The choice lives in the gateway, not in the service.',
      'A documented fallback path: if the local model gives out under load, the gateway switches over to a small cloud model on its own instead of letting the call fail. The service only notices that it gets an answer.',
      'The container image is pinned by checksum, not to a moving tag, so that “what is running” stays reproducible and does not shift underneath.',
    ],
    architecture: {
      summary:
        'All AI-using services no longer talk to a model provider directly but to a central gateway. It checks the service’s own key, books against its monthly budget, picks by task between a locally run model and a cloud model, and falls back to a small cloud model on its own under overload. Outward it offers one endpoint in two common request formats, so existing things attach without a rewrite.',
      tiers: [
        {
          label: 'Consumers',
          nodes: [
            { id: 'chat', label: 'Community bot', kind: 'edge' },
            { id: 'watch', label: 'Market watcher', kind: 'edge' },
            { id: 'blog', label: 'Blog generator', kind: 'edge' },
            { id: 'brief', label: 'Daily briefing · everyday', kind: 'edge' },
          ],
        },
        {
          label: 'Gateway',
          nodes: [
            {
              id: 'gw',
              label: 'Central gate',
              note: 'key · budget · allow-list · router',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Models',
          nodes: [
            { id: 'local', label: 'Local model', note: 'no external cost', kind: 'consumer' },
            { id: 'cloud', label: 'Cloud model', note: 'only where needed', kind: 'consumer' },
            { id: 'fallback', label: 'Small cloud model', note: 'fallback under load', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'chat', to: 'gw', label: 'own key' },
        { from: 'watch', to: 'gw', label: 'own budget' },
        { from: 'blog', to: 'gw' },
        { from: 'brief', to: 'gw' },
        { from: 'gw', to: 'cloud', label: 'quality calls' },
        { from: 'gw', to: 'local', label: 'frequent calls' },
        { from: 'gw', to: 'fallback', label: 'under overload' },
      ],
    },
    result: [
      'Every AI call in the house runs through one gate: a single cost picture instead of scattered billing, a cap per service instead of a nasty surprise at month’s end.',
      'Existing services were rehung without a code rewrite; they just point at the gateway, because it speaks both common request formats.',
      'Steady-state operation costs nothing externally, because the bulk of calls run locally; cloud quality is bought deliberately only where a task truly needs it.',
      'If the local model gives out under load, the service still gets an answer; the fallback path is documented and kicks in on its own instead of letting the call fail.',
    ],
    decisions: [
      {
        title: 'One gate instead of a library in every service',
        body: 'Solving switching, budget and failover logic once in a gateway is more maintainable than copying the same code into every service. A service that already speaks the format just needs a new address and a key.',
      },
      {
        title: 'Two request formats at one endpoint',
        body: 'Because the gate accepts both the Anthropic- and the OpenAI-compatible format, existing services did not have to be rewritten onto a shared library. That cut the migration cost down to swapping an address and a key.',
      },
      {
        title: 'Budget per consumer, not global',
        body: 'A global cap would have let one outlier starve everyone else. A separate monthly budget per key confines the damage to the culprit and makes visible which service costs how much.',
      },
      {
        title: 'Local first, cloud on purpose',
        body: 'The gateway sends frequent, cost-sensitive calls to a locally run model and keeps the cloud model for the few tasks that justify its quality. Cost arises as a deliberate choice, not as the default path.',
      },
    ],
    timeline: [
      { when: '2026 H2', what: 'Central gateway placed as a thin gate in front of all language models' },
      { when: '2026 H2', what: 'Per-consumer keys with a monthly budget and a model allow-list' },
      { when: '2026 H2', what: 'Hybrid local/cloud routing plus a documented fallback path under overload' },
      { when: 'after', what: 'Further consumers attach without a rewrite, budgets grow with demand' },
    ],
    lessons: [
      'Putting a gateway in front of a third-party dependency costs little and gives much: one cost picture, one switching point and one failover path in a single place instead of in every service.',
      'Offering two common request formats at the same endpoint makes a migration cheap: existing things just point elsewhere.',
      'A budget per culprit protects better than a global cap, because it keeps the damage local and the cost visible.',
      'Local as the default, cloud as a deliberate exception, keeps running cost near zero without giving up quality where it counts.',
    ],
    metrics: [
      { label: 'Access', value: 'one endpoint · two request formats' },
      { label: 'Control', value: 'key + monthly budget per consumer' },
      { label: 'Routing', value: 'local first · cloud on purpose' },
      { label: 'Failover', value: 'automatic fallback path' },
    ],
  },
  'windows-ad-lab': {
    problem:
      'I run Linux every day; Windows Server and Active Directory I mostly knew from theory. For classic administration roles both are daily business: domains, user management, group policy. I am closing that gap in practice, with my own lab instead of just reading about it.',
    approach: [
      'An isolated lab on my own x86 virtualization cluster: a Windows Server as domain controller and a Windows client as separate virtual machines.',
      'Deliberately UEFI with Secure Boot instead of legacy BIOS, plus a virtual TPM; the machines run on demand rather than around the clock, to keep memory free for the production services.',
      'The domain build-out stands: the Active Directory role, DNS and my own domain are set up, along with the first organizational units, a test user and a security group; next come group policy in depth and joining the client to the domain.',
      'A cleanly documented build instead of a click-by-click guide, so the path stays understandable and repeatable.',
    ],
    architecture: {
      summary:
        'On one node of my own x86 virtualization cluster, two Windows machines run as separate virtual machines, both with UEFI, Secure Boot and a virtual TPM: a server in the domain controller role carrying the Active Directory domain with integrated DNS, and a client whose domain join is still pending. The directory holds the first organizational units, a test user and a security group; group policy follows. The lab runs on demand and yields to production load.',
      tiers: [
        {
          label: 'Virtualization',
          nodes: [
            { id: 'node', label: 'Cluster node', note: 'on demand, yields to production load', kind: 'edge' },
          ],
        },
        {
          label: 'Machines',
          nodes: [
            { id: 'dc', label: 'Domain controller', note: 'UEFI · Secure Boot · virtual TPM', kind: 'core' },
            { id: 'client', label: 'Client', note: 'domain join pending', kind: 'consumer' },
          ],
        },
        {
          label: 'Directory service',
          nodes: [
            { id: 'ad', label: 'Active Directory domain', kind: 'core' },
            { id: 'dns', label: 'Integrated DNS', kind: 'core' },
          ],
        },
        {
          label: 'Directory content',
          nodes: [
            { id: 'ou', label: 'Organizational units', kind: 'data' },
            { id: 'users', label: 'Users + groups', kind: 'data' },
            { id: 'gpo', label: 'Group policy', note: 'next up', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'node', to: 'dc', label: 'only when needed' },
        { from: 'node', to: 'client' },
        { from: 'dc', to: 'ad' },
        { from: 'dc', to: 'dns', label: 'integrated in the domain' },
        { from: 'ad', to: 'ou' },
        { from: 'ad', to: 'users' },
        { from: 'ad', to: 'gpo', label: 'follows' },
        { from: 'client', to: 'ad', label: 'join follows' },
      ],
    },
    result: [
      'The domain controller is up, the Active Directory domain stands with its own integrated DNS; the first organizational units, a test user and a security group exist.',
      'The client joins the domain next, and group policy follows in depth; the state stays honestly marked as in progress, without claiming more than already runs.',
    ],
    decisions: [
      {
        title: 'On demand instead of always on',
        body: 'The lab runs only while I work on it. That keeps memory free for the production services and fits its learning purpose.',
      },
      {
        title: 'UEFI and Secure Boot from the start',
        body: 'Closer to a real, current Windows environment than legacy BIOS, and a deliberate approach to firmware settings and a virtual TPM.',
      },
      {
        title: 'Alongside the Linux focus, not instead of it',
        body: 'The homelab stays Linux-centric. The Windows lab broadens practice into classic administration topics without shifting the focus.',
      },
    ],
    timeline: [
      { when: '2026 H2', what: 'Virtualization set up, Windows server and client VM boot-ready' },
      { when: '2026 H2', what: 'Domain controller live: Active Directory domain with integrated DNS, first organizational units, users and groups' },
      { when: 'next', what: 'Group policy in depth and joining the client to the domain' },
    ],
    lessons: [
      'Building your own environment forces you into details a guide skips over: firmware, Secure Boot, virtual TPM, drivers.',
      'Documenting honestly what already runs and what is still outstanding is worth more than a polished result.',
    ],
  },
  'media-vault': {
    problem:
      'A media library normally sits decrypted on disk, and the media server runs around the clock so you can watch it. Both are unnecessary: anyone who gets hold of the disk reads everything, and a service needed two hours a week still occupies memory permanently. I wanted the library to stay encrypted and open only when I actually use it.',
    approach: [
      'The library sits encrypted on disk and is mounted only on demand, instead of lying around permanently in the clear.',
      'A lean interface takes the unlock passphrase and passes it only transiently to the encryption layer; it is stored nowhere, neither on disk nor in a session.',
      'The media server follows the state of the library: it comes up once the library is mounted, and on lock it goes down again and the library is unmounted. One action, not two separate chores.',
      'Before the server starts, a check confirms that the decrypted library really is under the mount point, rather than an empty directory left behind by a mount that failed silently.',
      'Deliberately built without a web framework, on the language’s standard library alone: for a three-button interface sitting on top of a key, every extra dependency is attack surface without a return.',
      'Access stays confined to my own network; none of it is reachable from outside.',
    ],
    architecture: {
      summary:
        'The library sits encrypted on disk. A small interface on my own network takes the unlock passphrase and hands it transiently to the encryption layer, which exposes the cleartext directory in memory only. Only once a marker proves the library really is there does the media server come up. On lock it goes down and the directory is unmounted again.',
      tiers: [
        {
          label: 'Own network',
          nodes: [
            { id: 'ui', label: 'Unlock interface', note: 'passphrase transient, never stored', kind: 'edge' },
          ],
        },
        {
          label: 'Encryption',
          nodes: [
            { id: 'fs', label: 'Encryption layer', note: 'mounts on demand', kind: 'core' },
            { id: 'check', label: 'Marker check', note: 'is the library really there?', kind: 'core' },
          ],
        },
        {
          label: 'Service',
          nodes: [
            { id: 'server', label: 'Media server', note: 'follows the mount state', kind: 'consumer' },
          ],
        },
        {
          label: 'Data',
          nodes: [
            { id: 'cipher', label: 'Encrypted library', note: 'at rest', kind: 'data' },
            { id: 'plain', label: 'Cleartext view', note: 'only while in use', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'ui', to: 'fs', label: 'passphrase, transient' },
        { from: 'cipher', to: 'fs' },
        { from: 'fs', to: 'plain', label: 'mount' },
        { from: 'plain', to: 'check' },
        { from: 'check', to: 'server', label: 'only then start' },
        { from: 'ui', to: 'server', label: 'lock: shut down' },
      ],
    },
    result: [
      'By default the library is encrypted; it is decrypted only for as long as it is actually in use.',
      'Unlocking and locking are one action each: library and media server open together and close together, instead of being maintained separately.',
      'The unlock passphrase is only passed through and stored nowhere, not even in a session.',
      'A silently failed mount no longer leaves the media server starting against an empty directory and reporting the library as gone.',
      'The state stays honestly marked as in progress: the core works, the polish is still outstanding.',
    ],
    decisions: [
      {
        title: 'Encrypted as the default state, not as an add-on',
        body: 'A library that is only encrypted at shutdown lies open all day. Turned around, the resting state is encrypted and the cleartext view is the exception you deliberately create.',
      },
      {
        title: 'The service follows the data',
        body: 'A media server running while the library is closed reports an empty or broken collection to the user, and may write its catalogue blank. Tying it to the mount state turns two states into one.',
      },
      {
        title: 'Check first, then start',
        body: 'A mount can fail silently, and what sits underneath then is an empty directory that looks exactly like an empty directory. A marker inside the decrypted tree tells the two cases apart before the server starts.',
      },
      {
        title: 'No dependency without a return',
        body: 'For three buttons in front of a key, a web framework buys nothing but attack surface and patch duty. The standard library is enough, and what is not there does not need patching.',
      },
    ],
    metrics: [
      { label: 'Resting state', value: 'encrypted' },
      { label: 'Unlock passphrase', value: 'transient, never stored' },
      { label: 'Media server', value: 'runs only while unlocked' },
      { label: 'Third-party dependencies', value: 'none' },
    ],
    lessons: [
      'Encryption at rest buys little when the cleartext state is the everyday one. The question is not whether it is encrypted but how long it stays decrypted.',
      'When a service points at data that can disappear, it has to know that data’s state. Otherwise it may write its own catalogue against an empty directory.',
      'A silently failed mount is indistinguishable from an empty directory unless you explicitly look.',
    ],
  },
  'ressourcen-arbiter': {
    problem:
      'One node of the virtualization cluster was meant to carry seven heavy services, plus a Windows lab that gets brought up occasionally. There is only enough memory for one of those roles. They are almost never needed at the same time, but nobody knows in advance which one will be needed when. Both obvious answers are bad: running everything permanently blows the node and ultimately lets the kernel pick which process dies; starting and stopping everything by hand makes me the scheduler, and nothing is usable while I sleep. On top of that came a second requirement: the services had to be reachable from outside without opening a port on the home connection and without exposing its address.',
    approach: [
      'Every heavy role gets its own unprivileged guest on the node and runs there as a regular systemd service, not as a hand-started process in a session.',
      'A controller of my own schedules the node: it knows the roles as entries in a registry file rather than as special cases in code. Adding a role means writing an entry, not touching the controller.',
      'Instead of guessing whether a role is in use, the controller asks it for real occupancy: depending on the service, through the game network’s server query, through the service’s own admin console, or through the number of established connections on its port. Whatever has no users is switched off after twenty minutes.',
      'When someone requests a role, the controller evicts the running one, first checks free memory against a per-role floor, and shuts the old one down cleanly before the new one starts.',
      'Services that do not react cleanly to a termination signal, and would lose their state, get their own save and quit commands sent to the server console on shutdown instead of trusting the default path.',
      'Public access runs solely through a VPN tunnel to my own edge server, which forwards traffic to the guest. No port is open on the home router, and only the edge server’s address is visible from outside.',
      'Services that register themselves with a public directory would leak the home address in the process. For those, all outbound traffic from the guest goes through the tunnel, so the directory sees the edge server’s address; access from my own network stays direct via a routing rule.',
      'Every guest gets its own firewall rules: service ports only from the tunnel and the node, admin access only from my own network.',
      'Control runs through a small token-protected bridge inside my own network: from a chat command or a web interface that distinguishes waking a role from evicting one by role.',
      'The roles’ state data lives inside the guests’ filesystems and was not captured by the file-level backup. A step ahead of every backup run extracts it, after which it goes encrypted to a remote location.',
    ],
    architecture: {
      summary:
        'Requests from outside reach my own edge server, which forwards them through a VPN tunnel to the relevant guest; no port is open on the home connection. On the node, a controller decides from a registry file and real occupancy checks which heavy role may run, evicts the previous one with its state saved, and switches off idle roles. Control runs through a token-protected bridge inside my own network, and the guests’ state data goes through a pre-backup step to an encrypted remote location.',
      tiers: [
        {
          label: 'Public',
          nodes: [
            { id: 'user', label: 'Access from outside', kind: 'edge' },
            { id: 'relay', label: 'Edge server', note: 'forwarding · no port on the home connection', kind: 'edge' },
          ],
        },
        {
          label: 'Control',
          nodes: [
            { id: 'ui', label: 'Chat command · web interface', note: 'roles: wake vs. evict', kind: 'edge' },
            { id: 'bridge', label: 'Control bridge', note: 'own network only · token', kind: 'core' },
          ],
        },
        {
          label: 'Node',
          nodes: [
            { id: 'arbiter', label: 'Controller', note: 'registry file · occupancy checks', kind: 'core' },
            { id: 'guests', label: 'Guest per role', note: 'systemd · clean save on stop', kind: 'core' },
          ],
        },
        {
          label: 'Data',
          nodes: [
            { id: 'state', label: 'State data', kind: 'data' },
            { id: 'offsite', label: 'Encrypted off-site', note: 'via pre-backup step', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'user', to: 'relay', label: 'only via the edge' },
        { from: 'relay', to: 'guests', label: 'VPN tunnel' },
        { from: 'ui', to: 'bridge' },
        { from: 'bridge', to: 'arbiter', label: 'wake · sleep' },
        { from: 'arbiter', to: 'guests', label: 'evict · switch off' },
        { from: 'guests', to: 'state' },
        { from: 'state', to: 'offsite' },
      ],
    },
    result: [
      'Seven heavy roles share a node with memory for one, without ever overcommitting: exactly one runs at a time, and the node is quiet when nobody is using anything.',
      'Shutdown follows real occupancy rather than assumption: each role is queried the way that actually yields its user count.',
      'Adding a role is an entry in a registry file, not a code change to the controller.',
      'Not a single port is open on the home connection, and the home address does not surface even where services register themselves publicly.',
      'Roles that would lose their state on a plain termination now demonstrably save cleanly on shutdown instead of being killed and hoped for.',
      'The state data sits encrypted at a remote location, even though it lives in guest filesystems that the ordinary file backup does not see.',
    ],
    decisions: [
      {
        title: 'Evict rather than overcommit',
        body: 'Running everything at once would have meant the kernel decides under pressure which process dies, with no regard for whether someone is in the middle of using it. A controller that evicts deliberately and shuts down cleanly first trades an uncontrolled risk for a controlled decision.',
      },
      {
        title: 'Measure real occupancy instead of estimating',
        body: 'A timer or a process signal would either have cut off active use or kept empty services alive forever. So each service is queried the way that yields its true user count, even though that means three different techniques. Only then is automatic shutdown defensible at all.',
      },
      {
        title: 'Roles as data, not as code',
        body: 'The first version knew exactly one service and had it hard-wired. As soon as the second arrived, that became a registry file: credentials, probe method, memory floor and idle timeout per entry. Since then every further role is configuration rather than a special case, and the controller stays the same size as the fleet grows.',
      },
      {
        title: 'No port on the home connection',
        body: 'A port forward on the home router would have made the connection permanently visible and exposed every role directly. Routing through my own edge server costs a tunnel hop, but keeps the home address entirely out of play and puts the exposure in one place instead of seven.',
      },
      {
        title: 'Do not trust the default shutdown blindly',
        body: 'Two of the services exit on the usual termination signal without fully writing their state, which would have quietly cost progress on every eviction. They therefore get their own save commands sent to the console on shutdown, and that this takes effect is verified in the server logs.',
      },
    ],
    metrics: [
      { label: 'Heavy roles on one node', value: 'seven, plus a Windows lab' },
      { label: 'Active at a time', value: 'exactly one' },
      { label: 'Shutdown when idle', value: 'after twenty minutes' },
      { label: 'Open ports on the home connection', value: 'none' },
    ],
    timeline: [
      { when: '2026 H2', what: 'First role as its own guest with a systemd service, controller with hard-wired eviction' },
      { when: '2026 H2', what: 'Registry file introduced: further roles are an entry, not a code change' },
      { when: '2026 H2', what: 'Public access via the edge server, home address hidden even for self-registering services' },
      { when: '2026 H2', what: 'Clean saving on eviction, shutdown by real occupancy, state data off-site' },
    ],
    lessons: [
      'A controller that has to guess whether something is in use ends up either too cautious or too blunt. Only a real occupancy check makes automatic shutdown defensible.',
      'The moment a second case appears, the case distinction belongs in configuration rather than code, otherwise the controller grows with every service.',
      'Clean shutdown is not a detail: that a service exits on the standard signal does not mean it wrote its state, and you find out only at the next start.',
      'External reachability and a hidden home address are not mutually exclusive, but the detour has to cover outbound traffic too, or a service gives itself away when it registers.',
      'A backup that only sees files on the host misses precisely the data created inside the guests. What gets backed up has to be verified, not assumed.',
    ],
  },
};
