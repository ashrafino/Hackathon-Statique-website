/* =============================================
   REGISTER FORM — Multi-Step Wizard Logic
============================================= */

let currentStep = 1;
const totalSteps = 4;

/* ── STEP NAVIGATION ── */
function goToStep(target) {
  if (target > currentStep && !validateStep(currentStep)) return;

  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${target}`).classList.add('active');

  document.querySelectorAll('.fp-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.toggle('active', n === target);
    s.classList.toggle('completed', n < target);
  });

  currentStep = target;
  if (target === 4) buildSummary();

  document.querySelector('.reg-form-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── VALIDATION ── */
function validateStep(step) {
  const stepEl = document.getElementById(`step-${step}`);
  let valid = true;

  stepEl.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  stepEl.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));

  stepEl.querySelectorAll('[required]').forEach(field => {
    // Skip hidden fields
    if (field.closest('[style*="display:none"]') || field.closest('[style*="display: none"]')) return;

    if (field.type === 'checkbox') {
      if (!field.checked) {
        valid = false;
        const err = document.getElementById('err-terms');
        if (err) err.textContent = 'Please agree to the terms · Veuillez accepter · يرجى الموافقة';
      }
    } else if (!field.value || field.value.trim() === '') {
      valid = false;
      markError(field, 'Required · Obligatoire · مطلوب');
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      valid = false;
      markError(field, 'Invalid email · Email invalide · بريد إلكتروني غير صحيح');
    } else if (field.type === 'tel' && !/^\+?[0-9\s\-]{8,18}$/.test(field.value)) {
      valid = false;
      markError(field, 'Invalid phone · Téléphone invalide · رقم غير صحيح');
    }
  });

  if (!valid) {
    stepEl.classList.add('shake');
    setTimeout(() => stepEl.classList.remove('shake'), 500);
  }
  return valid;
}

function markError(field, message) {
  field.classList.add('input-error');
  const err = document.getElementById(`err-${field.id}`);
  if (err) err.textContent = message;
}

// Clear errors on input
document.querySelectorAll('.reg-form input, .reg-form select, .reg-form textarea').forEach(field => {
  const events = field.tagName === 'SELECT' ? ['change'] : ['input', 'blur'];
  events.forEach(evt => {
    field.addEventListener(evt, () => {
      field.classList.remove('input-error');
      const err = document.getElementById(`err-${field.id}`);
      if (err) err.textContent = '';
    });
  });
});

/* ── TEAM TOGGLE ── */
function toggleTeam(val) {
  const nameGroup = document.getElementById('team-name-group');
  const sizeGroup = document.getElementById('team-size-group');
  const nameInput = document.getElementById('team-name');
  const sizeSelect = document.getElementById('team-size');

  if (val === 'team') {
    nameGroup.style.display = 'flex';
    sizeGroup.style.display = 'block';
    nameInput.required = true;
    sizeSelect.required = true;
  } else {
    nameGroup.style.display = 'none';
    sizeGroup.style.display = 'none';
    nameInput.required = false;
    sizeSelect.required = false;
    nameInput.value = '';
    sizeSelect.selectedIndex = 0;
    document.getElementById('team-members-container').innerHTML = '';
  }
}

function renderMembers(count) {
  const container = document.getElementById('team-members-container');
  container.innerHTML = '';
  for (let i = 2; i <= parseInt(count); i++) {
    const block = document.createElement('div');
    block.className = 'member-block';
    block.innerHTML = `
      <div class="member-block-title">Member ${i} · Membre · <span class="ar">عضو ${i}</span></div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name <span class="req">*</span>
            <span class="label-sub">Nom · <span class="ar">الاسم الكامل</span></span>
          </label>
          <input type="text" name="member${i}_name" placeholder="Full name" required />
        </div>
        <div class="form-group">
          <label>Phone <span class="req">*</span>
            <span class="label-sub">Téléphone · <span class="ar">رقم الهاتف</span></span>
          </label>
          <input type="tel" name="member${i}_phone" placeholder="+212 6XX XXX XXX" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email <span class="req">*</span>
            <span class="label-sub">البريد الإلكتروني</span>
          </label>
          <input type="email" name="member${i}_email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>Institution
            <span class="label-sub">Établissement · <span class="ar">المؤسسة</span></span>
          </label>
          <input type="text" name="member${i}_etablissement" placeholder="University / École" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Program
            <span class="label-sub">Filière · <span class="ar">التخصص</span></span>
          </label>
          <input type="text" name="member${i}_filiere" placeholder="e.g. Computer Science, Finance..." />
        </div>
        <div class="form-group">
          <label>T-Shirt Size
            <span class="label-sub">Taille · <span class="ar">المقاس</span></span>
          </label>
          <select name="member${i}_tshirt">
            <option value="">Select</option>
            <option>XS</option><option>S</option><option>M</option>
            <option>L</option><option>XL</option><option>XXL</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(block);
  }
}

/* ── CHARACTER COUNTERS ── */
const ideaEl = document.getElementById('project-idea');
const ideaCount = document.getElementById('idea-count');
if (ideaEl && ideaCount) {
  ideaEl.addEventListener('input', () => { ideaCount.textContent = ideaEl.value.length; });
}

/* ── SUMMARY ── */
function buildSummary() {
  const fields = [
    { label: 'Full Name', id: 'fullname' },
    { label: 'Email', id: 'email' },
    { label: 'Phone', id: 'phone' },
    { label: 'Institution', id: 'etablissement' },
    { label: 'Program', id: 'filiere' },
    { label: 'Level', id: 'niveau' },
    { label: 'Experience', id: 'experience' },
    { label: 'T-Shirt', id: 'tshirt' },
    { label: 'Registering as', id: 'registering-as' },
    { label: 'Project idea', id: 'project-idea' },
  ];

  const container = document.getElementById('summary-content');
  container.innerHTML = fields.map(f => {
    const el = document.getElementById(f.id);
    const val = el ? (el.options ? el.options[el.selectedIndex]?.text : el.value) : '—';
    // Truncate long option text (e.g. trilingual options)
    const display = (val || '—').split(' · ')[0].split(' · ')[0];
    return `<div class="fs-item"><span class="fs-label">${f.label}</span><span class="fs-value">${esc(display)}</span></div>`;
  }).join('');

  if (document.getElementById('registering-as').value === 'team') {
    const teamName = document.getElementById('team-name').value || '—';
    container.innerHTML += `<div class="fs-item"><span class="fs-label">Team Name</span><span class="fs-value">${esc(teamName)}</span></div>`;
  }
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── FORM SUBMISSION ── */
const form = document.getElementById('hackathon-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateStep(4)) return;

    const btn = document.getElementById('submit-btn');
    const txtEl = document.getElementById('submit-text');
    const spinner = document.getElementById('submit-spinner');

    btn.disabled = true;
    txtEl.textContent = 'Submitting · Envoi · جاري الإرسال...';
    spinner.classList.remove('hidden');

    const formData = new FormData(form);

    fetch('/.netlify/functions/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString(),
    })
    .then(res => {
      // Function returns 302 → fetch follows it → res.url is /success.html
      if (res.ok || res.redirected) {
        window.location.href = '/success.html';
      } else {
        throw new Error(`${res.status}`);
      }
    })
    .catch(err => {
      console.error('Submission error:', err);
      btn.disabled = false;
      txtEl.textContent = 'Submit Application · Soumettre · إرسال';
      spinner.classList.add('hidden');
      showToast('Something went wrong. Please try again. · Erreur, réessayez.', 'error');
    });
  });
}

/* ── SPOTS BAR ── */
const spotsBar = document.querySelector('.spots-fill');
if (spotsBar) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { spotsBar.style.width = '30%'; obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 }).observe(spotsBar);
}

/* ── KEYBOARD NAV ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
    e.preventDefault();
    if (currentStep < totalSteps) goToStep(currentStep + 1);
  }
});
