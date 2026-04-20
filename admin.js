const ADMIN_PASSWORD = 'vibecoding2026';
const STORAGE_KEY = 'hackathon_applications';
let currentTab = 'all';
let currentId = null;

/* ── AUTH ── */
function checkLogin() {
  const val = document.getElementById('pwd-input').value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadSubmissions(val);
  } else {
    document.getElementById('login-error').textContent = 'Incorrect password. Try again.';
  }
}

document.getElementById('pwd-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkLogin();
});

/* ── LOAD: try Netlify Function, fall back to localStorage demo ── */
async function loadSubmissions(password) {
  try {
    const res = await fetch(`/.netlify/functions/get-submissions?password=${encodeURIComponent(password)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Merge with any locally-added apps, giving Netlify submissions priority
        const local = getApps().filter(a => a._manual);
        saveApps([...data.map(d => ({ ...d, _netlify: true })), ...local]);
        showBanner('✓ Showing live Netlify submissions', 'success');
        renderTable();
        updateStats();
        return;
      } else if (Array.isArray(data) && data.length === 0) {
        showBanner('No submissions yet in Netlify Forms. Showing demo data.', 'info');
      } else if (data.error && data.error.includes('env')) {
        showBanner('⚙ Set NETLIFY_TOKEN + NETLIFY_SITE_ID in Netlify → Env Vars to see real data. Showing demo.', 'warn');
      } else if (data.error) {
        showBanner(`Netlify API: ${data.error} — showing demo data`, 'warn');
      }
    }
  } catch (e) {
    // Function not deployed yet or network error — use demo
  }
  // Fallback: demo data
  loadDemoData();
  renderTable();
  updateStats();
}

function showBanner(msg, type = 'info') {
  const colors = { success: '#00d4aa', warn: '#f5a623', info: '#6c63ff' };
  const b = document.createElement('div');
  b.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:999;padding:0.6rem 1.5rem;font-size:0.82rem;font-weight:600;text-align:center;background:${colors[type]}22;color:${colors[type]};border-bottom:1px solid ${colors[type]}44`;
  b.textContent = msg;
  document.body.prepend(b);
  setTimeout(() => b.remove(), 6000);
}

/* ── STORAGE ── */
function getApps() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveApps(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

/* ── DEMO DATA (loads once if no real data) ── */
function loadDemoData() {
  if (getApps().length > 0) return;
  const demo = [
    { id: uid(), fullname: 'Achraf El Bachra', email: 'achrafelbachra@gmail.com', phone: '+212 612 345 678', cin: 'AB123456', etablissement: 'Universiapolis Laâyoune', filiere: 'Engineering — Computer Science', niveau: '4th Year (Bac+4)', experience: 'Advanced — regular developer', tshirt: 'L', registering_as: 'team', team_name: 'Team Sahara AI', project_theme: 'FinTech & Financial Inclusion', project_idea: 'AI-powered microloan eligibility predictor for rural communities.', motivation: 'Passionate about AI and building impactful solutions for the Sahara region.', heard_from: 'University announcement', status: 'accepted', date: new Date().toISOString() },
    { id: uid(), fullname: 'Fatima Zahra Benali', email: 'fz.benali@example.com', phone: '+212 661 234 567', cin: 'CD789012', etablissement: 'Universiapolis Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Beginner — no coding experience', tshirt: 'S', registering_as: 'solo', team_name: '', project_theme: 'FinTech & Financial Inclusion', project_idea: '', motivation: 'Want to learn how AI can transform finance.', heard_from: 'Instagram', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Youssef Ait Brahim', email: 'y.aitbrahim@example.com', phone: '+212 677 890 123', cin: 'EF345678', etablissement: 'ENSA Agadir', filiere: 'Engineering — Civil / Industrial', niveau: '5th Year (Bac+5)', experience: 'Intermediate — some projects', tshirt: 'M', registering_as: 'solo', team_name: '', project_theme: 'Smart Water Management', project_idea: 'IoT-based water usage dashboard for the Sahara.', motivation: 'Excited to collaborate with multidisciplinary teams.', heard_from: 'Professor', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Salma Ouahbi', email: 's.ouahbi@example.com', phone: '+212 655 432 109', cin: 'GH901234', etablissement: 'Universiapolis Laâyoune', filiere: 'Business Administration', niveau: '2nd Year (Bac+2)', experience: 'Beginner — no coding experience', tshirt: 'XS', registering_as: 'solo', team_name: '', project_theme: 'Education & Social Innovation', project_idea: '', motivation: 'Interested in the business side of tech startups.', heard_from: 'Friend / colleague', status: 'waitlist', date: new Date().toISOString() },
    { id: uid(), fullname: 'Omar Tazi', email: 'o.tazi@example.com', phone: '+212 699 876 543', cin: 'IJ567890', etablissement: 'ENCG Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Intermediate — some projects', tshirt: 'L', registering_as: 'team', team_name: 'FinTech Wolves', project_theme: 'FinTech & Financial Inclusion', project_idea: 'Mobile banking app for underserved communities.', motivation: 'FinTech is the future and I want to be part of it.', heard_from: 'Instagram', status: 'rejected', date: new Date().toISOString() },
  ];
  saveApps(demo);
}

/* ── RENDER TABLE ── */
function renderTable() {
  const apps = getApps();
  const search = document.getElementById('search-input').value.toLowerCase();
  const filtered = apps.filter(a => {
    const matchTab = currentTab === 'all' || a.status === currentTab;
    const matchSearch = !search ||
      a.fullname.toLowerCase().includes(search) ||
      a.email.toLowerCase().includes(search) ||
      (a.etablissement || '').toLowerCase().includes(search) ||
      (a.team_name || '').toLowerCase().includes(search) ||
      (a.project_theme || '').toLowerCase().includes(search);
    return matchTab && matchSearch;
  });

  const tbody = document.getElementById('table-body');
  const empty = document.getElementById('empty-state');
  const table = document.getElementById('apps-table');

  document.getElementById('tab-count').textContent = `${filtered.length} application${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    table.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  table.classList.remove('hidden');
  empty.classList.add('hidden');

  tbody.innerHTML = filtered.map((a, i) => `
    <tr onclick="openDetail('${a.id}')">
      <td>${i + 1}</td>
      <td><strong>${esc(a.fullname)}</strong></td>
      <td>${esc(a.email)}</td>
      <td>${esc(a.phone)}</td>
      <td>${esc(a.etablissement)}</td>
      <td>${esc(a.filiere || '—')}</td>
      <td>${esc(a.niveau || '—')}</td>
      <td>${esc(a.experience || '—')}</td>
      <td><span class="status-badge status-${a.status}">${a.status}</span></td>
      <td onclick="event.stopPropagation()">
        <div class="action-btns">
          <button class="ab-view"   onclick="openDetail('${a.id}')">View</button>
          <button class="ab-accept" onclick="setStatus('${a.id}','accepted')">✓</button>
          <button class="ab-reject" onclick="setStatus('${a.id}','rejected')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── TABS ── */
function showTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  const titles = { all: 'All Applications', pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', waitlist: 'Waitlist' };
  document.getElementById('tab-title').textContent = titles[tab];
  renderTable();
}

/* ── STATS ── */
function updateStats() {
  const apps = getApps();
  document.getElementById('s-total').textContent    = apps.length;
  document.getElementById('s-accepted').textContent = apps.filter(a => a.status === 'accepted').length;
  document.getElementById('s-pending').textContent  = apps.filter(a => a.status === 'pending').length;
}

/* ── DETAIL MODAL ── */
function openDetail(id) {
  const apps = getApps();
  const a = apps.find(x => x.id === id);
  if (!a) return;
  currentId = id;
  document.getElementById('modal-name').textContent = a.fullname;

  const dateStr = a.date ? new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  document.getElementById('modal-body').innerHTML = `
    <div class="mb-row">
      <div class="mb-field"><label>Email</label><p>${esc(a.email)}</p></div>
      <div class="mb-field"><label>Phone</label><p>${esc(a.phone)}</p></div>
    </div>
    <div class="mb-row">
      <div class="mb-field"><label>CIN / Student ID</label><p>${esc(a.cin || '—')}</p></div>
      <div class="mb-field"><label>Institution</label><p>${esc(a.etablissement)}</p></div>
    </div>
    <div class="mb-row">
      <div class="mb-field"><label>Program</label><p>${esc(a.filiere || '—')}</p></div>
      <div class="mb-field"><label>Level</label><p>${esc(a.niveau || '—')}</p></div>
    </div>
    <div class="mb-row">
      <div class="mb-field"><label>Experience</label><p>${esc(a.experience || '—')}</p></div>
      <div class="mb-field"><label>T-Shirt</label><p>${esc(a.tshirt || '—')}</p></div>
    </div>
    <div class="mb-row">
      <div class="mb-field"><label>Registering As</label><p>${esc(a.registering_as === 'team' ? 'Team' : 'Solo')}</p></div>
      <div class="mb-field"><label>Team Name</label><p>${esc(a.team_name || '—')}</p></div>
    </div>
    <div class="mb-row">
      <div class="mb-field"><label>Challenge Theme</label><p>${esc(a.project_theme || '—')}</p></div>
      <div class="mb-field"><label>Heard From</label><p>${esc(a.heard_from || '—')}</p></div>
    </div>
    <div class="mb-field full"><label>Project Idea</label><p>${esc(a.project_idea || '—')}</p></div>
    <div class="mb-field full"><label>Motivation</label><p>${esc(a.motivation || '—')}</p></div>
    <div class="mb-row">
      <div class="mb-field"><label>Status</label><p><span class="status-badge status-${a.status}">${a.status}</span></p></div>
      <div class="mb-field"><label>Applied On</label><p>${dateStr}</p></div>
    </div>
  `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/* ── STATUS ── */
function setStatus(id, status) {
  const apps = getApps();
  const idx = apps.findIndex(a => a.id === id);
  if (idx === -1) return;
  apps[idx].status = status;
  saveApps(apps);
  renderTable();
  updateStats();
  closeModal('detail-modal');
}

/* ── DELETE ── */
function deleteApp(id) {
  if (!confirm('Delete this application permanently?')) return;
  const apps = getApps().filter(a => a.id !== id);
  saveApps(apps);
  renderTable();
  updateStats();
  closeModal('detail-modal');
}

/* ── ADD MANUALLY ── */
function openAddModal() {
  document.getElementById('add-modal').classList.remove('hidden');
}

function addManual() {
  const name = document.getElementById('af-name').value.trim();
  const email = document.getElementById('af-email').value.trim();
  const phone = document.getElementById('af-phone').value.trim();
  const etab  = document.getElementById('af-etab').value.trim();
  if (!name || !email || !phone || !etab) { alert('Please fill required fields.'); return; }
  const apps = getApps();
  apps.unshift({
    id: uid(),
    fullname: name,
    email,
    phone,
    cin: document.getElementById('af-cin').value,
    etablissement: etab,
    filiere: document.getElementById('af-filiere').value,
    niveau: document.getElementById('af-niveau').value,
    experience: document.getElementById('af-exp').value,
    tshirt: document.getElementById('af-tshirt').value,
    registering_as: 'solo',
    team_name: '',
    project_theme: document.getElementById('af-theme').value,
    project_idea: '',
    motivation: document.getElementById('af-motivation').value,
    heard_from: '',
    status: 'pending',
    date: new Date().toISOString()
  });
  saveApps(apps);
  renderTable();
  updateStats();
  closeModal('add-modal');
  // Clear form
  document.querySelectorAll('#add-modal input, #add-modal textarea').forEach(el => el.value = '');
}

/* ── EXPORT CSV ── */
function exportCSV() {
  const apps = getApps();
  const headers = ['#','Full Name','Email','Phone','CIN','Institution','Program','Level','Experience','T-Shirt','Registering As','Team Name','Challenge Theme','Project Idea','Motivation','Heard From','Status','Applied On'];
  const rows = apps.map((a, i) => [
    i+1, a.fullname, a.email, a.phone, a.cin || '',
    a.etablissement, a.filiere, a.niveau, a.experience, a.tshirt,
    a.registering_as || '', a.team_name || '',
    a.project_theme || '', (a.project_idea || '').replace(/,/g, ';'),
    (a.motivation || '').replace(/,/g, ';'),
    a.heard_from || '', a.status,
    a.date ? new Date(a.date).toLocaleDateString() : ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'hackathon_applications.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ── UTILS ── */
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── CLOSE MODAL ON BACKDROP ── */
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
});
