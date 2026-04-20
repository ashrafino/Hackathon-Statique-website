// submit-form.js — Netlify Function
// Receives form POST, saves to Netlify Blobs, redirects to success page
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse URL-encoded form body
  const raw = new URLSearchParams(event.body || '');
  const data = {};
  for (const [k, v] of raw.entries()) data[k] = v;

  // Honeypot check (bot trap)
  if (data['bot-field']) {
    return { statusCode: 302, headers: { Location: '/success.html' }, body: '' };
  }

  // Require at minimum a name and email
  if (!data.fullname || !data.email) {
    return { statusCode: 302, headers: { Location: '/register.html?error=missing' }, body: '' };
  }

  // Build submission record
  const submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullname: data.fullname || '',
    email: data.email || '',
    phone: data.phone || '',
    cin: data.cin || '',
    etablissement: data.etablissement || '',
    filiere: data.filiere || '',
    niveau: data.niveau || '',
    experience: data.experience || '',
    tshirt: data.tshirt || '',
    registering_as: data.registering_as || 'solo',
    team_name: data.team_name || '',
    team_size: data.team_size || '',
    project_theme: data.project_theme || '',
    project_idea: data.project_idea || '',
    motivation: data.motivation || '',
    heard_from: data.heard_from || '',
    status: 'pending',
    date: new Date().toISOString(),
  };

  try {
    const store = getStore('hackathon-submissions');
    await store.setJSON(submission.id, submission);
  } catch (err) {
    console.error('Blob save error:', err);
    // Still redirect to success — don't block the user
    // Log the submission body as fallback
    console.log('SUBMISSION_FALLBACK:', JSON.stringify(submission));
  }

  // Redirect to success page
  return {
    statusCode: 302,
    headers: { Location: '/success.html' },
    body: '',
  };
};
