import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BLOG_URL = 'https://go.ikonicmarketing303.com/blogs';

function resolveNuxtArr(arr: any[], idx: number, depth = 0): any {
  if (depth > 12 || idx === -1 || idx === null || idx === undefined) return null;
  if (idx >= arr.length) return idx;
  const val = arr[idx];
  if (typeof val === 'string' || typeof val === 'boolean' || val === null) return val;
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) return val.map((i: any) => resolveNuxtArr(arr, i, depth + 1));
  if (typeof val === 'object') {
    const obj: any = {};
    for (const [k, v] of Object.entries(val)) {
      obj[k] = typeof v === 'number' ? resolveNuxtArr(arr, v as number, depth + 1) : v;
    }
    return obj;
  }
  return val;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  try {
    const html = await fetch(GHL_BLOG_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    }).then(r => r.text());

    const match = html.match(/__NUXT_DATA__">\[(.+?)\]<\/script/s);
    if (!match) return res.status(502).json({ error: 'Could not parse blog data' });

    const arr: any[] = JSON.parse('[' + match[1] + ']');
    const stateStr = JSON.stringify(arr);
    const blogKeyMatch = stateStr.match(/"blogPosts-[^"]+":(\d+)/);
    if (!blogKeyMatch) return res.status(502).json({ error: 'blogPosts key not found' });

    const blogRootIdx = parseInt(blogKeyMatch[1]);
    const blogData = resolveNuxtArr(arr, blogRootIdx);
    const rawPosts: any[] = blogData?.blogPosts ?? [];

    const post = rawPosts.find((p: any) => p.urlSlug === slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    return res.status(200).json({
      title: post.title ?? '',
      description: post.description ?? '',
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
