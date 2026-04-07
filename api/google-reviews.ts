import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({ error: 'Google Places not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(500).json({ error: data.status });
    }

    const reviews = (data.result.reviews || [])
      .filter((r: any) => r.rating >= 4)
      .map((r: any) => ({
        name: r.author_name,
        avatar: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      reviews,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
