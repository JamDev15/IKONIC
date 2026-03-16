import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { businessName, wrapStyle, colorTheme, brandColors, services, tagline } = req.body;

  if (!businessName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const styleDescriptions: Record<string, string> = {
    full: 'full coverage wrap — entire vehicle body covered with bold color blocks and graphic shapes',
    partial: 'partial wrap — bold color panels on lower body and doors, upper body in base color',
    decals: 'minimal decal style — clean logo placement on doors, simple stripe or accent line',
  };

  const colorInstruction = brandColors
    ? `Primary colors: ${brandColors}.`
    : `Color theme: ${colorTheme} — use 2-3 complementary colors that work well together.`;

  const serviceText = Array.isArray(services) && services.length > 0
    ? services.slice(0, 3).join('  |  ')
    : '';

  const prompt = `Create a professional commercial vehicle wrap design sheet in FLAT VECTOR ILLUSTRATION style, exactly like a professional wrap design template.

LAYOUT: White background canvas. Show a sedan or SUV from 3 angles arranged neatly:
- Large LEFT SIDE PROFILE view (biggest, center-left)
- Smaller REAR VIEW (top-right corner)
- Smaller FRONT VIEW (bottom-right corner)

DESIGN STYLE:
- Flat vector graphic illustration — NO photorealism, NO 3D rendering, NO shadows
- Clean geometric color blocks: diagonal panels, sharp angular shapes
- ${styleDescriptions[wrapStyle] || styleDescriptions.full}
- ${colorInstruction}
- Smooth color gradients only within large shape panels
- White and dark contrast areas for text readability

TEXT ON WRAP (keep minimal and clean):
- Company name: "${businessName}" in large clean bold sans-serif font
${tagline ? `- Tagline: "${tagline}" in smaller font` : ''}
${serviceText ? `- Service strip at bottom: "${serviceText}"` : ''}
- Website placeholder at bottom strip

QUALITY: Professional wrap design sheet, crisp vector edges, print-ready appearance, clean layout matching industry-standard wrap template sheets.`;

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: 'No image returned from OpenAI' });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return res.status(500).json({ error: message });
  }
}
