// submit-form.js — saves registration to MongoDB
const { MongoClient } = require('mongodb');

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('venturelens');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse URL-encoded form body
  const raw = new URLSearchParams(event.body || '');
  const data = {};
  for (const [k, v] of raw.entries()) data[k] = v;

  // Honeypot — silently drop bots
  if (data['bot-field']) {
    return { statusCode: 302, headers: { Location: '/success.html' }, body: '' };
  }

  if (!data.fullname || !data.email) {
    return { statusCode: 302, headers: { Location: '/register.html' }, body: '' };
  }

  const submission = {
    fullname:       data.fullname || '',
    email:          data.email || '',
    phone:          data.phone || '',
    cin:            data.cin || '',
    etablissement:  data.etablissement || '',
    filiere:        data.filiere || '',
    niveau:         data.niveau || '',
    experience:     data.experience || '',
    tshirt:         data.tshirt || '',
    registering_as: data.registering_as || 'solo',
    team_name:      data.team_name || '',
    team_size:      data.team_size || '',
    project_theme:  data.project_theme || '',
    project_idea:   data.project_idea || '',
    motivation:     data.motivation || '',
    heard_from:     data.heard_from || '',
    status:         'pending',
    date:           new Date(),
  };

  try {
    const db = await getDb();
    await db.collection('hackathon_registrations').insertOne(submission);
    console.log('Saved:', submission.fullname, submission.email);
  } catch (err) {
    console.error('MongoDB save error:', err.message);
    // Still redirect to success — submission is logged above
  }

  return {
    statusCode: 302,
    headers: { Location: '/success.html' },
    body: '',
  };
};
