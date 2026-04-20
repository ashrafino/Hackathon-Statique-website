// get-submissions.js — reads registrations from MongoDB
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
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibecoding2026';

  const { password } = event.queryStringParameters || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const db = await getDb();
    const docs = await db
      .collection('hackathon_registrations')
      .find({})
      .sort({ date: -1 })
      .toArray();

    // Normalize: convert _id ObjectId → plain id string
    const submissions = docs.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
      date: rest.date instanceof Date ? rest.date.toISOString() : rest.date,
    }));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(submissions),
    };
  } catch (err) {
    console.error('get-submissions error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
