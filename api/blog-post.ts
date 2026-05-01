import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BASE_URL = 'https://go.ikonicmarketing303.com';
const GHL_BLOG_ID = '882';
const GHL_LOC = 'DSt3GeDVV0wQXQt9iuGn';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

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
  try {
    return JSON.parse('[' + match[1] + ']');
  } catch {
    return null;
  }
}

function extractContent(obj: any): string {
  if (!obj || typeof obj !== 'object') return '';
  for (const key of ['rawHTML', 'rawHtml', 'htmlContent', 'content', 'body', 'postBody', 'html']) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 50) return v;
    if (v && typeof v === 'object') {
      const nested = extractContent(v);
      if (nested) return nested;
    }
  }
  return '';
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

async function tryFetch(url: string, headers: Record<string, string>): Promise<any> {
  try {
    const r = await fetch(url, { headers });
    const text = await r.text();
    const data = text ? JSON.parse(text) : null;
    return { ok: r.ok, status: r.status, data };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

function pickList(data: any): any[] {
  for (const value of [data?.posts, data?.blogs, data?.blogPosts, data?.data, data?.items, data]) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function findBestHtmlContent(value: any, seen = new WeakSet<object>(), depth = 0): string {
  if (depth > 14 || value === null || value === undefined) return '';

  if (typeof value === 'string') {
    const decoded = decodeHtmlEntities(value);
    if (decoded.length > 200 && /<\/?(p|h[1-6]|ul|ol|li|blockquote|strong|div|span|img)\b/i.test(decoded)) {
      return decoded;
    }
    return '';
  }

  if (typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  let best = '';
  const direct = extractContent(value);
  if (direct) best = decodeHtmlEntities(direct);

  const values = Array.isArray(value) ? value : Object.values(value);
  for (const child of values) {
    const candidate = findBestHtmlContent(child, seen, depth + 1);
    if (candidate.length > best.length) best = candidate;
  }

  return best;
}

function extractArticleHtml(html: string): string {
  const patterns = [
    /<article\b[^>]*>([\s\S]+?)<\/article>/i,
    /<main\b[^>]*>([\s\S]+?)<\/main>/i,
    /<div\b[^>]*class="[^"]*(?:blog|post|content|article)[^"]*"[^>]*>([\s\S]+?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] && match[1].length > 500) return match[1];
  }

  return '';
}

async function fetchRenderedPostContent(slug: string, canonicalLink: string | undefined, debug: any[]): Promise<string> {
  const urls = uniqueStrings([
    canonicalLink,
    `${GHL_BASE_URL}/post/${slug}`,
    `${GHL_BASE_URL}/blogs/${slug}`,
  ]);

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': UA } });
      const html = await response.text();
      debug.push({ url, publicPage: true, ok: response.ok, status: response.status, htmlLength: html.length });
      if (!response.ok) continue;

      const arr = parseNuxtData(html);
      if (arr) {
        let best = '';
        for (let i = 0; i < arr.length; i += 1) {
          const candidate = findBestHtmlContent(resolveNuxtArr(arr, i));
          if (candidate.length > best.length) best = candidate;
        }
        if (best) return best;
      }

      const articleHtml = extractArticleHtml(html);
      if (articleHtml) return articleHtml;
    } catch (e: any) {
      debug.push({ url, publicPage: true, ok: false, error: e.message });
    }
  }

  return '';
}

function extractBlogIdFromPage(blogData: any, post: any): string {
  const candidates = uniqueStrings([
    blogData?._id,
    blogData?.id,
    blogData?.blogId,
    blogData?.blog?._id,
    blogData?.blog?.id,
    blogData?.site?._id,
    blogData?.site?.id,
    post?.blogId,
    post?.blog?._id,
    post?.blog?.id,
    GHL_BLOG_ID,
  ]);

  return candidates[0] ?? GHL_BLOG_ID;
}

async function fetchContent(slug: string, postId: string, blogApiId: string): Promise<{ content: string; debug: any[] }> {
  const key = process.env.GHL ?? process.env.GHL_API_KEY ?? '';
  const debug: any[] = [];

  if (!key) {
    debug.push({ step: 'api_key', found: false });
    return { content: '', debug };
  }

  debug.push({ step: 'api_key', found: true, prefix: key.substring(0, 8) + '...' });

  const v2Headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    Version: '2021-07-28',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Location-Id': GHL_LOC,
    locationId: GHL_LOC,
  };

  const base = 'https://services.leadconnectorhq.com';
  const postQuery = new URLSearchParams({
    locationId: GHL_LOC,
    blogId: blogApiId,
    limit: '100',
    offset: '0',
    search: slug,
  });

  const attempts = uniqueStrings([
    `${base}/blogs/site/all?locationId=${encodeURIComponent(GHL_LOC)}`,
    `${base}/blogs/posts/all?${postQuery.toString()}`,
    `${base}/blogs/posts/all?blogId=${encodeURIComponent(blogApiId)}&locationId=${encodeURIComponent(GHL_LOC)}`,
    `${base}/blogs/posts/${postId}`,
    `${base}/blogs/${blogApiId}/posts/${postId}`,
    `${base}/blog/posts/${postId}`,
    `${base}/blogs/${blogApiId}/posts?limit=50`,
    `${base}/blogs/posts?blogId=${blogApiId}&limit=50`,
    `${base}/blogs/posts?locationId=${GHL_LOC}&limit=50`,
    `${base}/blogs/?locationId=${GHL_LOC}`,
    `${base}/blogs/`,
  ]);
  const queued = new Set(attempts);

  for (let i = 0; i < attempts.length; i += 1) {
    const url = attempts[i];
    const result = await tryFetch(url, v2Headers);
    debug.push({ url, ok: result.ok, status: result.status, error: result.error });

    if (!result.ok) continue;

    const d = result.data;
    const blogList = pickList(d);
    if (blogList[0] && !blogList[0]?.urlSlug && !blogList[0]?.slug) {
      const foundBlogIds = uniqueStrings(blogList.map((b: any) => b._id ?? b.id ?? b.blogId));
      debug.push({
        foundBlogIds: blogList.map((b: any) => ({
          id: b._id ?? b.id ?? b.blogId,
          name: b.name ?? b.title,
          urlSlug: b.urlSlug ?? b.slug,
        })),
      });

      for (const id of foundBlogIds) {
        const discoveredUrl = `${base}/blogs/posts/all?blogId=${encodeURIComponent(id)}&locationId=${encodeURIComponent(GHL_LOC)}&limit=100&offset=0&search=${encodeURIComponent(slug)}`;
        if (!queued.has(discoveredUrl)) {
          queued.add(discoveredUrl);
          attempts.push(discoveredUrl);
        }
      }
    }

    const single = d?.post ?? d?.data ?? d;
    const singleContent = extractContent(single);
    if (singleContent) return { content: singleContent, debug };

    const list = pickList(d);
    if (list.length > 0) {
      if (list[0]) debug.push({ sampleKeys: Object.keys(list[0]), firstSlug: list[0].urlSlug ?? list[0].slug });
      const match = list.find((p: any) => (
        p.urlSlug === slug ||
        p.slug === slug ||
        p._id === postId ||
        p.id === postId
      ));
      if (match) {
        const c = extractContent(match);
        if (c) return { content: c, debug };
        debug.push({ matchedPost: true, keys: Object.keys(match) });
      }
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
    const blogApiId = extractBlogIdFromPage(blogData, post);
    const result = await fetchContent(slug, postId, blogApiId);
    const debug = result.debug;
    const content = result.content || await fetchRenderedPostContent(slug, post.canonicalLink, debug);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
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
      ...((_debug === '1') ? { _debug: { postId, blogApiId, debug } } : {}),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load post' });
  }
}
