# Privacy

**Last updated: 2026-05-28**

Typer is built local-first. We do not have a backend, we do not have user
accounts, and we do not collect anything from you.

## What we collect

**Nothing.** Typer does not transmit any data off your device.

Specifically:

- No analytics, no telemetry, no error reporting.
- No cookies are set.
- No advertising or tracking scripts are loaded.
- No requests to third-party hosts are made at runtime. Fonts, icons, and
  every other asset ship in the bundle and are served from the same origin as
  the page.

## What stays in your browser

Your typing history, weakness map, streak, settings, and unlocked badges are
stored in your browser's **IndexedDB**, on your device. That data:

- Never leaves your browser unless you explicitly use **Settings → Export JSON**.
- Is editable by anyone with physical access to your browser. Lock your device
  if that matters to you.
- Is wiped if you clear site data, switch browsers, or use a private window.

## Your controls

- **Export your data** — Settings → Data → "Export JSON" downloads a portable
  backup file.
- **Delete your data** — Settings → Data → "Reset all data" wipes every Typer
  key in IndexedDB.
- **Browser controls** — clearing site data for this origin removes Typer's
  data the same way as the in-app reset.

## "Do Not Track" / Global Privacy Control

Typer does not run analytics, so these headers are moot today. If analytics
are ever added in a future version, they will be opt-in by default, will
honor `DNT: 1` and `Sec-GPC: 1` headers, and this document will be updated
before the feature ships.

## Children's privacy

We do not collect anything from anyone, including children. The site does not
require an account and does not have age-gated content.

## Third parties

Currently: **none**. The full third-party list is empty.

The deploy host (e.g. Vercel, Netlify) may keep its own request logs as part
of routing traffic to the static site. Those logs are governed by the host's
own privacy policy, not this one.

## Changes to this policy

This file lives in the repo. Every change is in `git log`. The "Last updated"
date at the top of this file reflects the most recent material change.

## Questions

This is a personal/open-source project. Open an issue on the repo with
privacy questions. See [`SECURITY.md`](./SECURITY.md) for the security
posture and how to report a vulnerability.
