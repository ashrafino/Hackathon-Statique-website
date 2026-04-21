// submit-form.js — saves registration to MongoDB + sends Resend confirmation email
const { MongoClient } = require('mongodb');

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('venturelens');
}

// ─── Resend email helper ──────────────────────────────────────────────────────
function buildConfirmationEmail(fullname) {
  const firstName = fullname.split(' ')[0];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation d'inscription — Vibe Coding Hackathon</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #080b12; font-family: 'Space Grotesk', Arial, sans-serif; color: #e2e8f0; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #080b12; }

    /* Header */
    .header { background: linear-gradient(135deg, #0f1729 0%, #0d1a2e 60%, #0a1520 100%); padding: 48px 40px 40px; text-align: center; border-bottom: 1px solid rgba(99,179,237,0.15); position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 320px; height: 320px; background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%); pointer-events: none; }
    .badge { display: inline-block; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; }
    .logo { font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #94a3b8; text-transform: uppercase; margin-bottom: 20px; }
    .logo-dot { display: inline-block; width: 8px; height: 8px; background: #38bdf8; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
    .header h1 { font-size: 38px; font-weight: 700; line-height: 1.1; color: #f1f5f9; letter-spacing: -1px; margin-bottom: 8px; }
    .header h1 em { font-style: normal; background: linear-gradient(90deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .header-sub { font-size: 14px; color: #64748b; margin-top: 12px; letter-spacing: 1px; }

    /* Confetti strip */
    .confetti { background: linear-gradient(90deg, #38bdf8, #818cf8, #34d399, #fb923c, #f472b6); height: 3px; }

    /* Body */
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 600; color: #f1f5f9; margin-bottom: 16px; }
    .greeting span { color: #38bdf8; }
    .intro { font-size: 15px; color: #94a3b8; line-height: 1.7; margin-bottom: 32px; }
    .intro strong { color: #e2e8f0; }

    /* Confirmation card */
    .confirm-card { background: linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06)); border: 1px solid rgba(56,189,248,0.2); border-radius: 16px; padding: 28px 32px; margin-bottom: 32px; text-align: center; }
    .confirm-icon { font-size: 40px; margin-bottom: 12px; }
    .confirm-card h2 { font-size: 18px; font-weight: 700; color: #38bdf8; margin-bottom: 6px; }
    .confirm-card p { font-size: 13px; color: #64748b; }

    /* Info grid */
    .info-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 16px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
    .info-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 18px; }
    .info-item .label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #475569; margin-bottom: 6px; }
    .info-item .value { font-size: 14px; font-weight: 600; color: #e2e8f0; }

    /* Timeline */
    .timeline-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 16px; }
    .timeline { margin-bottom: 32px; }
    .tl-row { display: flex; gap: 16px; margin-bottom: 14px; align-items: flex-start; }
    .tl-time { font-size: 12px; font-weight: 700; color: #38bdf8; font-family: monospace; min-width: 52px; margin-top: 2px; }
    .tl-dot { width: 8px; height: 8px; background: #38bdf8; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .tl-text strong { font-size: 14px; color: #e2e8f0; display: block; }
    .tl-text span { font-size: 12px; color: #64748b; }

    /* Tracks */
    .tracks-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 16px; }
    .tracks { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 32px; }
    .track { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 12px; text-align: center; }
    .track-icon { font-size: 22px; margin-bottom: 6px; }
    .track-name { font-size: 11px; font-weight: 600; color: #94a3b8; line-height: 1.4; }

    /* CTA */
    .cta-box { text-align: center; margin-bottom: 32px; }
    .cta-text { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #38bdf8, #818cf8); color: #080b12; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; padding: 14px 36px; border-radius: 8px; text-decoration: none; }

    /* What to bring */
    .bring-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 14px; }
    .bring-list { list-style: none; margin-bottom: 32px; }
    .bring-list li { font-size: 14px; color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 10px; }
    .bring-list li::before { content: '→'; color: #38bdf8; font-weight: 700; }

    /* Divider */
    .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 28px 0; }

    /* Footer */
    .footer { background: #04060d; padding: 28px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
    .footer p { font-size: 12px; color: #334155; line-height: 1.8; }
    .footer a { color: #38bdf8; text-decoration: none; }
    .footer-logo { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #1e293b; text-transform: uppercase; margin-bottom: 12px; }
  </style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <div class="header">
    <div class="logo"><span class="logo-dot"></span>VIBE CODING HACKATHON</div>
    <div class="badge">✅ Inscription confirmée</div>
    <h1>Bienvenue dans<br /><em>l'aventure !</em></h1>
    <p class="header-sub">Universiapolis Laâyoune · 23–24 Mai 2026</p>
  </div>
  <div class="confetti"></div>

  <!-- Fiche image -->
  <div style="background:#04060d; padding: 0;">
    <img src="https://mx4augg1q7.ufs.sh/f/M7p4J9nf1eWYeJRybKkxdY6Wz7pwRGMBQfNrFbUkDSOvsqx4"
      alt="Fiche du Vibe Coding Hackathon 2026"
      width="620"
      style="width:100%; max-width:620px; display:block; border:0;" />
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">Salut <span>${firstName}</span> 👋</p>
    <p class="intro">
      Nous avons bien reçu ta candidature pour le <strong>Vibe Coding Hackathon</strong>.<br />
      Tu fais désormais partie des participants sélectionnés pour ce sprint de <strong>48 heures</strong> non-stop,
      organisé à <strong>Universiapolis Laâyoune</strong>. Prépare-toi — ça va être intense ! 🚀
    </p>

    <!-- Confirmation card -->
    <div class="confirm-card">
      <div class="confirm-icon">🎟️</div>
      <h2>Ta place est réservée</h2>
      <p>Une confirmation officielle te sera envoyée quelques jours avant l'événement avec tous les détails pratiques.</p>
    </div>

    <!-- Event info -->
    <p class="info-title">📍 Infos de l'événement</p>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Date</div>
        <div class="value">23–24 Mai 2026</div>
      </div>
      <div class="info-item">
        <div class="label">Lieu</div>
        <div class="value">Universiapolis Laâyoune</div>
      </div>
      <div class="info-item">
        <div class="label">Format</div>
        <div class="value">48H Non-Stop</div>
      </div>
      <div class="info-item">
        <div class="label">Places</div>
        <div class="value">120 participants</div>
      </div>
    </div>

    <!-- Programme -->
    <p class="timeline-title">🗓️ Programme en bref</p>
    <div class="timeline">
      <div class="tl-row">
        <div class="tl-time">VEN 08:30</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>Accueil &amp; Cérémonie d'ouverture</strong><span>Petit-déjeuner &amp; briefing des défis régionaux</span></div>
      </div>
      <div class="tl-row">
        <div class="tl-time">VEN 10:00</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>Masterclass : Vibe Coding 101</strong><span>Prompting avancé avec Cursor, Claude &amp; Copilot</span></div>
      </div>
      <div class="tl-row">
        <div class="tl-time">VEN 11:30</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>🚀 Lancement du Sprint</strong><span>48 heures de développement assisté par IA</span></div>
      </div>
      <div class="tl-row">
        <div class="tl-time">SAM 14:00</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>⛔ Code Freeze</strong><span>Soumission du MVP + pitch deck 5 slides</span></div>
      </div>
      <div class="tl-row">
        <div class="tl-time">SAM 15:30</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>Demo Day — Pitches Live</strong><span>Présentation devant le jury d'experts</span></div>
      </div>
      <div class="tl-row">
        <div class="tl-time">SAM 18:30</div>
        <div class="tl-dot"></div>
        <div class="tl-text"><strong>🏆 Cérémonie de clôture &amp; Remise des prix</strong><span>Récompenses, surprises &amp; célébration</span></div>
      </div>
    </div>

    <!-- Tracks -->
    <p class="tracks-title">⚡ Thématiques des défis</p>
    <div class="tracks">
      <div class="track"><div class="track-icon">💧</div><div class="track-name">GreenTech — Gestion intelligente de l'eau</div></div>
      <div class="track"><div class="track-icon">💳</div><div class="track-name">FinTech — Inclusion financière</div></div>
      <div class="track"><div class="track-icon">✈️</div><div class="track-name">Tourisme — Modernisation &amp; valorisation</div></div>
    </div>

    <!-- CTA -->
    <div class="cta-box">
      <p class="cta-text">Le hackathon est <strong>entièrement gratuit</strong> pour tous les étudiants.<br />Meals, infrastructure &amp; outils IA sont fournis pendant 48H.</p>
      <a href="https://vibecoding-hackathon.netlify.app" class="btn">Voir le site de l'événement →</a>
    </div>

    <div class="divider"></div>

    <!-- What to bring -->
    <p class="bring-title">🎒 Ce qu'il faut apporter</p>
    <ul class="bring-list">
      <li>Ton laptop &amp; chargeur</li>
      <li>Ta carte étudiante</li>
      <li>Un état d'esprit prêt à innover</li>
      <li>Ton enthousiasme — le reste est fourni !</li>
    </ul>

    <p style="font-size:14px; color:#64748b; line-height:1.7;">
      Des questions ? Contacte-nous à <a href="mailto:achrafelbachra@gmail.com" style="color:#38bdf8; text-decoration:none;">achrafelbachra@gmail.com</a>
      ou appelle le <strong style="color:#e2e8f0;">+212 600-318586</strong>.
    </p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-logo">· Vibe Coding Hackathon ·</div>
    <p>Organisé par <a href="#">Universiapolis Laâyoune</a> · Laâyoune-Sakia El Hamra, Maroc</p>
    <p style="margin-top:6px;">© 2026 Vibe Coding Hackathon — Tous droits réservés</p>
  </div>

</div>
</body>
</html>`;

  return {
    subject: `🎟️ Inscription confirmée — Vibe Coding Hackathon, ${firstName} !`,
    html,
    text: `Bonjour ${firstName},\n\nTon inscription au Vibe Coding Hackathon est confirmée !\n\n📍 Universiapolis Laâyoune\n📅 23–24 Mai 2026\n⏱ 48 heures non-stop\n\nDes questions ? achrafelbachra@gmail.com | +212 600-318586\n\nÀ très bientôt,\nL'équipe Vibe Coding Hackathon`,
  };
}

async function sendConfirmationEmail(email, fullname) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email');
    return;
  }

  const from = process.env.RESEND_FROM || 'Vibe Coding Hackathon <onboarding@resend.dev>';
  const { subject, html, text } = buildConfirmationEmail(fullname);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [email], subject, html, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Resend error:', res.status, JSON.stringify(data));
    } else {
      console.log('Confirmation email sent to', email, '| id:', data.id);
    }
  } catch (err) {
    console.error('Resend fetch failed:', err.message);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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

  const skipKeys = new Set(['bot-field', 'form-name']);
  const knownKeys = new Set(Object.keys(submission));
  for (const [k, v] of Object.entries(data)) {
    if (skipKeys.has(k) || knownKeys.has(k)) continue;
    if (v !== undefined && v !== null) submission[k] = v;
  }

  try {
    const db = await getDb();
    await db.collection('hackathon_registrations').insertOne(submission);
    console.log('Saved:', submission.fullname, submission.email);
  } catch (err) {
    console.error('MongoDB save error:', err.message);
    // Still redirect to success — submission is logged above
  }

  // Send confirmation email (fire-and-forget — never blocks redirect)
  sendConfirmationEmail(submission.email, submission.fullname).catch(() => {});

  return {
    statusCode: 302,
    headers: { Location: '/success.html' },
    body: '',
  };
};
