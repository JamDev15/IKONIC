/**
 * prerender-routes.mjs — per-route static HTML for crawlers and AI answer engines.
 *
 * THE PROBLEM THIS SOLVES
 * ikonic303.com is a client-rendered Vite/React SPA. Every SPA route (/about, /services,
 * /contact, …) was served the SAME dist/index.html — byte-identical, 9,658 bytes, with the
 * homepage's <title> and a canonical pointing at "https://ikonic303.com/". To any crawler that
 * does not execute JavaScript — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, and Google's
 * first pass — the site was ONE page published at a dozen URLs, each one declaring itself a
 * duplicate of the homepage. react-helmet-async sets the correct per-page tags, but only after
 * JS runs, which is exactly when those crawlers have already left.
 *
 * THE FIX
 * After `vite build`, take the built dist/index.html as a template and emit a real
 * dist/<route>/index.html for every public route, each carrying its own <title>, description,
 * canonical, OG/Twitter tags, and a block of genuine page content inside #root. Vercel serves
 * a matching static file before it consults the SPA catch-all rewrite, so /about now returns
 * about-specific HTML.
 *
 * Users are unaffected: React's createRoot().render() replaces #root the instant JS runs, so
 * the interactive SPA is identical. Same HTML is served to every visitor — progressive
 * enhancement, not cloaking.
 *
 * MAINTENANCE
 * `title` and `description` below are copied verbatim from each page's <PageSEO> props so the
 * static shell and the React app never disagree. If you change PageSEO on a page, change it
 * here too. `body` is the crawler-visible content — keep every claim true and consistent with
 * listings/nap-truth.json; this text is what AI answer engines quote back about ikonic.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://ikonic303.com';

const PHONE = '(720) 679-1230';
const CONTACT_BLOCK = `<h2>Get a quote</h2>
<p>Call <a href="tel:+17206791230">${PHONE}</a> or email
<a href="mailto:info@ikonic303.com">info@ikonic303.com</a>.
ikonic — 4880 Robb St. #8, Wheat Ridge, CO 80033. Architectural window film, storefront and
window graphics, signage, and wayfinding are installed on-site; printing and fabrication happen
in our Wheat Ridge shop.</p>`;

/** @type {{path:string,title:string,description:string,body:string}[]} */
const ROUTES = [
  {
    path: '/about',
    title: 'About ikonic303 | Denver Window Film & Graphics Shop',
    description:
      'ikonic is a Wheat Ridge, CO shop for architectural window film, storefront and window graphics, and signage. Design, print, and installation in-house for the Denver metro.',
    body: `<h1>About ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic is a shop for the visible skin of a building in the Denver metro. We install
architectural window film for homes and businesses, print and apply storefront and window
graphics, and fabricate and hang signage and wayfinding — all designed, printed, and installed
in-house.</p>
<p>The through-line is consistency: the film on your glass, the graphics on your windows, and the
sign over your door should look like the same company did all three — because we did. Most shops
do one of those things. We do all of them under one roof in Wheat Ridge.</p>`,
  },
  {
    path: '/services',
    title: 'Window Film & Graphics Services Denver CO | ikonic303',
    description:
      'Architectural window film, residential and commercial window tint, storefront and window graphics, signage, and wayfinding for the Denver metro. Designed, printed, and installed in-house.',
    body: `<h1>ikonic services — Denver, Colorado</h1>
<p>One Wheat Ridge shop for the whole exterior of your building — architectural window film,
storefront and window graphics, signage, and wayfinding — so every surface a customer sees looks
like the same company.</p>
<h2>Architectural Window Film</h2>
<p>Flat-glass film for homes and buildings: heat rejection, glare control, up to 99% UV blocking,
privacy, security, anti-graffiti, and decorative films. Every window is checked against the film
manufacturer's glass compatibility chart before a quote goes out, because the wrong film on the
wrong glass can crack a pane or void its seal warranty.</p>
<h2>Residential Window Tint</h2>
<p>Fixes hot upstairs rooms, sun-faded floors, and harsh afternoon light without changing how a
home looks from the street. Free written quote after we check the windows.</p>
<h2>Commercial Window Tint</h2>
<p>Cuts cooling costs and screen glare across offices, clinics, and multi-tenant buildings.
Installs are scheduled after hours so a business never loses a workday.</p>
<h2>Storefront &amp; Window Graphics</h2>
<p>Cut vinyl and full-color printed window graphics, frosted privacy film, perforated see-through
film, wall murals, and interior branding — installed on-site across the Denver metro.</p>
<h2>Signage &amp; Visual Graphics</h2>
<p>Storefront and building signage designed, fabricated, and installed on-site: dimensional and
illuminated letters, monument and blade signs, banners, and interior branding. We prepare the
drawings the permit process needs.</p>
<h2>Wayfinding &amp; ADA Signage</h2>
<p>Directional, room ID, and ADA-compliant signage systems for offices, medical buildings, and
campuses — a consistent set that cuts front-desk questions.</p>
<h2>Why choose ikonic?</h2>
<p><strong>In-house, end to end</strong> — design, printing, and installation under one roof, no
subcontractors. <strong>Glass checked first</strong> — we confirm your windows against the film
compatibility chart before quoting. <strong>One consistent look</strong> — film, graphics, and
signage from the same team so every surface matches.</p>
<p>ikonic serves the Denver metro, including Wheat Ridge, Arvada, Lakewood, Golden, and Denver.
Every engagement starts the same way: we check the glass or walk the site, confirm the right
film or material, and send one written quote with no surprise add-ons.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/contact',
    title: 'Contact ikonic303 | Free On-Site Window Film Quote — Denver, CO',
    description:
      'Book a free on-site consultation for architectural window film, window graphics, or signage in the Denver metro. We check your glass and send one written quote. Call (720) 679-1230.',
    body: `<h1>Contact ikonic303 — Wheat Ridge, Colorado</h1>
<p>Talk to us about architectural window film, residential or commercial window tint, storefront
and window graphics, or signage for your home or business. We serve the Denver metro including
Wheat Ridge, Arvada, Lakewood, and Golden.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/blogs',
    title: 'Window Film & Graphics Blog | Guides for Denver Businesses | ikonic303',
    description:
      'Guides on architectural window film, residential and commercial window tint, storefront and window graphics, signage, and wayfinding for Denver-area homes and businesses.',
    body: `<h1>ikonic guides — window film, graphics &amp; signage</h1>
<p>Practical guides on architectural window film, residential and commercial window tint,
storefront and window graphics, signage, and wayfinding in the Denver metro. Written for
homeowners and business owners, not marketers.</p>`,
  },
  {
    path: '/careers',
    title: 'Careers at ikonic303 | Window Film & Sign Installers — Denver, CO',
    description:
      "Join the ikonic303 shop in Wheat Ridge, CO. We're hiring window film installers, vinyl and graphics applicators, and sign fabricators. Craft-focused, steady work across the Denver metro.",
    body: `<h1>Careers at ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic hires for the shop and the install crew: window film installers, large-format vinyl and
graphics applicators, and sign fabricators. We are a small team in Wheat Ridge that values doing
the work right over doing it fast.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/learn-more',
    title: 'How It Works | Window Film & Graphics Process | ikonic303',
    description:
      'How ikonic scopes and installs architectural window film and graphics in the Denver metro: on-site glass check, one written quote, clean install, and a manufacturer-backed warranty.',
    body: `<h1>How ikonic works</h1>
<p>Every job starts with a look at the actual glass or a walk of the site — glass type,
orientation, and condition — because the wrong film on the wrong glass can crack a pane or void
its warranty. Then one written quote, a dust-controlled install with finished edges, and a
manufacturer film warranty plus our workmanship guarantee behind it.</p>`,
  },

  // ── Service pages (React Router routes in src/pages/services; same URLs as the
  //    former static HTML). Keep this copy roughly in sync with serviceData.tsx.
  {
    path: '/window-tint',
    title: 'Architectural Window Film in Denver | ikonic303',
    description:
      'Architectural window film for Denver homes and businesses — heat, glare, UV, privacy, security, and decorative films on flat glass. We check your glass first. Free on-site quote.',
    body: `<h1>Architectural Window Film in Denver, Colorado</h1>
<p>ikonic installs architectural window film on the flat glass in homes and buildings across the
Denver metro — film that rejects solar heat, cuts glare, blocks up to 99% of UV, adds privacy or
security, or creates a frosted or decorative look, all without replacing a window.</p>
<h2>What architectural film does</h2>
<p>Heat and glare rejection on west- and south-facing glass; UV protection that slows fading of
floors, furniture, and merchandise; frosted and decorative privacy film; tear-resistant security
and safety film that holds broken glass in the frame; and clear anti-graffiti film for storefront
glass.</p>
<h2>We check your glass first</h2>
<p>Dual-pane, low-e, tempered, laminated, and single-pane annealed glass each behave differently.
The wrong film on the wrong glass is the most common cause of thermal-stress cracks and voided
window warranties, so every quote starts with identifying the glass on-site and matching it to the
film manufacturer's compatibility chart.</p>
<h2>FAQ</h2>
<p><strong>Will it make my rooms dark?</strong> Not with a spectrally-selective heat film, which
stays nearly clear. <strong>Does film help with energy bills?</strong> Yes — it lowers the cooling
load on the glass that gains the most summer heat.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/home',
    title: 'Home Window Tinting in Denver | ikonic303',
    description:
      'Home window film for hot upstairs rooms, sun-faded floors, and harsh afternoon glare in the Denver west metro. Free written quote after we check your glass.',
    body: `<h1>Home Window Tinting in the Denver West Metro</h1>
<p>Window film fixes the hot upstairs bedroom, the west-facing living room that overheats every
afternoon, the sun-faded floor, and street-facing privacy — without losing the view or the light.
ikonic serves homeowners in Wheat Ridge, Arvada, Lakewood, and Golden.</p>
<h2>We check your glass before we quote</h2>
<p>Before any home job gets a number, we identify the glass — single or dual-pane, coated or
clear — and check it against the film manufacturer's compatibility chart. Most homes are finished
in a single visit.</p>
<h2>FAQ</h2>
<p><strong>Will home window film make my rooms dark?</strong> Not unless you want it to; solar
films cut heat and glare while staying close to clear. <strong>Can film protect my hardwood floors
from fading?</strong> Yes — UV is the biggest driver of fading, and film blocks most of it.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/office',
    title: 'Office Window Tinting & Glare Control Denver | ikonic303',
    description:
      'Office and commercial window film in the Denver metro for screen glare, heat load, and conference-room privacy. Scoped room by room, installed around your business hours.',
    body: `<h1>Office Window Tinting &amp; Glare Control</h1>
<p>Screen glare that forces the blinds shut every afternoon, glass-walled conference rooms with no
privacy, and west-facing floors that run the HVAC constantly are all solvable with the right film
on the right glass — not a whole-building retrofit. Jobs are scoped room by room and installed
around business hours.</p>
<h2>Multi-tenant and property-manager jobs</h2>
<p>A property manager can roll film out floor by floor as budget allows. We identify the glass —
coated, low-e, tempered, laminated, single or dual-pane — and confirm the film against the
manufacturer's compatibility chart before quoting.</p>
<h2>FAQ</h2>
<p><strong>Will it help with the AC bill?</strong> It reduces the heat load through the glass,
particularly on west- and south-facing windows. <strong>Can you do just the conference room?</strong>
Yes — most office jobs are scoped room by room.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/storefront-graphics',
    title: 'Storefront Window Graphics & Wall Murals Denver | ikonic303',
    description:
      'Custom storefront window graphics, frosted privacy vinyl, perforated film, wall murals, and interior branding — designed and printed in-house, installed on-site across the Denver metro.',
    body: `<h1>Storefront Graphics &amp; Wall Murals in Denver</h1>
<p>Custom-designed window graphics, frosted and perforated privacy vinyl, wall murals, and
interior branding — designed in-house, printed in-house, and installed at your storefront across
the Denver metro. Perforated film reads as a solid graphic outside while you still see out from
inside.</p>
<h2>Designed for your brand</h2>
<p>Every job includes design by ikonic's in-house designer, working from your logo and brand. You
approve the artwork proof before anything prints; two revision rounds are included.</p>
<h2>How it works</h2>
<p>A free storefront walkthrough to measure glass and walls, a design proof plus an exact written
quote, then a clean on-site install — most storefronts in a day.</p>
<h2>FAQ</h2>
<p><strong>Will graphics block the view out?</strong> Only if you want them to — perforated and
frosted films keep light and, for perforated, the view out. <strong>Can you match my brand
colors?</strong> Yes — we print from your brand files and proof against them.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/signage',
    title: 'Storefront & Building Signage in Denver | ikonic303',
    description:
      'Storefront and building signage, channel and dimensional letters, monument and blade signs, banners, and window graphics — designed, fabricated, and installed on-site by ikonic in Wheat Ridge, CO.',
    body: `<h1>Storefront &amp; Building Signage in Denver, Colorado</h1>
<p>ikonic designs, fabricates, and installs storefront and building signage across the Denver
metro — from clean vinyl lettering and window graphics to illuminated channel letters, monument
and blade signs, and banners. Building and storefront signage is installed on-site.</p>
<h2>Design, permit, fabricate, install</h2>
<p>We handle it end to end: brand-matched design, the drawings your city's permit process needs,
fabrication, and a clean install. Many exterior and illuminated signs must meet local sign code —
we help you get it right the first time.</p>
<h2>FAQ</h2>
<p><strong>Do you install on-site?</strong> Yes, across the Denver metro. <strong>Do you handle
permits?</strong> We identify what's required and prepare the drawings the permit needs.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/wayfinding',
    title: 'Wayfinding, ADA & Safety Signage in Denver | ikonic303',
    description:
      'Wayfinding, ADA-compliant, and safety signage for offices, clinics, warehouses, and multi-tenant buildings across the Denver metro — designed and installed on-site by ikonic.',
    body: `<h1>Wayfinding, ADA &amp; Safety Signage in Denver, Colorado</h1>
<p>ikonic designs and installs wayfinding, ADA-compliant, and safety signage for offices, clinics,
warehouses, and multi-tenant buildings across the Denver metro — directories, directional arrows,
floor and suite numbers, room identification, ADA room and restroom signs, and OSHA/safety
signage, installed on-site.</p>
<h2>ADA-compliant signage</h2>
<p>Room and restroom signs built to ADA requirements — tactile characters, braille, proper
contrast, and correct mounting height — so a building stays compliant and usable for everyone.</p>
<h2>Free signage audit</h2>
<p>We walk your building and flag the wayfinding gaps and the ADA or safety signage that's
missing, outdated, or out of compliance, then quote only what you need.</p>
${CONTACT_BLOCK}`,
  },

  // ---------------------------------------------------------------------------
  // HIDDEN 2026-08-29 — site refocused on architectural window film & graphics.
  // The digital-marketing service pages, the founder's book, and the print/AI/
  // sticker tools are unrouted in the SPA and 301-redirect to /services (see
  // vercel.json), so they no longer need prerendered shells or sitemap entries.
  // The route definitions are kept here, commented out, for an easy revert.
  // ---------------------------------------------------------------------------
  // { path: '/branded-to-win', ... },
  // { path: '/services/web-design', ... },
  // { path: '/services/crm-automation', ... },
  // { path: '/services/reputation', ... },
  // { path: '/services/speed-to-lead', ... },
  // { path: '/services/marketing', ... },
  // { path: '/print-ship', ... },
  // { path: '/lost-call-calculator', ... },
  // { path: '/sticker-builder', ... },
  // { path: '/ai-website-generator', ... },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the content of a meta/link tag matched by `attrRe`, preserving the rest of the tag. */

// JSON.stringify does NOT escape "/", so a value containing </script> breaks out of the
// block below and is baked into dist/**/index.html — XSS that fires before React mounts
// and even for JS-disabled crawlers. Blog titles/descriptions come from GHL, so they are
// not fully trusted. Escaping "<" to \u003c keeps the JSON valid and inert.
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function setTag(html, attrRe, value) {
  return html.replace(attrRe, (m) => m.replace(/content="[^"]*"/, `content="${esc(value)}"`));
}

function buildPage(template, route) {
  const url = ORIGIN + route.path;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`);
  html = setTag(html, /<meta\s+name="description"[^>]*>/, route.description);
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`
  );
  html = setTag(html, /<meta\s+property="og:url"[^>]*>/, url);
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/, route.title);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/, route.description);
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/, route.title);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/, route.description);

  // Swap the homepage crawler fallback for this route's content. React replaces #root on boot.
  // In source, #root is followed by <script type="module">. After `vite build` that script is
  // hoisted into <head>, leaving </div> followed by </body>. Match either so the script works
  // against both the source template and the built output.
  const rootRe = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  if (!rootRe.test(html)) {
    throw new Error(
      'prerender: could not locate the #root fallback block in dist/index.html. ' +
        'If index.html changed shape, update the rootRe pattern in scripts/prerender-routes.mjs.'
    );
  }
  const fallback = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        ${route.body}
        <p><a href="${ORIGIN}/">ikonic home</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
      </main>
    `;
  html = html.replace(rootRe, `$1${fallback}$2`);
  return html;
}

/**
 * Blog posts. There are ~53 of them and they were ALL served the homepage shell —
 * same <title>, canonical="https://ikonic303.com/" — so to a crawler that doesn't run
 * JS, every post looked like another copy of the homepage. Posts are the whole point
 * of the daily generator and the most citable thing on the site, so they get real
 * shells with their own title, description, canonical, opening text and Article schema.
 *
 * FAIL SOFT: the post list is fetched from the live API at build time. If that fetch
 * fails (site down, API blip, offline build) we log and skip — a broken blog feed must
 * never break the deploy of the whole site.
 *
 * STALENESS: a post published between builds has no shell until the next deploy. It
 * still renders for humans (the SPA handles /post/:slug) and is still indexable — it
 * just shows the generic shell to a crawler until then. Run scripts/deploy-site.sh
 * after publishing if a post matters immediately.
 */
async function fetchJson(url, ms = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const stripHtml = (html) =>
  String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function buildPost(template, post) {
  const url = `${ORIGIN}/post/${post.slug}`;
  const title = `${post.title} | ikonic303`;
  const desc = (post.description || post.excerpt || '').slice(0, 300);
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta\s+name="description"[^>]*>/, desc);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta\s+property="og:url"[^>]*>/, url);
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/, title);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/, desc);
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/, title);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/, desc);
  html = html.replace(/<meta\s+property="og:type"[^>]*>/, '<meta property="og:type" content="article" />');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: desc,
    datePublished: post.publishedAt || undefined,
    author: { '@type': 'Organization', name: 'ikonic303' },
    publisher: { '@type': 'Organization', name: 'ikonic303', url: ORIGIN },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: post.category || undefined,
    keywords: Array.isArray(post.tags) && post.tags.length ? post.tags.join(', ') : undefined,
  };

  const body = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        <article>
          <h1>${esc(post.title)}</h1>
          <p><em>${esc(post.category || 'Window Film')}${post.publishedAt ? ' · ' + new Date(post.publishedAt).toDateString() : ''}</em></p>
          ${post.body ? `<p>${esc(post.body)}</p>` : `<p>${esc(desc)}</p>`}
        </article>
        <p><a href="${ORIGIN}/blogs">All guides</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
      </main>
      <script type="application/ld+json">${jsonLd(schema)}</script>
    `;
  return html.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, `$1${body}$2`);
}

// Moon River (Rios's Brighton construction business) categories. The daily generator is
// not yet client-scoped, so it can still queue these onto ikonic's own blog. Unpublishing
// clears what's already live; this filter keeps any new ones out of ikonic's prerendered
// shells and sitemap until the generator itself is scoped at write time.
const MOON_RIVER_CATEGORIES = new Set([
  'Concrete & Hardscapes',
  'Landscaping & Outdoor Living',
  'Interior Remodeling',
  'Home Maintenance & Seasonal',
]);

// D4 vehicle content removal (2026-08-26): PPF, window tint, ceramic coating, and
// commercial/fleet vehicle wraps are no longer part of ikonic's content strategy — the
// 14 existing posts were unpublished via the Redis status flag and the generator no
// longer queues these topics (see TOPICS_BY_CATEGORY in auto-blog-generate.ts). This
// filter is defense-in-depth, same as MOON_RIVER_CATEGORIES above: it keeps any
// leftover or manually-added vehicle post out of the sitemap and prerendered shells.
//
// 2026-08-29 refocus: 'Digital Marketing' is retired from the blog for the same reason.
// Existing marketing posts are unpublished; this keeps any that slip through out of the
// sitemap and prerendered shells. See auto-blog-generate.ts for the matching change.
const VEHICLE_CATEGORIES = new Set([
  'Commercial Wraps', 'Vehicle Protection', 'Digital Marketing',
]);

// 2026-08-29 refocus: some older marketing posts were filed under generic categories
// ('Marketing', 'Lead Generation', etc.) so the category set alone doesn't catch them.
// This slug/title keyword filter is the belt-and-braces: any post that is clearly about
// digital marketing, SEO, ads, CRM, funnels, or lead automation is kept out of the
// prerendered shells and the sitemap. Unpublishing them in Redis is still the real fix.
const OFF_TOPIC_SLUG_RE =
  /(^|-)(marketing|gohighlevel|ghl|crm|seo|sem|ppc|funnel|funnels|lead-|leads-|lead-gen|lead-generation|automation|chatbot|ai-voice|retarget|ad-|ads-|advertising|google-ads|meta-ads|facebook-ads|newsletter|email-marketing|reputation|reviews?-automation|website-|web-design|sales-funnel)(-|$)/i;

async function prerenderPosts(template) {
  let list;
  try {
    const d = await fetchJson(`${ORIGIN}/api/blog-posts`, 20000);
    list = (d.posts || [])
      .filter((p) => p.slug && !String(p.link || '').startsWith('http'))
      .filter((p) => !MOON_RIVER_CATEGORIES.has(p.category))
      .filter((p) => !VEHICLE_CATEGORIES.has(p.category))
      .filter((p) => !OFF_TOPIC_SLUG_RE.test(p.slug || '') && !OFF_TOPIC_SLUG_RE.test(p.title || ''));
  } catch (err) {
    console.warn(`prerender: skipping blog posts — could not load the list (${err.message})`);
    return { count: 0, slugs: [] };
  }

  const slugs = [];
  for (const p of list) {
    // Opening text makes the shell genuinely citable; excerpt-only is the fallback.
    try {
      const full = await fetchJson(`${ORIGIN}/api/blog-post?slug=${encodeURIComponent(p.slug)}`, 12000);
      p.description = full.description || p.excerpt;
      p.body = stripHtml(full.content).slice(0, 1200);
      p.publishedAt = full.publishedAt || p.publishedAt;
      p.tags = full.tags;
      p.category = full.category || p.category;
    } catch {
      /* excerpt-only shell — still far better than a homepage clone */
    }
    const outDir = join(DIST, 'post', p.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), buildPost(template, p), 'utf8');
    slugs.push(p.slug);
  }
  return { count: slugs.length, slugs };
}

/**
 * Rewrite dist/sitemap.xml: add every prerendered post and drop duplicates.
 */
function fixSitemap(postSlugs) {
  const smPath = join(DIST, 'sitemap.xml');
  if (!existsSync(smPath)) return 0;
  const xml = readFileSync(smPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const keep = [...new Set(locs)];
  for (const slug of postSlugs) keep.push(`${ORIGIN}/post/${slug}`);

  const body = [...new Set(keep)]
    .sort()
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n');
  writeFileSync(smPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, 'utf8');
  return [...new Set(keep)].length;
}

/**
 * The 404 shell. Every unmatched path rewrites here (see vercel.json), so it must:
 *  - carry <meta name="robots" content="noindex"> — otherwise every mistyped or stale
 *    URL returns the HOMEPAGE's title and canonical, telling Google there are infinite
 *    copies of the homepage (a "soft 404");
 *  - still load the JS bundle, so if someone adds a React route and forgets to add a
 *    rewrite here, the page STILL WORKS for humans — it just isn't indexed until the
 *    entry is added. Degrade gracefully, never blank-screen.
 */
function build404(template) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Page Not Found | ikonic303</title>');
  html = setTag(html, /<meta\s+name="description"[^>]*>/, "That page doesn't exist. Architectural window film, window graphics, and signage for Denver-area homes and businesses.");
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    '<meta name="robots" content="noindex,follow" />');
  const rootRe = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  const body = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        <h1>Page not found</h1>
        <p>That page doesn't exist. The link may be out of date, or the address slightly off.</p>
        <p><a href="${ORIGIN}/">ikonic303 home</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/blogs">guides</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
        <p>Or call <a href="tel:+17206791230">(720) 679-1230</a>.</p>
      </main>
    `;
  return html.replace(rootRe, `$1${body}$2`);
}

async function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    console.error(`prerender: ${templatePath} not found — run \`vite build\` first.`);
    process.exit(1);
  }
  const template = readFileSync(templatePath, 'utf8');

  let count = 0;
  for (const route of ROUTES) {
    const outDir = join(DIST, route.path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), buildPage(template, route), 'utf8');
    count++;
  }
  writeFileSync(join(DIST, '404.html'), build404(template), 'utf8');

  const { count: postCount, slugs } = await prerenderPosts(template);
  const smCount = fixSitemap(slugs);

  console.log(
    `prerender: ${count} route shells + 404.html + ${postCount} post shells; sitemap has ${smCount} urls`
  );
}

await main();
