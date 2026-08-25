# Archived vehicle-service pages (D4 — vehicle content removal)

Archived 2026-08-26. These four static pages were live at ikonic303.com and are no
longer published. They're kept here verbatim — not deleted — as source material for
future marketing (design patterns, copy, interactive-simulator code) if ikonic revisits
PPF/tint/ceramic/wrap-landing content later.

| File | Was served at | Now |
|---|---|---|
| `paint-protection-film.html` | `/paint-protection-film`, `/paint-protection-film.html`, `/services/paint-protection-film` | 301 → `/` |
| `window-tint.html` | `/window-tint`, `/window-tint.html`, `/services/window-tint` | 301 → `/` |
| `ceramic-coating.html` | `/ceramic-coating`, `/ceramic-coating.html`, `/services/ceramic-coating` | 301 → `/` |
| `commercial-wraps.html` | `/commercial-wraps`, `/commercial-wraps.html` | 301 → `/` |

The redirects live in `vercel.json`. These files are excluded from the Vite build (this
directory is outside `public/`), so they are not deployed and not reachable at any URL —
they exist only in the repo.

Do not restore by moving these back into `public/` without also removing the
corresponding redirects in `vercel.json`, or the redirect will shadow the file.
