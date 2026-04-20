// get-submissions.js — Netlify Function
// Lists submissions from Netlify Blobs REST API

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';

  const { password } = event.queryStringParameters || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const TOKEN = process.env.NETLIFY_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!TOKEN || !SITE_ID) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Set NETLIFY_TOKEN and NETLIFY_SITE_ID in Netlify → Site Settings → Environment Variables' }),
    };
  }

  try {
    // List all blobs in the hackathon store
    const listRes = await fetch(
      `https://api.netlify.com/api/v1/blobs/${SITE_ID}/hackathon`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    if (!listRes.ok) {
      const text = await listRes.text();
      throw new Error(`List blobs: ${listRes.status} — ${text}`);
    }

    const { blobs = [] } = await listRes.json();

    // Fetch each blob's content
    const submissions = await Promise.all(
      blobs.map(async (b) => {
        const res = await fetch(
          `https://api.netlify.com/api/v1/blobs/${SITE_ID}/hackathon/${b.key}`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        if (!res.ok) return null;
        return res.json();
      })
    );

    const clean = submissions.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(clean),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
