# Archived vehicle-service pages (D4 — vehicle content removal)

Archived 2026-08-26 per Josh: "No more vehicle services... archive those pages and use for
examples to sell in the future to other shops." Nothing here is deleted — it's kept as portfolio
and sales-example source for pitching marketing services to wrap/tint shops later.

## Static pages

| File | Was served at | Now |
|---|---|---|
| `paint-protection-film.html` | `/paint-protection-film`, `/paint-protection-film.html`, `/services/paint-protection-film` | 301 → `/` |
| `ceramic-coating.html` | `/ceramic-coating`, `/ceramic-coating.html`, `/services/ceramic-coating` | 301 → `/` |
| `commercial-wraps.html` | `/commercial-wraps`, `/commercial-wraps.html` | 301 → `/signage` |

`window-tint.html` is NOT archived here — it's covered by a separate initiative (D1:
`/window-tint` full rebuild, flat-glass only, approved by Josh 2026-08-24) that keeps
the URL live and replaces its content rather than killing it. See that page's own build
brief for status; don't move it into this archive without checking D1 first.

## React route: wrap-calculator-src/

The `/wrap-calculator` route's source (`WrapCalculator.tsx`, plus five earlier unimported
dev-draft snapshots in `dev-drafts/`) was removed from the live app: no more `App.tsx` route, no
sitemap entry, no prerender shell, no nav link (desktop/mobile, and the hardcoded nav baked into
window-tint.html/wayfinding.html/signage.html/marketing.html). `/wrap-calculator` now 301s to `/`.
The component isn't wired to anything and won't build standalone — treat it as reference source,
not a drop-in page.

## Redirects & sitemap

All four redirects above live in `vercel.json`. The three static `.html` files are excluded from
the Vite build (this directory is outside `public/`), so none of this is deployed or reachable at
any URL — it exists only in the repo, for reuse when needed.

Do not restore the static pages by moving them back into `public/` without also removing the
corresponding redirect in `vercel.json`, or the redirect will shadow the file.
