// POST /api/contact — receives contact form submissions
// Validates required fields, basic email format, and honeypot. Returns 202 on acceptance.

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST({ request }: { request: Request }) {
  try {
    const data = await request.json().catch(() => ({} as any));
    const { name, email, subject = '', message, website = '', source = '' } = data || {};

    // Honeypot: if filled, silently accept
    if (typeof website === 'string' && website.trim() !== '') {
      return new Response(JSON.stringify({ ok: true }), { status: 202, headers: { 'content-type': 'application/json' } });
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
    const emailOk = /.+@.+\..+/.test(String(email));
    if (!emailOk) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    // Placeholder: forward to provider (e.g., email, n8n webhook, Slack)
    // For now, just acknowledge receipt without logging PII.
    return new Response(JSON.stringify({ ok: true, accepted: true }), { status: 202, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


