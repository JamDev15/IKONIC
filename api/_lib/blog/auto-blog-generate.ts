import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';



// TOPICS_BY_CATEGORY + CATEGORY_ORDER below replace a flat 20-item TOPICS list.
// That list ran out on ~2026-07-22 (one draw per day, no repeats allowed — see the
// dedup note further down), and the generator has been silently emailing "topic
// list is used up" and skipping ever since instead of posting. Fix: ~4x more
// topics for runway, grouped by category, with the day-to-day category picked in
// rotation (see CATEGORY_ORDER) so consecutive posts don't cluster on one area.
const TOPICS_BY_CATEGORY: Record<string, string[]> = {
  'Digital Marketing': [
    'How Denver Businesses Can Use Digital Marketing to Get More Leads This Month',
    'The ROI of Digital Marketing for Local Service Companies in Colorado',
    'Email Automation vs. Social Media: Which Drives More Leads for Denver Businesses?',
    'How to Build a 24/7 Lead Generation System with Digital Marketing',
    'Google Ads vs. Meta Ads: Which Is Better for Denver Local Businesses?',
    'Why Every Denver Service Business Needs a CRM and Marketing Automation System',
    '5 Signs Your Denver Business Needs a Marketing Automation Overhaul',
    'How to Turn Google Reviews Into a Steady Stream of New Customers in Denver',
    'SMS Marketing for Local Businesses: What Denver Owners Need to Know',
    'The Real Cost of a Slow Lead Response Time for Colorado Service Businesses',
    'How to Build a Website That Actually Converts Denver Visitors Into Customers',
    'Local SEO Checklist: Getting Your Denver Business Found on Google Maps',
    'Marketing Funnels 101: A Simple Guide for Denver Service Business Owners',
    'How Chatbots and AI Voice Agents Are Changing Customer Service for Local Businesses',
    'Retargeting Ads Explained: Bringing Denver Website Visitors Back to Buy',
  ],
  'Signage': [
    'How Business Signage Drives Walk-In Traffic and Brand Recognition in Denver',
    'Indoor vs. Outdoor Signage: What Denver Businesses Need to Know',
    'The Psychology of Effective Business Signage: What Makes Customers Stop and Look',
    'How to Choose the Right Signage for Your Denver Business Location',
    "Channel Letters vs. Monument Signs: Which Is Right for Your Denver Storefront?",
    "LED vs. Traditional Signage: What's the Better Investment for Colorado Businesses?",
    'How Often Should You Update Your Business Signage in Denver?',
    'Window Graphics and Decals: An Affordable Signage Upgrade for Local Shops',
    'ADA Signage Compliance: What Every Denver Business Owner Should Know',
    'How to Design Signage That Works Day and Night in Colorado Weather',
    'Signage Permits in Denver: What You Need to Know Before You Install',
    'Retail Signage Trends Denver Business Owners Should Watch This Year',
    'How Custom Signage Builds Trust With First-Time Customers',
  ],
  'Wayfinding Signage': [
    'What Is Wayfinding Signage and Why Does Your Denver Business Need It?',
    'How Wayfinding Signage Improves the Customer Experience at Your Location',
    'Interior Wayfinding Signs: Helping Customers Navigate Your Denver Business',
    'Wayfinding Signage for Office Buildings and Commercial Properties in Denver',
    'How to Design a Wayfinding System That Reflects Your Brand in Colorado',
    'ADA-Compliant Wayfinding Signage: What Denver Property Owners Need to Know',
    'Wayfinding Signage for Medical Offices and Clinics in Colorado',
    'Outdoor Wayfinding Signs: Directing Traffic Across Multi-Building Properties',
    'How Wayfinding Signage Reduces Front-Desk Questions and Staff Interruptions',
    'Digital vs. Static Wayfinding Signs: Which Fits Your Denver Business?',
    'Wayfinding Signage for Retail Centers and Shopping Plazas in Denver',
    'Parking Lot and Garage Wayfinding: Solving Navigation Before Customers Arrive',
    "How to Audit Your Business's Current Wayfinding for Confusing Gaps",
    'Wayfinding Signage for Warehouses and Industrial Facilities in Colorado',
    'Combining Wayfinding and Brand Signage Without Cluttering Your Space',
  ],
  // Added 2026-08-26 (D4 vehicle-content removal) to replace the retired "Commercial
  // Wraps" category — flat-glass/architectural only, never automotive. See
  // CATEGORY_ORDER and the prompt below for the same scoping.
  'Window Tint': [
    'How Window Film Cuts Cooling Costs for Denver Homes and Offices',
    'Flat Glass vs. Coated Glass: Why We Check Your Windows Before Quoting Film',
    'Solar Window Film for West-Facing Rooms: Fixing Denver\'s Worst Afternoon Glare',
    'Frosted Window Film for Privacy: Bathrooms, Conference Rooms, and Street-Facing Glass',
    'Security Window Film 101: What It Actually Does for a Denver Storefront',
    'Does Window Film Void a Window Warranty? What Denver Homeowners Should Ask First',
    'Dual-Pane Windows and Film: Why Not Every Combination Is Safe',
    'How UV Window Film Protects Floors, Furniture, and Artwork from Fading',
    'Office Window Film: Cutting Screen Glare Without Losing Natural Light',
    'Decorative and Etched Window Film: A Budget-Friendly Storefront Upgrade',
    'How Long Does Residential Window Film Last in Colorado?',
    'Window Film for Storefronts: Protecting Merchandise Without Blocking the View',
  ],
  'Storefront Graphics': [
    'Storefront Window Graphics 101: Turning Blank Glass Into a Customer Magnet',
    'Perforated Window Film vs. Frosted Vinyl: Which Fits Your Denver Storefront?',
    'How Wall Murals Build Brand Identity in a Denver Office or Lobby',
    'Window Graphics vs. Traditional Signage: When to Use Which',
    'Designing Storefront Graphics That Work With, Not Against, Your Window Displays',
    'Floor Decals and Directional Graphics: Guiding Customers Without Extra Signage',
    'How Often Should a Denver Business Refresh Its Storefront Graphics?',
    'Interior Branding 101: Feature Walls, Culture Walls, and Menu Walls',
    'Grand Opening Window Graphics: Making a First Impression Before Customers Walk In',
    'Removable vs. Permanent Window Vinyl: Choosing the Right Material for Your Promotion',
  ],
};

const CATEGORY_ORDER = ['Digital Marketing', 'Signage', 'Wayfinding Signage', 'Window Tint', 'Storefront Graphics'];

async function upstash(command: unknown[]) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  return res.json();
}


/**
 * Constant-time secret comparison.
 * ADDED 2026-07-21: `!==` on a secret leaks length and prefix through timing. Not
 * practically exploitable across the public internet, but this is one line.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth — Vercel cron sends Authorization: Bearer {CRON_SECRET} automatically.
  //
  // FAIL CLOSED. This previously read `if (cronSecret) { ...check... }`, so when
  // CRON_SECRET was unset the check was skipped entirely and this endpoint was
  // publicly triggerable — every call costing a Gemini generation and a Resend email.
  // CRON_SECRET was in fact NOT set in Vercel (found 2026-07-20), so that was live.
  // A missing secret must mean NOBODY gets in, never everybody.
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) {
    console.error('auto-blog-generate: CRON_SECRET not configured — refusing to run');
    return res.status(503).json({ error: 'Not configured' });
  }
  // HEADER ONLY (2026-07-21 security audit). The ?secret= path was removed: a secret in
  // a URL lands in Vercel access logs, browser history, and any Referer sent by the
  // rendered page. Vercel cron sends Authorization: Bearer $CRON_SECRET automatically.
  const authHeader = (req.headers['authorization'] as string) || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!provided || !secretMatches(provided, cronSecret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  if (!process.env.UPSTASH_REDIS_REST_URL) return res.status(500).json({ error: 'UPSTASH_REDIS_REST_URL not set' });

  // TOPIC SELECTION — never write the same subject twice. Every post records the
  // exact topic string it came from (see `topic` on `draft` below); we read those
  // back and only pick from what's left. If every topic is exhausted we DO NOT
  // generate — we email instead, because the right response to "nothing new to
  // say" is to add new topics, not to duplicate an old post's subject.
  const usedTopics = new Set<string>();
  try {
    const slugsData = await upstash(['SMEMBERS', 'blog:slugs']);
    const existing: string[] = slugsData.result || [];
    for (const s of existing) {
      const d = await upstash(['GET', `blog:post:${s}`]);
      if (!d.result) continue;
      try {
        const post = JSON.parse(d.result);
        if (post.topic) usedTopics.add(post.topic);
      } catch { /* ignore an unparseable record */ }
    }
  } catch (err) {
    console.error('auto-blog-generate: could not read existing topics, proceeding:', err);
  }

  // CATEGORY ROTATION — today's category is fixed by the UTC date so consecutive
  // posts alternate (Digital Marketing -> Signage -> Commercial Wraps ->
  // Wayfinding Signage -> repeat) instead of landing wherever chance puts them.
  // If today's category has no unused topics left, move to the next category in
  // the rotation that still has one; only give up once every category is dry.
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  const startIndex = daysSinceEpoch % CATEGORY_ORDER.length;

  let category = '';
  let topic = '';
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const candidate = CATEGORY_ORDER[(startIndex + i) % CATEGORY_ORDER.length];
    const remaining = TOPICS_BY_CATEGORY[candidate].filter((t) => !usedTopics.has(t));
    if (remaining.length) {
      category = candidate;
      topic = remaining[Math.floor(Math.random() * remaining.length)];
      break;
    }
  }

  if (!topic) {
    console.warn('auto-blog-generate: every topic is used — not generating a duplicate');
    try {
      await new Resend(resendKey).emails.send({
        from: 'ikonic303 Blog <blog@ikonicmarketing303.com>',
        to: 'info@ikonicmarketing303.com',
        subject: 'Blog generator paused — the topic list is used up',
        html: `<p>The daily blog generator ran but every topic in its list has already been
               published, so it did not write anything rather than duplicate an existing post.</p>
               <p><strong>To restart it:</strong> add new topics to <code>TOPICS_BY_CATEGORY</code> in
               <code>api/_lib/blog/auto-blog-generate.ts</code>.</p>
               <p>${usedTopics.size} topics used.</p>`,
      });
    } catch (err) {
      console.error('auto-blog-generate: exhausted-notice email failed:', err);
    }
    return res.status(200).json({ ok: true, skipped: 'all topics used', used: usedTopics.size });
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const prompt = `You are a professional content writer for ikonic303, a Denver-based company specializing in digital marketing, business signage, wayfinding signage, storefront window graphics and wall murals, and flat-glass window film for homes and businesses. ikonic does NOT offer vehicle services of any kind (no vehicle wraps, no automotive window tint, no paint protection film, no ceramic coating) — never write about vehicles, cars, trucks, fleets, or automotive tint law (VLT).

Write a high-quality, SEO-optimized blog post on this topic: "${topic}"
This post belongs to the "${category}" category.

Return ONLY a single valid JSON object — no markdown, no code fences, just the JSON:
{
  "title": "compelling SEO title (60 chars max)",
  "slug": "url-friendly-slug-with-hyphens-only",
  "excerpt": "2-3 sentence compelling description for the blog listing page",
  "content": "full article as clean HTML (use h2, h3, p, ul, li, strong tags; 900-1300 words; no outer html/body/head tags; no inline styles; no class attributes)",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Make it genuinely helpful and relevant to Denver business owners. Include real actionable advice. Write at an 8th-grade reading level. Mention Denver or Colorado where natural.`;

  let postData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
  };

  let lastErr = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      postData = JSON.parse(result.text ?? '{}');
      break;
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err.message : 'Unknown error';
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  if (!postData!) {
    return res.status(500).json({ error: 'Gemini generation failed after 3 attempts: ' + lastErr });
  }

  const token = randomUUID();
  const slug = (postData.slug || token).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const now = new Date().toISOString();

  // NOTE: named `draft`, but status is 'published' — generated posts go LIVE immediately.
  // The token/publish-blog flow is a leftover from when they were held for review.
  const draft = {
    token,
    topic, // recorded so the next run can exclude this subject — see topic selection above
    title: postData.title,
    slug,
    excerpt: postData.excerpt,
    content: postData.content,
    category,
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    author: 'ikonic303',
    status: 'published',
    createdAt: now,
    publishedAt: now,
  };

  await upstash(['SET', `blog:post:${slug}`, JSON.stringify(draft)]);
  await upstash(['SADD', 'blog:slugs', slug]);

  const postUrl = `https://ikonic303.com/post/${slug}`;

  // Content preview — strip HTML tags for a clean text preview in the email
  const textPreview = draft.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 800);

  const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#f0f0f0;padding:28px;">

  <div style="background:#0B0D10;padding:22px 28px;border-radius:12px;margin-bottom:20px;text-align:center;">
    <h1 style="color:#00FF9D;font-size:18px;margin:0;letter-spacing:2px;">✅ NEW BLOG POST PUBLISHED</h1>
    <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">Auto-published · Live on ikonic303.com/blogs</p>
  </div>

  <div style="background:white;border-radius:12px;padding:28px;margin-bottom:16px;">
    <p style="color:#888;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">${draft.category}</p>
    <h2 style="font-size:24px;color:#0B0D10;margin:0 0 14px;line-height:1.3;">${draft.title}</h2>
    <p style="color:#444;font-size:14px;line-height:1.7;border-left:3px solid #00FF9D;padding-left:14px;margin:0 0 20px;">${draft.excerpt}</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:18px;font-size:13px;color:#333;line-height:1.75;">
      ${textPreview}${draft.content.length > 800 ? '&hellip;' : ''}
    </div>
    <div style="margin-top:14px;">
      ${draft.tags.map((t: string) => `<span style="display:inline-block;background:#e8f5f0;color:#00aa66;font-size:11px;padding:3px 10px;border-radius:999px;margin:2px;">#${t}</span>`).join('')}
    </div>
  </div>

  <div style="text-align:center;margin-bottom:20px;">
    <a href="${postUrl}" style="display:inline-block;background:#00FF9D;color:#0B0D10;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">
      View Live Post →
    </a>
  </div>

  <p style="text-align:center;color:#aaa;font-size:11px;margin:0;">ikonic303 · ikonic303.com</p>
</div>`;

  const resend = new Resend(resendKey);
  try {
    await resend.emails.send({
      from: 'ikonic303 Blog <blog@ikonicmarketing303.com>',
      to: 'info@ikonicmarketing303.com',
      subject: `✅ New Blog Post Live: "${draft.title}"`,
      html: emailHtml,
    });
  } catch (emailErr: unknown) {
    const msg = emailErr instanceof Error ? emailErr.message : 'Unknown';
    return res.status(500).json({ error: 'Draft saved but email failed: ' + msg });
  }

  return res.status(200).json({ success: true, slug, title: draft.title, topic });
}
