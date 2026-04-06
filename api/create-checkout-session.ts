import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Payment not configured' });
  }

  const stripe = new Stripe(secretKey);

  const {
    total,          // number in dollars
    description,    // short order description
    customerEmail,  // optional prefill
    metadata,       // order details for records
    successUrl,
    cancelUrl,
  } = req.body;

  if (!total || total <= 0) {
    return res.status(400).json({ error: 'Invalid order total' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(total * 100), // cents
            product_data: {
              name: 'Ikonic Print & Ship Order',
              description: description || 'Custom print order',
            },
          },
          quantity: 1,
        },
      ],
      metadata: metadata || {},
      success_url: successUrl || `${req.headers.origin}/print-and-ship?payment=success`,
      cancel_url:  cancelUrl  || `${req.headers.origin}/print-and-ship?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
