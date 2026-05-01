import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BASE_URL = 'https://go.ikonicmarketing303.com';
const GHL_BLOG_ID  = '882';
const GHL_LOC      = 'DSt3GeDVV0wQXQt9iuGn';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

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

function extractContent(obj: any): string {
  if (!obj || typeof obj !== 'object') return '';
  for (const key of ['rawHtml', 'htmlContent', 'content', 'body', 'postBody', 'html']) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 50) return v;
  }
  return '';
}

async function tryFetch(url: string, headers: Record<string, string>): Promise<any> {
  try {
    const r = await fetch(url, { headers });
    const text = await r.text();
    const data = JSON.parse(text);
    return { ok: r.ok, status: r.status, data };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

async function fetchContent(slug: string, postId: string): Promise<{ content: string; debug: any[] }> {
  const key = process.env.GHL ?? process.env.GHL_API_KEY ?? '';
  const debug: any[] = [];

  if (!key) {
    debug.push({ step: 'api_key', found: false });
    return { content: '', debug };
  }

  debug.push({ step: 'api_key', found: true, prefix: key.substring(0, 8) + '...' });

  const v2Headers = {
    Authorization: `Bearer ${key}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  };

  const attempts = [
    // By post ID (most reliable)
    `https://services.leadconnectorhq.com/blogs/posts/${postId}`,
    `https://services.leadconnectorhq.com/blogs/posts/${postId}?locationId=${GHL_LOC}`,
    // By slug in list
    `https://services.leadconnectorhq.com/blogs/${GHL_BLOG_ID}/posts?locationId=${GHL_LOC}&limit=20`,
    `https://services.leadconnectorhq.com/blogs/posts?locationId=${GHL_LOC}&blogId=${GHL_BLOG_ID}&limit=20`,
    // v1 fallback
    `https://rest.gohighlevel.com/v1/blogs/${GHL_BLOG_ID}/posts?locationId=${GHL_LOC}`,
  ];

  for (const url of attempts) {
    const result = await tryFetch(url, v2Headers);
    debug.push({ url, ok: result.ok, status: result.status, error: result.error });

    if (!result.ok) continue;

    const d = result.data;
    // Single post response
    const single = d?.post ?? d?.data ?? d;
    const singleContent = extractContent(single);
    if (singleContent) return { content: singleContent, debug };

    // List response — find by slug
    const list: any[] = d?.posts ?? d?.data ?? d?.items ?? [];
    if (Array.isArray(list)) {
      const match = list.find((p: any) => p.urlSlug === slug || p._id === postId);
      if (match) {
        const c = extractContent(match);
        if (c) return { content: c, debug };
      }
      // If we got a list, also check first item's keys for debugging
      if (list[0]) debug.push({ sampleKeys: Object.keys(list[0]) });
    }
  }

  return { content: '', debug };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug, _debug } = req.query;
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'slug required' });

  try {
    const listingHtml = await fetch(`${GHL_BASE_URL}/blogs`, { headers: { 'User-Agent': UA } }).then(r => r.text());

    const arr = parseNuxtData(listingHtml);
    if (!arr) return res.status(502).json({ error: 'Could not parse blog listing data' });

    const stateStr = JSON.stringify(arr);
    const blogKeyMatch = stateStr.match(/"blogPosts-[^"]+":(\d+)/);
    if (!blogKeyMatch) return res.status(502).json({ error: 'blogPosts key not found' });

    const blogData = resolveNuxtArr(arr, parseInt(blogKeyMatch[1]));
    const rawPosts: any[] = blogData?.blogPosts ?? [];
    const post = rawPosts.find((p: any) => p.urlSlug === slug);
    if (!post) return res.status(404).json({
      error: 'Post not found',
      requestedSlug: slug,
      availableSlugs: rawPosts.map((p: any) => p.urlSlug),
    });

    const postId: string = post._id ?? '';
    const { content, debug } = await fetchContent(slug, postId);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json({
      title: post.title ?? '',
      description: post.description ?? '',
      content,
      urlSlug: post.urlSlug ?? '',
      image: post.imageUrl ?? '',
      imageAlt: post.imageAltText ?? '',
      author: post.author?.name ?? 'Ikonic Team',
      publishedAt: post.publishedAt ?? '',
      category: post.categories?.[0]?.label?.replace(/-/g, ' ') ?? 'Marketing',
      tags: post.tags ?? [],
      readTime: post.readTimeInMinutes ? Math.ceil(post.readTimeInMinutes) : null,
      // debug info — remove once working
      ...((_debug === '1') ? { _debug: { postId, debug } } : {}),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load post' });
  }
}
