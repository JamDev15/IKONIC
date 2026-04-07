import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BLOG_RSS = process.env.GHL_BLOG_RSS_URL || '';

function parseRSS(xml: string) {
  const items: any[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const content = match[1];

    const get = (tag: string) => {
      const m = content.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] || m[2] || '').trim() : '';
    };

    const imgMatch = content.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp|gif)/i);
    const enclosureMatch = content.match(/<enclosure[^>]+url="([^"]+)"/);
    const mediaMatch = content.match(/<media:content[^>]+url="([^"]+)"/);

    items.push({
      title: get('title'),
      excerpt: get('description').replace(/<[^>]+>/g, '').slice(0, 200).trim(),
      link: get('link'),
      date: new Date(get('pubDate')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: get('author') || get('dc:creator') || 'Ikonic Team',
      category: get('category') || 'Marketing',
      image: enclosureMatch?.[1] || mediaMatch?.[1] || imgMatch?.[0] || '',
    });
  }

  return items;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!GHL_BLOG_RSS) {
    return res.status(500).json({ error: 'GHL_BLOG_RSS_URL not configured' });
  }

  try {
    const response = await fetch(GHL_BLOG_RSS, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch RSS feed' });
    }

    const xml = await response.text();
    const posts = parseRSS(xml);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(500).json({ error: 'RSS parse error' });
  }
}
