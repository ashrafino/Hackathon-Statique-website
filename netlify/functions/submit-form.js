// submit-form.js — Netlify Function
// Saves form submissions to Netlify Blobs (auto-credentialed, no env vars needed)
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const raw = new URLSearchParams(event.body || '');
  const data = {};
  for (const [k, v] of raw.entries()) data[k] = v;

  // Honeypot
  if (data['bot-field']) {
    return { statusCode: 302, headers: { Location: '/success.html' }, body: '' };
  }

  if (!data.fullname || !data.email) {
    return { statusCode: 302, headers: { Location: '/register.html' }, body: '' };
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const submission = {
    id,
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
    // @netlify/blobs uses runtime-injected credentials automatically — no env vars needed
    const store = getStore({ name: 'hackathon-submissions', consistency: 'strong' });
    await store.setJSON(id, submission);
    console.log('Saved submission:', id, submission.fullname);
  } catch (err) {
    console.error('Blob error:', err.message);
    // Still redirect to success even if save fails
  }

  return {
    statusCode: 302,
    headers: { Location: '/success.html' },
    body: '',
  };
};
