# sami-portfolio (djouhri.de)

![CI](https://github.com/sami-djouhri/sami-portfolio/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Source of my personal portfolio and CV site, [djouhri.de](https://djouhri.de).
Built with Next.js (App Router) and a small self-hosted JSON CMS. The site is
bilingual, German and English, and runs behind a reverse proxy on hardware I own.

```mermaid
flowchart LR
  visitor[visitor] -->|HTTPS| proxy[reverse proxy]
  proxy --> app[Next.js 16<br/>App Router]
  app --> cms[(JSON-file CMS<br/>projects / services / inbox)]
  app --> pow[proof-of-work captcha<br/>contact form]
  admin[/admin UI/] -. localhost only · blocked at edge .-> cms
```

## Stack
- **Next.js 16**, React 19, TypeScript, Tailwind CSS
- **JSON-file CMS** for projects, services and the contact inbox. The `/admin`
  UI is bound to localhost only and blocked at the edge
- Self-contained proof-of-work captcha for the contact form, with no third-party
  widget
- **Hardened container**: read-only root filesystem, non-root user, dropped
  capabilities, `no-new-privileges`, memory-limited

## Structure
- `app/`: routes (App Router), API routes, PDF CV renderer
- `lib/`: content model, i18n dictionary, CV and projects data
- `Dockerfile` and `docker-compose.yml`: the runtime

## Notes
The deploy scripts and the host details they contain have been taken out. What
remains is the application code. MIT licensed.

## About this snapshot

Of all the repos here this is the one whose result you can simply go and look at.
[djouhri.de](https://djouhri.de) is this code, running. The publishing script
still strips the deploy path and the host configuration, rewrites internal
addresses to placeholders, and blocks the push unless two secret scanners agree.

The history stays private, hence the single commit.
