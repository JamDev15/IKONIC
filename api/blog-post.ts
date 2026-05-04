import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BASE_URL = 'https://go.ikonicmarketing303.com';
const GHL_LOC      = 'DSt3GeDVV0wQXQt9iuGn';
const GHL_API      = 'https://services.leadconnectorhq.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── GHL API content fetch ────────────────────────────────────────────────────

async function fetchGhlContent(slug: string, postId: string): Promise<{ content: string; debug: any[] }> {
  const key = process.env.GHL ?? process.env.GHL_API_KEY ?? '';
  const debug: any[] = [];

  if (!key) {
    debug.push({ step: 'no_api_key' });
    return { content: '', debug };
  }

  const headers = {
    Authorization: `Bearer ${key}`,
    Version: '2021-07-28',
    Accept: 'application/json',
  };

  // Step 1 — search ALL blog sites for the post
  const sites: any[] = [];
  try {
    const sitesRes = await fetch(
      `${GHL_API}/blogs/site/all?locationId=${GHL_LOC}&skip=0&limit=10`,
      { headers }
    );
    const sitesData = await sitesRes.json();
    sites.push(...(sitesData?.data ?? sitesData?.blogs ?? sitesData?.sites ?? []));
    debug.push({ step: 'all_sites', count: sites.length, ids: sites.map((s: any) => ({ id: s._id, name: s.name })) });
  } catch (e: any) {
    debug.push({ step: 'sites_list_error', error: e.message });
  }

  const allBlogIds = [...new Set(sites.map((s: any) => s._id ?? s.id).filter(Boolean))];

  // Build URL variants to try for each blogId
  const urlVariants = (bid: string) => [
    `${GHL_API}/blogs/posts/all?locationId=${GHL_LOC}&blogId=${bid}&limit=50&offset=0`,
    `${GHL_API}/blogs/posts/all?locationId=${GHL_LOC}&blogId=${bid}&limit=50&skip=0`,
    `${GHL_API}/blogs/posts/all?locationId=${GHL_LOC}&blogId=${bid}&limit=50&offset=0&status=PUBLISHED`,
  ];

  // Also try without blogId
  const noIdVariants = [
    `${GHL_API}/blogs/posts/all?locationId=${GHL_LOC}&limit=50&offset=0`,
    `${GHL_API}/blogs/posts/all?locationId=${GHL_LOC}&limit=50&skip=0`,
  ];

  const allUrls = [...allBlogIds.flatMap(urlVariants), ...noIdVariants];

  for (const url of allUrls) {
    try {
      const postsRes = await fetch(url, { headers });
      const postsData = await postsRes.json();
      const posts: any[] = postsData?.blogs ?? postsData?.posts ?? postsData?.data ?? postsData?.items ?? [];
      debug.push({ step: 'posts_try', url: url.replace(GHL_API, ''), status: postsRes.status, count: posts.length });

      if (posts.length === 0) continue;

      const post = posts.find((p: any) => p.urlSlug === slug || p._id === postId);
      if (post) {
        debug.push({ step: 'matched', keys: Object.keys(post) });
        for (const field of ['rawHtml', 'rawHTML', 'htmlContent', 'content', 'body', 'postBody', 'html']) {
          const val = post[field];
          if (typeof val === 'string' && val.length > 100 && /<\w/i.test(val)) {
            debug.push({ step: 'content_found', field, length: val.length });
            return { content: val, debug };
          }
        }
        debug.push({ step: 'post_found_no_html', allKeys: Object.keys(post), sample: Object.fromEntries(Object.entries(post).map(([k, v]) => [k, typeof v === 'string' ? (v as string).substring(0, 80) : v])) });
      } else {
        debug.push({ step: 'not_matched', totalPosts: posts.length, slugs: posts.slice(0, 5).map((p: any) => p.urlSlug) });
      }
    } catch (e: any) {
      debug.push({ step: 'posts_error', url: url.replace(GHL_API, ''), error: (e as any).message });
    }
  }

  return { content: '', debug };
}

// ── Main handler ─────────────────────────────────────────────────────────────

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
    const { content, debug } = await fetchGhlContent(slug, postId);

    res.setHeader('Cache-Control', 'no-store');
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
      ...(_debug === '1' ? { _debug: { postId, debug } } : {}),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load post' });
  }
}
