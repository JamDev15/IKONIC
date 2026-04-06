import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
  };
}

// Find existing GHL contact by email, or create one
async function findOrCreateContact(
  apiKey: string,
  locationId: string,
  name: string,
  email: string,
  phone?: string,
): Promise<string> {
  // Search first
  const searchRes = await fetch(
    `${GHL}/contacts/search?locationId=${locationId}&query=${encodeURIComponent(email)}`,
    { headers: ghlHeaders(apiKey) },
  );
  const searchData = await searchRes.json();
  if (searchData.contacts?.length > 0) {
    return searchData.contacts[0].id;
  }

  // Create new contact
  const [firstName, ...rest] = name.trim().split(' ');
  const createRes = await fetch(`${GHL}/contacts/`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      firstName: firstName || name,
      lastName: rest.join(' ') || '',
      email,
      phone: phone || undefined,
    }),
  });
  const createData = await createRes.json();
  return createData.contact.id;
}

// Create a GHL invoice and return its payment URL
async function createInvoice(
  apiKey: string,
  locationId: string,
  paymentDomain: string,
  contactId: string,
  contactName: string,
  contactEmail: string,
  total: number,
  description: string,
): Promise<string> {
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]; // 7 days out

  const res = await fetch(`${GHL}/invoices/`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      altId: locationId,
      altType: 'location',
      name: 'Ikonic Print & Ship Order',
      currency: 'USD',
      contactDetails: {
        id: contactId,
        name: contactName,
        email: contactEmail,
      },
      items: [
        {
          name: 'Custom Print & Ship Order',
          description,
          currency: 'USD',
          amount: total,
          qty: 1,
          type: 'one_time',
        },
      ],
      dueDate,
      liveMode: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to create GHL invoice');
  }

  const invoiceId = data?.invoice?._id;
  if (!invoiceId) throw new Error('No invoice ID returned from GHL');

  // GHL hosted payment page
  return `${paymentDomain}/invoice/${invoiceId}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey        = process.env.GHL_API_KEY;
  const locationId    = process.env.GHL_LOCATION_ID;
  const paymentDomain = process.env.GHL_PAYMENT_DOMAIN; // e.g. https://pay.yourdomain.com

  if (!apiKey || !locationId || !paymentDomain) {
    return res.status(500).json({ error: 'Payment not configured — GHL keys missing' });
  }

  const {
    total,
    description,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  if (!total || total <= 0)    return res.status(400).json({ error: 'Invalid order total' });
  if (!customerEmail)          return res.status(400).json({ error: 'Customer email is required' });
  if (!customerName)           return res.status(400).json({ error: 'Customer name is required' });

  try {
    const contactId = await findOrCreateContact(
      apiKey, locationId,
      customerName, customerEmail, customerPhone,
    );

    const url = await createInvoice(
      apiKey, locationId, paymentDomain,
      contactId, customerName, customerEmail,
      total, description,
    );

    return res.status(200).json({ url });
  } catch (err: any) {
    console.error('GHL payment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
