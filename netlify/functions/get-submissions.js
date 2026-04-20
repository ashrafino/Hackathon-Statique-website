// Netlify Function: get-submissions.js
// Fetches real form submissions from Netlify Forms API
// Requires env vars: NETLIFY_TOKEN, NETLIFY_SITE_ID
// Set these in: Netlify Dashboard → Site Settings → Environment Variables

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Password guard (simple check — same as admin panel password)
  const { password } = event.queryStringParameters || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const TOKEN = process.env.NETLIFY_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!TOKEN || !SITE_ID) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Missing NETLIFY_TOKEN or NETLIFY_SITE_ID env vars. Set them in Netlify → Site Settings → Environment Variables.' })
    };
  }

  try {
    // Get all forms for this site
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!formsRes.ok) throw new Error(`Netlify API ${formsRes.status}`);
    const forms = await formsRes.json();

    // Find our registration form
    const form = forms.find(f => f.name === 'hackathon-registration');
    if (!form) {
      return {
        statusCode: 404,
        headers: CORS,
        body: JSON.stringify({ error: 'Form "hackathon-registration" not found. Check Netlify Forms in your dashboard.' })
      };
    }

    // Fetch all submissions (max 100 per page)
    const subsRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=100`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    if (!subsRes.ok) throw new Error(`Submissions API ${subsRes.status}`);
    const submissions = await subsRes.json();

    // Normalize to match our admin panel schema
    const normalized = submissions.map(s => ({
      id: s.id,
      fullname: s.data.fullname || '',
      email: s.data.email || '',
      phone: s.data.phone || '',
      cin: s.data.cin || '',
      etablissement: s.data.etablissement || '',
      filiere: s.data.filiere || '',
      niveau: s.data.niveau || '',
      experience: s.data.experience || '',
      tshirt: s.data.tshirt || '',
      registering_as: s.data.registering_as || 'solo',
      team_name: s.data.team_name || '',
      project_theme: s.data.project_theme || '',
      project_idea: s.data.project_idea || '',
      motivation: s.data.motivation || '',
      heard_from: s.data.heard_from || '',
      status: 'pending',
      date: s.created_at,
    }));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(normalized)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
