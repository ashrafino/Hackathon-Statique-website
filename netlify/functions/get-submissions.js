// get-submissions.js — Netlify Function
// Reads submissions from Netlify Blobs and returns JSON to the admin panel
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';

  const { password } = event.queryStringParameters || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore('hackathon-submissions');
    const { blobs } = await store.list();

    const submissions = await Promise.all(
      blobs.map(b => store.get(b.key, { type: 'json' }))
    );

    // Sort newest first
    submissions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(submissions.filter(Boolean)),
    };
  } catch (err) {
    console.error('get-submissions error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
