import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId  = process.env.SQUARE_LOCATION_ID;

  if (!accessToken || !locationId) {
    return res.status(500).json({ error: 'Payment not configured — Square keys missing' });
  }

  const { total, description, successUrl } = req.body;

  if (!total || total <= 0) {
    return res.status(400).json({ error: 'Invalid order total' });
  }

  const base = process.env.SQUARE_ENV === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

  try {
    const response = await fetch(`${base}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        quick_pay: {
          name: description || 'Ikonic Print & Ship Order',
          price_money: {
            amount: Math.round(total * 100),
            currency: 'USD',
          },
          location_id: locationId,
        },
        checkout_options: {
          redirect_url: successUrl || `${req.headers.origin}/print-ship?payment=success`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.errors?.[0]?.detail || 'Square checkout error';
      throw new Error(msg);
    }

    return res.status(200).json({ url: data.payment_link.url });
  } catch (err: any) {
    console.error('Square error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
