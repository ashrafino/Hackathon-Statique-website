// send-resend.js — send email(s) via Resend (https://resend.com/docs/api-reference/emails/send-email)
// Netlify env (required): RESEND_API_KEY
// Netlify env (optional): RESEND_FROM — e.g. "Vibe Coding <noreply@yourdomain.com>" (must be a verified sender/domain in Resend)
//   If RESEND_FROM is NOT set, falls back to Resend's free test sender: onboarding@resend.dev
//   The test sender works on ALL Resend accounts with no domain setup required.
//   Limitation: can only send to the account owner's email on free tier.

const RESEND_URL = 'https://api.resend.com/emails';

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';
  const apiKey = process.env.RESEND_API_KEY;
  // Falls back to Resend's built-in test sender — no domain verification needed
  const defaultFrom = process.env.RESEND_FROM || 'Hackathon AI <onboarding@resend.dev>';

  if (!apiKey) {
    return {
      statusCode: 503,
      headers: CORS,
      body: JSON.stringify({ error: 'RESEND_API_KEY is not configured in Netlify environment variables.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { password, from, to, subject, text, html } = body;
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const fromAddr = (from && String(from).trim()) || defaultFrom;
  if (!fromAddr) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({
        error: 'Missing "from" address. Pass "from" in the request body or set RESEND_FROM in Netlify env vars.',
      }),
    };
  }

  if (!subject || !String(subject).trim()) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Subject is required' }) };
  }

  const plain = text != null ? String(text) : '';
  const htmlBody = html != null ? String(html) : '';
  if (!plain.trim() && !htmlBody.trim()) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Provide "text" and/or "html" body' }) };
  }

  let recipients = [];
  if (Array.isArray(to)) {
    recipients = to.map((e) => String(e).trim()).filter(Boolean);
  } else if (typeof to === 'string') {
    recipients = to
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  recipients = [...new Set(recipients)].filter((e) => emailRe.test(e));

  if (!recipients.length) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No valid recipient emails' }) };
  }

  const MAX = 40;
  if (recipients.length > MAX) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: `Too many recipients (max ${MAX} per request). Send in batches.` }),
    };
  }

  const payloadBase = {
    from: fromAddr,
    subject: String(subject).trim(),
    ...(htmlBody.trim() ? { html: htmlBody } : {}),
    ...(plain.trim() ? { text: plain } : {}),
  };

  const results = [];
  const CONCURRENCY = 5;

  async function sendOne(email) {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payloadBase, to: [email] }),
    });
    const data = await res.json().catch(() => ({}));
    return { email, ok: res.ok, status: res.status, data };
  }

  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const chunk = recipients.slice(i, i + CONCURRENCY);
    const batch = await Promise.all(chunk.map(sendOne));
    results.push(...batch);
  }

  const failed = results.filter((r) => !r.ok);
  const okCount = results.length - failed.length;

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      success: failed.length === 0,
      sent: okCount,
      total: results.length,
      failed: failed.map((f) => ({ email: f.email, status: f.status, message: f.data?.message || f.data })),
    }),
  };
};
