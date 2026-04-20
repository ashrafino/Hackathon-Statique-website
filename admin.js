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
    loadDemoData();
    renderTable();
    updateStats();
  } else {
    document.getElementById('login-error').textContent = 'Incorrect password. Try again.';
  }
}

document.getElementById('pwd-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkLogin();
});

/* ── STORAGE ── */
function getApps() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveApps(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

/* ── DEMO DATA (loads once) ── */
function loadDemoData() {
  if (getApps().length > 0) return;
  const demo = [
    { id: uid(), fullname: 'Achraf El Bachra', email: 'achrafelbachra@gmail.com', phone: '+212 612 345 678', etablissement: 'Universiapolis Laâyoune', filiere: 'Engineering — Computer Science', niveau: '4th Year (Bac+4)', experience: 'Advanced — regular developer', tshirt: 'L', motivation: 'Passionate about AI and building impactful solutions for the Sahara region.', status: 'accepted', date: new Date().toISOString() },
    { id: uid(), fullname: 'Fatima Zahra Benali', email: 'fz.benali@example.com', phone: '+212 661 234 567', etablissement: 'Universiapolis Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Beginner — no coding experience', tshirt: 'S', motivation: 'Want to learn how AI can transform finance.', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Youssef Ait Brahim', email: 'y.aitbrahim@example.com', phone: '+212 677 890 123', etablissement: 'ENSA Agadir', filiere: 'Engineering — Civil / Industrial', niveau: '5th Year (Bac+5)', experience: 'Intermediate — some projects', tshirt: 'M', motivation: 'Excited to collaborate with multidisciplinary teams.', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Salma Ouahbi', email: 's.ouahbi@example.com', phone: '+212 655 432 109', etablissement: 'Universiapolis Laâyoune', filiere: 'Business Administration', niveau: '2nd Year (Bac+2)', experience: 'Beginner — no coding experience', tshirt: 'XS', motivation: 'Interested in the business side of tech startups.', status: 'waitlist', date: new Date().toISOString() },
    { id: uid(), fullname: 'Omar Tazi', email: 'o.tazi@example.com', phone: '+212 699 876 543', etablissement: 'ENCG Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Intermediate — some projects', tshirt: 'L', motivation: 'FinTech is the future and I want to be part of it.', status: 'rejected', date: new Date().toISOString() },
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
      (a.etablissement || '').toLowerCase().includes(search);
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
  document.getElementById('modal-body').innerHTML = `
    <div class="mb-field"><label>Email</label><p>${esc(a.email)}</p></div>
    <div class="mb-field"><label>Phone</label><p>${esc(a.phone)}</p></div>
    <div class="mb-field"><label>Institution</label><p>${esc(a.etablissement)}</p></div>
    <div class="mb-field"><label>Program</label><p>${esc(a.filiere || '—')}</p></div>
    <div class="mb-field"><label>Level</label><p>${esc(a.niveau || '—')}</p></div>
    <div class="mb-field"><label>Experience</label><p>${esc(a.experience || '—')}</p></div>
    <div class="mb-field"><label>T-Shirt</label><p>${esc(a.tshirt || '—')}</p></div>
    <div class="mb-field"><label>Status</label><p><span class="status-badge status-${a.status}">${a.status}</span></p></div>
    <div class="mb-field full"><label>Motivation</label><p>${esc(a.motivation || '—')}</p></div>
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
    etablissement: etab,
    filiere: document.getElementById('af-filiere').value,
    niveau: document.getElementById('af-niveau').value,
    experience: document.getElementById('af-exp').value,
    tshirt: document.getElementById('af-tshirt').value,
    motivation: document.getElementById('af-motivation').value,
    status: 'pending',
    date: new Date().toISOString()
  });
  saveApps(apps);
  renderTable();
  updateStats();
  closeModal('add-modal');
}

/* ── EXPORT CSV ── */
function exportCSV() {
  const apps = getApps();
  const headers = ['#','Full Name','Email','Phone','Institution','Program','Level','Experience','T-Shirt','Status','Motivation'];
  const rows = apps.map((a, i) => [
    i+1, a.fullname, a.email, a.phone, a.etablissement,
    a.filiere, a.niveau, a.experience, a.tshirt, a.status,
    (a.motivation || '').replace(/,/g, ';')
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
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
