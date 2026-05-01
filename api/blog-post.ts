import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BASE_URL = 'https://go.ikonicmarketing303.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function resolveNuxtArr(arr: any[], idx: number, depth = 0): any {
  if (depth > 20 || idx === -1 || idx === null || idx === undefined) return null;
  if (typeof idx !== 'number' || idx >= arr.length) return idx;
  const val = arr[idx];
  if (typeof val === 'string' || typeof val === 'boolean' || val === null) return val;
  if (typeof val === 'number') return resolveNuxtArr(arr, val, depth + 1);
  if (Array.isArray(val)) return val.map((i: any) => (typeof i === 'number' ? resolveNuxtArr(arr, i, depth + 1) : i));
  if (typeof val === 'object') {
    const obj: any = {};
    for (const [k, v] of Object.entries(val)) {
      obj[k] = typeof v === 'number' ? resolveNuxtArr(arr, v as number, depth + 1) : v;
    }
    return obj;
  }
  return val;
}

function parseNuxtData(html: string): any[] | null {
  const match = html.match(/__NUXT_DATA__">\[(.+?)\]<\/script/s);
  if (!match) return null;
  try { return JSON.parse('[' + match[1] + ']'); } catch { return null; }
}

async function extractContentFromPostPage(slug: string): Promise<string> {
  let html = '';
  try {
    const res = await fetch(`${GHL_BASE_URL}/post/${slug}`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!res.ok) return '';
    html = await res.text();
  } catch { return ''; }

  // ── Strategy A: NUXT_DATA — scan every string in the array ──────────────────
  const arr = parseNuxtData(html);
  if (arr) {
    // A1: look for any string with block-level HTML tags, pick the longest
    let best = '';
    for (const val of arr) {
      if (
        typeof val === 'string' &&
        val.length > best.length &&
        val.length > 150 &&
        /<(?:p|h[1-6]|ul|ol|div|section|blockquote)[\s>]/i.test(val)
      ) {
        best = val;
      }
    }
    if (best.length > 150) return best;

    // A2: resolve all objects and look for rawHtml / content fields
    const stateStr = JSON.stringify(arr);
    const allNumKeys = [...stateStr.matchAll(/"(?:rawHtml|htmlContent|content|body|postBody)":(\d+)/g)];
    for (const km of allNumKeys) {
      const resolved = resolveNuxtArr(arr, parseInt(km[1]));
      if (typeof resolved === 'string' && resolved.length > 150) return resolved;
    }
  }

  // ── Strategy B: rendered HTML extraction ────────────────────────────────────
  // Strip scripts & styles so we don't accidentally grab JS strings
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // B1: <article> tag (most semantic)
  const article = clean.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? '';
  if (article.replace(/<[^>]*>/g, '').trim().length > 80) return article;

  // B2: <main> tag
  const mainTag = clean.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? '';
  if (mainTag.replace(/<[^>]*>/g, '').trim().length > 80) return mainTag;

  // B3: GHL-specific class patterns
  for (const cls of ['blog-post-content', 'post-content', 'entry-content', 'hl-blog-post', 'blog-content', 'post-body']) {
    const re = new RegExp(`class="[^"]*${cls}[^"]*"[\\s\\S]*?>([\\s\\S]+?)</div>`, 'i');
    const m = clean.match(re);
    if (m && m[1].replace(/<[^>]*>/g, '').trim().length > 80) return m[1];
  }

  // B4: collect all <p> tags with real text (≥40 chars) as fallback
  const ps = [...(clean.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi) ?? [])];
  const body = ps
    .filter(m => m[1].replace(/<[^>]*>/g, '').trim().length >= 40)
    .map(m => `<p>${m[1]}</p>`)
    .join('\n');
  if (body.length > 80) return body;

  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'slug required' });

  try {
    // Fetch listing metadata + individual post content in parallel
    const [listingHtml, content] = await Promise.all([
      fetch(`${GHL_BASE_URL}/blogs`, { headers: { 'User-Agent': UA } }).then(r => r.text()),
      extractContentFromPostPage(slug),
    ]);

    const arr = parseNuxtData(listingHtml);
    if (!arr) return res.status(502).json({ error: 'Could not parse blog listing data' });

    const stateStr = JSON.stringify(arr);
    const blogKeyMatch = stateStr.match(/"blogPosts-[^"]+":(\d+)/);
    if (!blogKeyMatch) return res.status(502).json({ error: 'blogPosts key not found' });

    const blogData = resolveNuxtArr(arr, parseInt(blogKeyMatch[1]));
    const rawPosts: any[] = blogData?.blogPosts ?? [];
    const post = rawPosts.find((p: any) => p.urlSlug === slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Also check if listing data itself has rawHtml (some GHL configs include it)
    const listingContent = post.rawHtml ?? post.htmlContent ?? post.content ?? '';
    const finalContent = (listingContent && listingContent.length > content.length)
      ? listingContent
      : content;

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json({
      title: post.title ?? '',
      description: post.description ?? '',
      content: finalContent,
      urlSlug: post.urlSlug ?? '',
      image: post.imageUrl ?? '',
      imageAlt: post.imageAltText ?? '',
      author: post.author?.name ?? 'Ikonic Team',
      publishedAt: post.publishedAt ?? '',
      category: post.categories?.[0]?.label?.replace(/-/g, ' ') ?? 'Marketing',
      tags: post.tags ?? [],
      readTime: post.readTimeInMinutes ? Math.ceil(post.readTimeInMinutes) : null,
      externalUrl: post.canonicalLink ?? `${GHL_BASE_URL}/post/${slug}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load post' });
  }
}
