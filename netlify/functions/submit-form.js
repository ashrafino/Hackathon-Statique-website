// submit-form.js — Netlify Function
// Stores submission in Netlify Blobs via REST API (no npm packages needed)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse form body
  const raw = new URLSearchParams(event.body || '');
  const data = {};
  for (const [k, v] of raw.entries()) data[k] = v;

  // Honeypot check
  if (data['bot-field']) {
    return { statusCode: 302, headers: { Location: '/success.html' }, body: '' };
  }

  if (!data.fullname || !data.email) {
    return { statusCode: 302, headers: { Location: '/register.html' }, body: '' };
  }

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

  // Save to Netlify Blobs via REST API
  const TOKEN = process.env.NETLIFY_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (TOKEN && SITE_ID) {
    try {
      const blobUrl = `https://api.netlify.com/api/v1/blobs/${SITE_ID}/hackathon/${submission.id}`;
      await fetch(blobUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
    } catch (err) {
      // Log but don't block success redirect
      console.error('Blob save error:', err.message);
    }
  } else {
    // No env vars — log to function output as fallback
    console.log('SUBMISSION:', JSON.stringify(submission));
  }

  return {
    statusCode: 302,
    headers: { Location: '/success.html' },
    body: '',
  };
};
