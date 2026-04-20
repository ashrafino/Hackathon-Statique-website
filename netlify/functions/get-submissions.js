// get-submissions.js — Netlify Function
// Reads all submissions from Netlify Blobs — no env vars needed
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';

  const { password } = event.queryStringParameters || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore({ name: 'hackathon-submissions', consistency: 'strong' });
    const { blobs } = await store.list();

    if (!blobs.length) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
    }

    const submissions = await Promise.all(
      blobs.map(b => store.get(b.key, { type: 'json' }).catch(() => null))
    );

    const sorted = submissions
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { statusCode: 200, headers: CORS, body: JSON.stringify(sorted) };
  } catch (err) {
    console.error('get-submissions error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
