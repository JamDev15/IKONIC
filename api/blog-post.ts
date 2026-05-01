import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BASE_URL  = 'https://go.ikonicmarketing303.com';
const GHL_BLOG_ID   = '882';
const GHL_LOCATION  = 'DSt3GeDVV0wQXQt9iuGn';
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

// ── GHL REST API (requires GHL_API_KEY env var) ───────────────────────────────
async function fetchContentViaAPI(slug: string): Promise<string> {
  const key = process.env.GHL_API_KEY;
  if (!key) return '';

  // Try v2 API first
  try {
    const v2 = await fetch(
      `https://services.leadconnectorhq.com/blogs/posts?blogId=${GHL_BLOG_ID}&urlSlug=${encodeURIComponent(slug)}&locationId=${GHL_LOCATION}`,
      { headers: { Authorization: `Bearer ${key}`, Version: '2021-07-28', 'Content-Type': 'application/json' } }
    );
    if (v2.ok) {
      const data = await v2.json();
      const post = data?.posts?.[0] ?? data?.post ?? data;
      const content = post?.rawHtml ?? post?.content ?? post?.htmlContent ?? '';
      if (content && content.length > 50) return content;
    }
  } catch {}

  // Fall back to v1 API
  try {
    const v1 = await fetch(
      `https://rest.gohighlevel.com/v1/blogs/${GHL_BLOG_ID}/posts?urlSlug=${encodeURIComponent(slug)}&locationId=${GHL_LOCATION}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (v1.ok) {
      const data = await v1.json();
      const post = data?.posts?.[0] ?? data?.post ?? data;
      const content = post?.rawHtml ?? post?.content ?? post?.htmlContent ?? '';
      if (content && content.length > 50) return content;
    }
  } catch {}

  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'slug required' });

  try {
    // Fetch listing metadata + content in parallel
    const [listingHtml, apiContent] = await Promise.all([
      fetch(`${GHL_BASE_URL}/blogs`, { headers: { 'User-Agent': UA } }).then(r => r.text()),
      fetchContentViaAPI(slug),
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

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json({
      title: post.title ?? '',
      description: post.description ?? '',
      content: apiContent,
      urlSlug: post.urlSlug ?? '',
      image: post.imageUrl ?? '',
      imageAlt: post.imageAltText ?? '',
      author: post.author?.name ?? 'Ikonic Team',
      publishedAt: post.publishedAt ?? '',
      category: post.categories?.[0]?.label?.replace(/-/g, ' ') ?? 'Marketing',
      tags: post.tags ?? [],
      readTime: post.readTimeInMinutes ? Math.ceil(post.readTimeInMinutes) : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load post' });
  }
}
