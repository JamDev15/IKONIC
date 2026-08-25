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
<a href="mailto:info@ikonicmarketing303.com">info@ikonicmarketing303.com</a>.
ikonic — 4880 Robb St. #8, Wheat Ridge, CO 80033. Storefront signage, window graphics, and
wayfinding are installed on-site; printing and fabrication happen in our Wheat Ridge shop.</p>`;

/** @type {{path:string,title:string,description:string,body:string}[]} */
const ROUTES = [
  {
    path: '/about',
    title: 'About ikonic303 | Denver Digital Marketing Agency',
    description:
      'Meet the ikonic303 team. Denver-based digital marketing agency specializing in GoHighLevel automation, CRM setup, and lead generation for Colorado businesses.',
    body: `<h1>About ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic is a brand-transformation company for local service businesses in the Denver metro.
We design, print, and install storefront signage, window graphics and murals, and wayfinding and
ADA/safety signage — and we run AI-powered digital marketing retainers for the same kind of
business.</p>
<p>The through-line is consistency: a customer should see the same brand, at the same level of
quality, on your storefront, inside your building, and in their search results. Most shops do
one of those things. We do all of them under one roof in Wheat Ridge.</p>`,
  },
  {
    path: '/services',
    title: 'Digital Marketing Services Denver CO | ikonic303',
    description:
      'Full-service digital marketing for Denver businesses — web design, GoHighLevel CRM automation, reputation management, speed-to-lead, and marketing systems. All under one roof.',
    body: `<h1>ikonic services — Denver, Colorado</h1>
<p>Two sides of one business: the physical brand and the digital front office. From websites and
CRM to signage and window film, ikonic provides complete solutions for Colorado businesses — all
integrated, all optimized, all working together under one roof in Wheat Ridge.</p>
<h2>Web Design &amp; Funnels</h2>
<p>Custom websites and high-converting sales funnels built in GoHighLevel that turn visitors into
booked jobs: landing pages, sales funnels, GHL integration, and mobile-responsive design built and
maintained for local service businesses across the Denver metro.</p>
<h2>CRM &amp; Automations</h2>
<p>Complete GoHighLevel setup with automated workflows that nurture leads: CRM setup, workflow
automation, lead tracking, and AI integrations, so every enquiry is tagged, routed, and followed
up without anyone having to remember to send it.</p>
<h2>Reputation Management</h2>
<p>Build a five-star reputation with Google Business optimization: Google Business Profile setup
and optimization, automated review generation, local SEO, and ongoing reputation monitoring —
reviews are the single strongest local ranking and trust signal a service business has.</p>
<h2>Speed to Lead</h2>
<p>Respond to leads in under 60 seconds with automated follow-up: instant SMS, email sequences,
missed-call text-back, and smart routing, because most local service leads go to whoever answers
first.</p>
<h2>Marketing Systems</h2>
<p>Full-service digital marketing that keeps the pipeline full 24/7: campaign management, social
media strategy, paid ads on Google and Meta, and an analytics dashboard that shows what came in
and what it was worth.</p>
<h2>Window Tint</h2>
<p>Flat-glass window film for homes, offices, and storefronts — heat and glare control, UV
protection, and privacy film, with every job's glass checked against the manufacturer's
compatibility chart before a quote goes out.</p>
<h2>Why choose ikonic?</h2>
<p><strong>All-in-one platform</strong> — everything integrated in GoHighLevel, no juggling
multiple tools or vendors. <strong>Done-for-you service</strong> — ikonic builds and manages the
systems so business owners can focus on running their business instead of chasing five different
agencies. <strong>Proven results</strong> — data-driven strategies with measurable ROI for every
campaign, reported monthly in plain language, not jargon.</p>
<p>ikonic serves local service businesses across the Denver metro, including Wheat Ridge, Arvada,
Lakewood, Golden, and Denver. Every engagement starts the same way: a conversation about where
leads are slipping through the cracks today, followed by a free consultation to map out which of
these services — or which combination of them — actually moves the needle for that specific
business, rather than a one-size-fits-all package.</p>
<p>Most local service businesses lose revenue in the gap between a customer reaching out and
someone getting back to them — closing that gap with speed-to-lead automation is usually the
first thing ikonic fixes, before layering on the rest of the marketing system, because a faster
website or a better-looking storefront doesn't help if the leads it generates never get a
response. That's why speed to lead — automated SMS, email sequences, and missed-call text-back —
is usually the first piece ikonic turns on for a new client, ahead of anything that spends money
generating more leads in the first place.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/contact',
    title: 'Contact ikonic303 | Free Strategy Call — Denver, CO',
    description:
      'Book your free marketing strategy session with ikonic303. Denver-based GoHighLevel experts ready to build your lead generation system. Call (720) 679-1230.',
    body: `<h1>Contact ikonic303 — Wheat Ridge, Colorado</h1>
<p>Talk to us about storefront signage, window graphics, or a marketing retainer for your local
service business. We serve the Denver metro including Wheat Ridge, Arvada, Lakewood, and
Golden.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/blogs',
    title: 'Digital Marketing Blog | Tips for Denver Businesses | ikonic303',
    description:
      'Marketing tips, GoHighLevel guides, and growth strategies for Denver-area businesses. Learn how to automate leads, improve your reputation, and scale your business.',
    body: `<h1>ikonic guides — marketing for local service businesses</h1>
<p>Practical guides on marketing a local service business in the Denver metro: capturing and
responding to leads, generating reviews, getting found in search and in AI answers, and what
branding actually costs. Written for owners, not marketers.</p>`,
  },
  {
    path: '/branded-to-win',
    title: 'Branded to Win Book by Joshua Soderblom | ikonic303',
    description:
      'Get the Branded to Win book — the complete guide to building a business brand that attracts customers, generates leads, and dominates your local market. Digital & bundle editions available.',
    body: `<h1>Branded to Win — by Joshua Soderblom</h1>
<p><em>Branded to Win</em> is ikonic founder Joshua Soderblom's guide to building a local brand
that brings customers in — nearly 200 pages of dense, actionable frameworks for local service
business owners: plumbers, roofers, landscapers, and anyone who relies on their local reputation
to win jobs. No marketing background required.</p>
<h2>What you'll discover inside</h2>
<p><strong>Build instant trust</strong> — the branding signals that instantly communicate
reliability and quality to potential customers in your area. <strong>Command premium prices</strong>
— how a strong brand lets you charge what you're worth and attract clients who value quality over
the lowest bid. <strong>Dominate local marketing</strong> — frameworks to position your business on
every platform so local customers choose you over the competition.</p>
<h2>Chapter breakdown</h2>
<p><strong>Part I: The Invisible Tax</strong> — the book's premise that your brand is either
making or costing you money daily, what invisibility actually costs in lost leads and referrals,
and the psychology behind why customers decide to trust a business in milliseconds.</p>
<p><strong>Part II: The Brand Equation</strong> — a framework for revenue as visibility times
professionalism times consistency, divided by friction; the "Seven Touchpoints System" covering
crew, digital presence, paperwork, job site, customer experience, and community; and a full
financial model.</p>
<p><strong>Part III: The Transformation</strong> — five real case studies across HVAC,
landscaping, plumbing, cleaning, and roofing businesses, the pricing power of a strong brand, and
the mindset shift from technician to CEO.</p>
<p><strong>Part IV: The Playbook</strong> — a 7-dimension, 70-point brand audit, a 90-day
brand-transformation implementation plan, and a scaling strategy for growing from one truck to
market domination.</p>
<p><strong>Part V: The Compound Effect</strong> — aligning digital and physical branding so they
reinforce each other, the seventeen most common mistakes that sabotage a brand investment, why
brand equity behaves like an appreciating asset rather than a recurring expense, a practical
system for turning social media and customer reviews into compounding sales assets, and how
strategic partnerships and everyday surfaces — yard signs, door hangers, job-site banners,
wearables — can replicate the perception of a national franchise brand at a fraction of typical
franchise fees.</p>
<h2>Editions</h2>
<p>The <strong>Digital Edition</strong> includes the full eBook in PDF, ePub, and Mobi formats
with lifetime updates to future digital editions. <strong>The Complete Bundle</strong> — designed
for the serious owner ready to dominate their local market — adds an audiobook, printable
branding worksheets and templates, and a bonus 30-day implementation guide. See the book page for
current pricing.</p>
<h2>About the author</h2>
<p>Joshua Soderblom didn't start behind a desk. He started with a pressure washer, a polishing
machine, and an obsession with making things look flawless, launching ikonic in 2020 in Denver,
Colorado. Along the way he realized the brand is the business — today he helps local service
business owners build brands strong enough that customers choose them on sight.</p>
<h2>FAQ</h2>
<p><strong>Who is this book for?</strong> Local service business owners who rely on their local
reputation to win jobs. <strong>Is there a money-back guarantee?</strong> Yes — the Complete
Bundle comes with a 30-day money-back guarantee.</p>
<p>Available in digital and bundle editions, with a free chapter download to preview the book
before you buy.</p>`,
  },
  {
    path: '/careers',
    title: 'Careers at ikonic303 | Join Our Denver Marketing Team',
    description:
      "Join the ikonic303 team in Denver, CO. We're hiring driven marketers, GoHighLevel specialists, and automation experts. Build your career in digital marketing.",
    body: `<h1>Careers at ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic hires for the shop and for the marketing side: vinyl installers, designers, and
marketing and automation specialists. We are a small team in Wheat Ridge that values doing the
work right over doing it fast.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/learn-more',
    title: 'How It Works | Marketing Automation for Denver Businesses | ikonic303',
    description:
      'Learn how ikonic303 builds automated lead generation systems for Denver businesses. Our proven 4-step process captures leads 24/7 while you focus on your business.',
    body: `<h1>How ikonic works</h1>
<p>Every lead gets captured, answered fast, followed up with until they respond, and tracked
through to the job. Most local service businesses lose revenue in the gap between a customer
reaching out and someone getting back to them — that gap is what we close first, then we build
the rest of the marketing on top of it.</p>`,
  },
  {
    path: '/services/web-design',
    title: 'Web Design & Sales Funnels Denver CO | ikonic303',
    description:
      'Custom websites and high-converting GoHighLevel sales funnels for Denver businesses. Mobile-responsive, conversion-optimized, built by GHL experts. Get a free quote.',
    body: `<h1>Web design &amp; sales funnels — Denver, Colorado</h1>
<p>Websites and funnels built to turn visitors into booked jobs: mobile-first, fast, and wired
into the CRM so every enquiry lands somewhere it will be answered. Built and maintained for
local service businesses across the Denver metro.</p>`,
  },
  {
    path: '/services/crm-automation',
    title: 'GoHighLevel CRM Setup & Automation Denver CO | ikonic303',
    description:
      'Expert GoHighLevel CRM setup and automation for Colorado businesses. Automate follow-ups, nurture leads, and close more deals. Free CRM audit available.',
    body: `<h1>CRM setup &amp; automation — Denver, Colorado</h1>
<p>Your customer list, pipeline, and follow-up in one place, automated: every lead tagged and
routed, follow-up that runs without anyone remembering to send it, and a pipeline that shows
what is actually going to close this month.</p>`,
  },
  {
    path: '/services/reputation',
    title: 'Reputation Management & Google Reviews Denver CO | ikonic303',
    description:
      'Build your 5-star reputation and dominate Google Maps. Automated review collection, Google Business Profile optimization, and local SEO for Denver businesses.',
    body: `<h1>Reputation &amp; Google reviews — Denver, Colorado</h1>
<p>Reviews are the single strongest local ranking and trust signal a service business has. We
ask every finished customer at the right moment, route unhappy ones to you privately first, and
keep your Google Business Profile accurate and complete.</p>`,
  },
  {
    path: '/services/speed-to-lead',
    title: 'Speed to Lead Automation Denver CO | ikonic303',
    description:
      'Respond to leads in under 60 seconds with automated SMS and email follow-up. Never lose a lead again. Speed-to-lead automation for Colorado businesses.',
    body: `<h1>Speed to lead — Denver, Colorado</h1>
<p>Most local service leads go to whoever answers first. We answer for you in under a minute,
day or night, then keep following up until the customer replies — so the job does not go to the
competitor who happened to pick up.</p>`,
  },
  {
    path: '/services/marketing',
    title: 'Digital Marketing Systems & Automation Denver CO | ikonic303',
    description:
      'Full-service digital marketing for Colorado businesses — social media, paid ads (Google & Facebook), email automation, and analytics dashboards. Fill your pipeline on autopilot.',
    body: `<h1>Marketing systems — Denver, Colorado</h1>
<p>Full-service digital marketing for Colorado businesses. ikonic manages social media, paid ads,
email campaigns, and analytics — so business owners can focus on running their business while the
pipeline fills with qualified leads. Digital marketing is essential for any business looking to
grow in today's competitive landscape, and these marketing systems help Colorado businesses reach
more customers, generate more leads, and increase revenue through strategic online campaigns.</p>
<h2>Everything under one roof</h2>
<p>Stop juggling multiple agencies and tools. The integrated marketing system handles everything
from social media to paid ads, all working together to maximize ROI: complete marketing campaign
management, social media strategy and scheduling, paid advertising on Google Ads and Facebook,
email marketing automation, an analytics dashboard and reporting, and ongoing A/B testing and
optimization.</p>
<h2>Marketing channels we manage</h2>
<p><strong>Social Media</strong> — strategic posting across Facebook, Instagram, LinkedIn, and
TikTok. <strong>Paid Ads</strong> — targeted campaigns on Google, Facebook, and Instagram.
<strong>Email Marketing</strong> — automated sequences that nurture and convert. <strong>Content
Strategy</strong> — blog posts, videos, and content that drives traffic.</p>
<h2>Real-time analytics</h2>
<p>Every campaign is tracked, measured, and optimized with a comprehensive analytics dashboard:
lead source tracking, conversion rate analysis, cost-per-acquisition metrics, campaign
performance reports, and monthly strategy reviews, so a business owner always knows exactly what's
working.</p>
<h2>What is a marketing system?</h2>
<p>A marketing system is an integrated set of tools, processes, and strategies that work together
to attract, engage, and convert customers. Unlike one-off campaigns, a marketing system runs
continuously, constantly optimizing for better results. A data-driven approach informs every
decision: from social media management to paid advertising, every channel is optimized for maximum
ROI, and the integrated systems ensure all marketing efforts work together seamlessly rather than
as disconnected, one-off tactics.</p>
<h2>Benefits of integrated marketing</h2>
<p>Consistent messaging across all channels, better attribution and ROI tracking, reduced cost per
acquisition, scalable growth without adding headcount, and data-driven decision making at every
step — rather than guessing which channel deserves next month's budget.</p>
<h2>Marketing FAQ</h2>
<p><strong>Does ikonic offer digital marketing?</strong> Yes — monthly retainers for local service
businesses. <strong>What areas does ikonic serve?</strong> Wheat Ridge, Arvada, Lakewood, Golden,
and Denver — the same service area ikonic covers for signage, window film, and web design, so a
business's brand stays consistent across every one of those touchpoints, not just its ads.</p>
<p>Book a free marketing strategy session and discover how an integrated system fits your
business — this is one of the six services on ikonic's full <a href="${ORIGIN}/services">services
page</a>, alongside web design, CRM automation, reputation management, speed to lead, and window
tint. Most engagements pair marketing systems with speed-to-lead automation first, since a bigger
ad budget doesn't help if the leads it generates never get a fast reply — then layer on the rest
of the retainer once that gap is closed. Reporting happens monthly, in plain language rather than
agency jargon, so a business owner can see exactly what came in, what it cost to generate, and
what to do differently next month.</p>`,
  },
  {
    path: '/print-ship',
    title: 'Print & Ship Vinyl Wraps Denver | ikonic303',
    description:
      'Order custom-printed vinyl wraps and have them shipped directly to you. Professional print quality for vehicle wraps, banners, and signage. Serving Denver and Colorado.',
    body: `<h1>Print &amp; ship vinyl</h1>
<p>Custom-printed vinyl wraps, banners, and signage printed to spec and shipped to you or your
installer — the same print quality we install in our own shop, for shops and businesses outside
the Denver metro.</p>`,
  },
  {
    path: '/lost-call-calculator',
    title:
      'Missed Call Revenue Calculator | How Much Are Lost Calls Costing You? | ikonic303',
    description:
      'Find out how much revenue your business loses from missed calls. Use our free calculator and see how missed call text-back automation can recover that revenue instantly.',
    body: `<h1>Missed call revenue calculator</h1>
<p>Work out what unanswered calls cost your business each month. Every missed call at a local
service business is a customer who is already calling the next name on the list — this puts a
number on it, and shows what automatic text-back recovers.</p>`,
  },
  {
    path: '/sticker-builder',
    title: 'Custom Sticker Builder — Design & Order Online | ikonic303',
    description:
      'Design and order custom stickers online. Choose your shape, size, material, and finish — die-cut, kiss-cut, bumper stickers, and more. Fast shipping across Colorado and the US.',
    body: `<h1>Custom sticker builder</h1>
<p>Design and order custom stickers online — die-cut, kiss-cut, and bumper stickers in your
choice of shape, size, material, and finish. Printed by ikonic in Wheat Ridge, Colorado and
shipped nationwide.</p>`,
  },
  {
    path: '/ai-website-generator',
    title: 'AI Website Generator | Free Custom Website Design Concept | ikonic303',
    description:
      "Answer a few questions and let Ikonic's AI create a custom website design concept for your business — layout, copy, sections, colors, and a design direction ready to build.",
    body: `<h1>AI website generator</h1>
<p>Answer a few questions about your business and get a custom website design concept back —
layout, sections, copy direction, and colors — as a starting point you can build from or hand
to us to build for you.</p>`,
  },
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
          <p><em>${esc(post.category || 'Marketing')}${post.publishedAt ? ' · ' + new Date(post.publishedAt).toDateString() : ''}</em></p>
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
const VEHICLE_CATEGORIES = new Set(['Commercial Wraps', 'Vehicle Protection']);

async function prerenderPosts(template) {
  let list;
  try {
    const d = await fetchJson(`${ORIGIN}/api/blog-posts`, 20000);
    list = (d.posts || [])
      .filter((p) => p.slug && !String(p.link || '').startsWith('http'))
      .filter((p) => !MOON_RIVER_CATEGORIES.has(p.category))
      .filter((p) => !VEHICLE_CATEGORIES.has(p.category));
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
  html = setTag(html, /<meta\s+name="description"[^>]*>/, "That page doesn't exist. Signage, wayfinding and marketing for Denver businesses.");
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
