const ADMIN_PASSWORD = 'vibecoding2026';
const STORAGE_KEY = 'hackathon_applications';
let currentTab = 'all';
let currentId = null;
let currentPage = 1;
let lastFiltered = [];
let lastPageApps = [];

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
    { id: uid(), fullname: 'Achraf El Bachra', email: 'achrafelbachra@gmail.com', phone: '+212 612 345 678', cin: 'AB123456', etablissement: 'Universiapolis Laâyoune', filiere: 'Engineering — Computer Science', niveau: '4th Year (Bac+4)', experience: 'Advanced · Avancé · متقدم', tshirt: 'L', registering_as: 'team', team_name: 'Team Sahara AI', team_size: '3', member2_name: 'Imane Alaoui', member2_email: 'imane.alaoui@example.com', member2_phone: '+212 611 222 333', member2_etablissement: 'Universiapolis Laâyoune', member2_filiere: 'Data Science', member2_tshirt: 'M', member3_name: 'Karim Idrissi', member3_email: 'karim.idrissi@example.com', member3_phone: '+212 622 333 444', member3_etablissement: 'ENSA Agadir', member3_filiere: 'Software Engineering', member3_tshirt: 'L', project_theme: 'FinTech & Financial Inclusion', project_idea: 'AI-powered microloan eligibility predictor for rural communities.', motivation: 'Passionate about AI and building impactful solutions for the Sahara region.', heard_from: 'University announcement', status: 'accepted', date: new Date().toISOString() },
    { id: uid(), fullname: 'Fatima Zahra Benali', email: 'fz.benali@example.com', phone: '+212 661 234 567', cin: 'CD789012', etablissement: 'Universiapolis Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Beginner — no coding experience', tshirt: 'S', registering_as: 'solo', team_name: '', project_theme: 'FinTech & Financial Inclusion', project_idea: '', motivation: 'Want to learn how AI can transform finance.', heard_from: 'Instagram', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Youssef Ait Brahim', email: 'y.aitbrahim@example.com', phone: '+212 677 890 123', cin: 'EF345678', etablissement: 'ENSA Agadir', filiere: 'Engineering — Civil / Industrial', niveau: '5th Year (Bac+5)', experience: 'Intermediate — some projects', tshirt: 'M', registering_as: 'solo', team_name: '', project_theme: 'Smart Water Management', project_idea: 'IoT-based water usage dashboard for the Sahara.', motivation: 'Excited to collaborate with multidisciplinary teams.', heard_from: 'Professor', status: 'pending', date: new Date().toISOString() },
    { id: uid(), fullname: 'Salma Ouahbi', email: 's.ouahbi@example.com', phone: '+212 655 432 109', cin: 'GH901234', etablissement: 'Universiapolis Laâyoune', filiere: 'Business Administration', niveau: '2nd Year (Bac+2)', experience: 'Beginner — no coding experience', tshirt: 'XS', registering_as: 'solo', team_name: '', project_theme: 'Education & Social Innovation', project_idea: '', motivation: 'Interested in the business side of tech startups.', heard_from: 'Friend / colleague', status: 'waitlist', date: new Date().toISOString() },
    { id: uid(), fullname: 'Omar Tazi', email: 'o.tazi@example.com', phone: '+212 699 876 543', cin: 'IJ567890', etablissement: 'ENCG Laâyoune', filiere: 'Finance & Accounting', niveau: '3rd Year (Bac+3)', experience: 'Intermediate — some projects', tshirt: 'L', registering_as: 'team', team_name: 'FinTech Wolves', project_theme: 'FinTech & Financial Inclusion', project_idea: 'Mobile banking app for underserved communities.', motivation: 'FinTech is the future and I want to be part of it.', heard_from: 'Instagram', status: 'rejected', date: new Date().toISOString() },
  ];
  saveApps(demo);
}

function appSearchBlob(a) {
  const parts = [];
  for (const v of Object.values(a)) {
    if (v == null) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') parts.push(String(v));
  }
  return parts.join(' ').toLowerCase();
}

function extractTeamMembers(a) {
  const byMember = {};
  for (const key of Object.keys(a)) {
    const m = key.match(/^member(\d+)_(name|phone|email|etablissement|filiere|tshirt)$/);
    if (!m) continue;
    const num = m[1];
    const field = m[2];
    if (!byMember[num]) byMember[num] = {};
    byMember[num][field] = a[key];
  }
  return Object.keys(byMember)
    .sort((x, y) => Number(x) - Number(y))
    .map((n) => ({ slot: n, ...byMember[n] }));
}

function getPageSize() {
  return parseInt(document.getElementById('page-size').value, 10) || 25;
}

function onSearchInput() {
  currentPage = 1;
  renderTable();
}

function resetPageAndRender() {
  currentPage = 1;
  renderTable();
}

function toggleReadableRows() {
  const on = document.getElementById('readable-rows').checked;
  document.getElementById('table-wrap').classList.toggle('table-readable', on);
}

function goPage(p) {
  currentPage = Math.max(1, p);
  renderTable();
}

function teamTableLabel(a) {
  if (a.registering_as === 'team') {
    const name = (a.team_name || '').trim();
    return name ? `<span class="team-name-cell">${esc(name)}</span>` : '<span class="cell-muted">Team (no name)</span>';
  }
  return '<span class="cell-muted">Solo</span>';
}

function teamSizeDisplay(a) {
  if (a.registering_as !== 'team') return '—';
  if (a.team_size) return esc(String(a.team_size));
  const extra = extractTeamMembers(a).length;
  return extra ? esc(String(extra + 1)) : '—';
}

function renderPagination(total, pageSize, page) {
  const el = document.getElementById('pagination');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="pagination-inner">
      <span class="pg-info">Page <strong>${page}</strong> of ${totalPages} · ${total} application${total !== 1 ? 's' : ''}</span>
      <div class="pg-btns">
        <button type="button" class="pg-btn" ${page <= 1 ? 'disabled' : ''} onclick="goPage(${page - 1})">Previous</button>
        <button type="button" class="pg-btn" ${page >= totalPages ? 'disabled' : ''} onclick="goPage(${page + 1})">Next</button>
      </div>
    </div>`;
}

/* ── RENDER TABLE ── */
function renderTable() {
  const apps = getApps();
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const regFilter = document.getElementById('filter-registering').value;

  const filtered = apps.filter(a => {
    const matchTab = currentTab === 'all' || a.status === currentTab;
    const isTeam = a.registering_as === 'team';
    const matchReg =
      regFilter === 'all' ||
      (regFilter === 'team' && isTeam) ||
      (regFilter === 'solo' && !isTeam);
    const matchSearch = !search || appSearchBlob(a).includes(search);
    return matchTab && matchReg && matchSearch;
  });

  lastFiltered = filtered;
  const pageSize = getPageSize();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const start = (currentPage - 1) * pageSize;
  lastPageApps = filtered.slice(start, start + pageSize);

  const tbody = document.getElementById('table-body');
  const empty = document.getElementById('empty-state');
  const table = document.getElementById('apps-table');

  const globalIndexStart = start;
  document.getElementById('tab-count').textContent =
    `${filtered.length} application${filtered.length !== 1 ? 's' : ''}` +
    (filtered.length > pageSize ? ` · showing ${start + 1}–${start + lastPageApps.length}` : '');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    table.classList.add('hidden');
    empty.classList.remove('hidden');
    document.getElementById('pagination').classList.add('hidden');
    return;
  }

  table.classList.remove('hidden');
  empty.classList.add('hidden');
  renderPagination(filtered.length, pageSize, currentPage);

  tbody.innerHTML = lastPageApps.map((a, i) => `
    <tr onclick="openDetail('${a.id}')">
      <td>${globalIndexStart + i + 1}</td>
      <td><strong>${esc(a.fullname)}</strong></td>
      <td class="td-team">${teamTableLabel(a)}</td>
      <td class="td-num">${teamSizeDisplay(a)}</td>
      <td class="td-email" title="${esc(a.email)}">${esc(a.email)}</td>
      <td>${esc(a.phone)}</td>
      <td title="${esc(a.etablissement)}">${esc(a.etablissement)}</td>
      <td title="${esc(a.filiere || '')}">${esc(a.filiere || '—')}</td>
      <td title="${esc(a.niveau || '')}">${esc(a.niveau || '—')}</td>
      <td title="${esc(a.experience || '')}">${esc(a.experience || '—')}</td>
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
function showTab(tab, el) {
  currentTab = tab;
  currentPage = 1;
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
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

function memberCardsHtml(members) {
  if (!members.length) return '';
  return `
    <div class="detail-section">
      <h3 class="detail-section-title">Team members (besides captain)</h3>
      <div class="member-cards">
        ${members.map((m) => `
          <article class="member-card">
            <div class="member-card-head">Member slot ${esc(m.slot)}</div>
            <div class="member-card-grid">
              <div class="mb-field"><label>Name</label><p class="mb-value">${esc(m.name || '—')}</p></div>
              <div class="mb-field"><label>Email</label><p class="mb-value mb-mono">${esc(m.email || '—')}</p></div>
              <div class="mb-field"><label>Phone</label><p class="mb-value">${esc(m.phone || '—')}</p></div>
              <div class="mb-field"><label>Institution</label><p class="mb-value">${esc(m.etablissement || '—')}</p></div>
              <div class="mb-field"><label>Program</label><p class="mb-value">${esc(m.filiere || '—')}</p></div>
              <div class="mb-field"><label>T-Shirt</label><p class="mb-value">${esc(m.tshirt || '—')}</p></div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>`;
}

function formatRecordForCopy(a) {
  const members = extractTeamMembers(a);
  const lines = [
    `CAPTAIN / PRIMARY`,
    `Name: ${a.fullname}`,
    `Email: ${a.email}`,
    `Phone: ${a.phone}`,
    `Institution: ${a.etablissement || '—'}`,
    `Program: ${a.filiere || '—'}`,
    `Level: ${a.niveau || '—'}`,
    `Experience: ${a.experience || '—'}`,
    `T-Shirt: ${a.tshirt || '—'}`,
    `Registering as: ${a.registering_as || '—'}`,
    `Team name: ${a.team_name || '—'}`,
    `Team size (form): ${a.team_size || '—'}`,
    `Project idea: ${a.project_idea || '—'}`,
    `Theme / motivation / heard: ${a.project_theme || '—'} | ${a.motivation || '—'} | ${a.heard_from || '—'}`,
    `Status: ${a.status}`,
    ``,
  ];
  members.forEach((m) => {
    lines.push(`MEMBER ${m.slot}`, `  Name: ${m.name || '—'}`, `  Email: ${m.email || '—'}`, `  Phone: ${m.phone || '—'}`, `  Institution: ${m.etablissement || '—'}`, `  Program: ${m.filiere || '—'}`, `  T-Shirt: ${m.tshirt || '—'}`, ``);
  });
  return lines.join('\n');
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showBanner('Copied to clipboard', 'success');
  } catch (err) {
    window.prompt('Copy this text:', text);
  }
}

function copyFilteredEmails(allMatching) {
  const list = allMatching ? lastFiltered : lastPageApps;
  const emails = [...new Set(list.map(a => (a.email || '').trim()).filter(Boolean))];
  if (!emails.length) {
    showBanner('No emails in this selection', 'warn');
    return;
  }
  copyToClipboard(emails.join('\n'));
}

function copyCurrentDetail() {
  const apps = getApps();
  const a = apps.find(x => x.id === currentId);
  if (!a) return;
  copyToClipboard(formatRecordForCopy(a));
}

/* ── DETAIL MODAL ── */
function openDetail(id) {
  const apps = getApps();
  const a = apps.find(x => x.id === id);
  if (!a) return;
  currentId = id;
  document.getElementById('modal-name').textContent = a.fullname;

  const dateStr = a.date ? new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const members = extractTeamMembers(a);

  document.getElementById('modal-body').innerHTML = `
    <div class="detail-section">
      <div class="mb-row">
        <div class="mb-field"><label>Email</label><p class="mb-value mb-mono">${esc(a.email)}</p></div>
        <div class="mb-field"><label>Phone</label><p class="mb-value">${esc(a.phone)}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>CIN / Student ID</label><p class="mb-value">${esc(a.cin || '—')}</p></div>
        <div class="mb-field"><label>Institution</label><p class="mb-value">${esc(a.etablissement)}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>Program</label><p class="mb-value">${esc(a.filiere || '—')}</p></div>
        <div class="mb-field"><label>Level</label><p class="mb-value">${esc(a.niveau || '—')}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>Experience</label><p class="mb-value">${esc(a.experience || '—')}</p></div>
        <div class="mb-field"><label>T-Shirt</label><p class="mb-value">${esc(a.tshirt || '—')}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>Registering as</label><p class="mb-value">${esc(a.registering_as === 'team' ? 'Team' : 'Solo')}</p></div>
        <div class="mb-field"><label>Team name</label><p class="mb-value">${esc(a.team_name || '—')}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>Team size (reported)</label><p class="mb-value">${esc(a.team_size || '—')}</p></div>
        <div class="mb-field"><label>Extra members in record</label><p class="mb-value">${members.length ? members.length + ' member block(s)' : 'None'}</p></div>
      </div>
      <div class="mb-row">
        <div class="mb-field"><label>Challenge theme</label><p class="mb-value">${esc(a.project_theme || '—')}</p></div>
        <div class="mb-field"><label>Heard from</label><p class="mb-value">${esc(a.heard_from || '—')}</p></div>
      </div>
      <div class="mb-field full"><label>Project idea</label><p class="mb-value">${esc(a.project_idea || '—')}</p></div>
      <div class="mb-field full"><label>Motivation</label><p class="mb-value">${esc(a.motivation || '—')}</p></div>
      <div class="mb-row">
        <div class="mb-field"><label>Status</label><p><span class="status-badge status-${a.status}">${a.status}</span></p></div>
        <div class="mb-field"><label>Applied on</label><p class="mb-value">${dateStr}</p></div>
      </div>
    </div>
    ${memberCardsHtml(members)}
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

function collectMemberFieldKeys(apps) {
  const keys = new Set();
  apps.forEach(a => {
    Object.keys(a).forEach(k => {
      if (/^member\d+_/.test(k)) keys.add(k);
    });
  });
  return [...keys].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function csvCell(v) {
  const s = String(v ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

/* ── EXPORT CSV ── */
function exportCSV() {
  const apps = getApps();
  const memberKeys = collectMemberFieldKeys(apps);
  const headers = [
    '#', 'Full Name', 'Email', 'Phone', 'CIN', 'Institution', 'Program', 'Level', 'Experience', 'T-Shirt',
    'Registering As', 'Team Name', 'Team Size', 'Challenge Theme', 'Project Idea', 'Motivation', 'Heard From', 'Status', 'Applied On',
    ...memberKeys,
  ];
  const rows = apps.map((a, i) => {
    const base = [
      i + 1, a.fullname, a.email, a.phone, a.cin || '',
      a.etablissement, a.filiere, a.niveau, a.experience, a.tshirt,
      a.registering_as || '', a.team_name || '', a.team_size || '',
      a.project_theme || '', (a.project_idea || '').replace(/,/g, ';'),
      (a.motivation || '').replace(/,/g, ';'),
      a.heard_from || '', a.status,
      a.date ? new Date(a.date).toLocaleDateString() : '',
    ];
    const extra = memberKeys.map(k => String(a[k] ?? '').replace(/,/g, ';'));
    return [...base, ...extra];
  });
  const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
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
