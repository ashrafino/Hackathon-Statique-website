/* =============================================
   REGISTER FORM — Multi-Step Wizard Logic
   Separated from app.js to avoid DOM errors
   on pages that don't have hero/nav elements.
============================================= */

let currentStep = 1;
const totalSteps = 4;

/* ── STEP NAVIGATION ── */
function goToStep(target) {
  // Validate current step before advancing
  if (target > currentStep && !validateStep(currentStep)) return;

  // Hide current step
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  // Show target step
  document.getElementById(`step-${target}`).classList.add('active');

  // Update progress bar
  document.querySelectorAll('.fp-step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.toggle('active', sNum === target);
    s.classList.toggle('completed', sNum < target);
  });

  currentStep = target;

  // Build summary on step 4
  if (target === 4) buildSummary();

  // Scroll to top of form
  document.querySelector('.reg-form-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── VALIDATION ── */
function validateStep(step) {
  const stepEl = document.getElementById(`step-${step}`);
  const requiredFields = stepEl.querySelectorAll('[required]');
  let valid = true;

  // Clear previous errors in this step
  stepEl.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  stepEl.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));

  requiredFields.forEach(field => {
    if (!field.value || field.value.trim() === '') {
      valid = false;
      markError(field, 'This field is required');
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
      valid = false;
      markError(field, 'Please enter a valid email address');
    } else if (field.type === 'tel' && !isValidPhone(field.value)) {
      valid = false;
      markError(field, 'Enter a valid phone number (e.g. +212 6XX XXX XXX)');
    } else if (field.type === 'checkbox' && !field.checked) {
      valid = false;
      const errEl = document.getElementById('err-terms');
      if (errEl) errEl.textContent = 'You must agree to the terms';
    }
  });

  // Shake the step if invalid
  if (!valid) {
    stepEl.classList.add('shake');
    setTimeout(() => stepEl.classList.remove('shake'), 500);
  }

  return valid;
}

function markError(field, message) {
  field.classList.add('input-error');
  const errId = `err-${field.id}`;
  const errEl = document.getElementById(errId);
  if (errEl) errEl.textContent = message;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[0-9\s\-]{8,18}$/.test(phone.replace(/\s/g, '').replace(/-/g, ''));
}

// Real-time validation — clear error on input
document.querySelectorAll('.reg-form input, .reg-form select, .reg-form textarea').forEach(field => {
  const events = field.tagName === 'SELECT' ? ['change'] : ['input', 'blur'];
  events.forEach(evt => {
    field.addEventListener(evt, () => {
      field.classList.remove('input-error');
      const errEl = document.getElementById(`err-${field.id}`);
      if (errEl) errEl.textContent = '';
    });
  });
});

/* ── TEAM TOGGLE LOGIC ── */
function toggleTeam(val) {
  const teamNameGroup = document.getElementById('team-name-group');
  const teamSizeGroup = document.getElementById('team-size-group');
  const teamNameInput = document.getElementById('team-name');
  const teamSizeSelect = document.getElementById('team-size');

  if (val === 'team') {
    teamNameGroup.style.display = 'flex';
    teamSizeGroup.style.display = 'block';
    teamNameInput.required = true;
    teamSizeSelect.required = true;
  } else {
    teamNameGroup.style.display = 'none';
    teamSizeGroup.style.display = 'none';
    teamNameInput.required = false;
    teamSizeSelect.required = false;
    teamNameInput.value = '';
    teamSizeSelect.selectedIndex = 0;
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
      <div class="member-block-title">Member ${i}</div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name <span class="req">*</span></label>
          <input type="text" name="member${i}_name" placeholder="Full name" required />
        </div>
        <div class="form-group">
          <label>Phone Number <span class="req">*</span></label>
          <input type="tel" name="member${i}_phone" placeholder="+212 6XX XXX XXX" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email <span class="req">*</span></label>
          <input type="email" name="member${i}_email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>CIN / Student ID <span class="req">*</span></label>
          <input type="text" name="member${i}_cin" placeholder="AB123456" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Institution</label>
          <input type="text" name="member${i}_etablissement" placeholder="Universiapolis Laâyoune" />
        </div>
        <div class="form-group">
          <label>Program</label>
          <select name="member${i}_filiere">
            <option value="">Select program</option>
            <option>Engineering — Computer Science</option>
            <option>Engineering — Civil / Industrial</option>
            <option>Business Administration</option>
            <option>Finance &amp; Accounting</option>
            <option>Social Sciences</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Academic Level</label>
          <select name="member${i}_niveau">
            <option value="">Select level</option>
            <option>1st Year (Bac+1)</option>
            <option>2nd Year (Bac+2)</option>
            <option>3rd Year (Bac+3)</option>
            <option>4th Year (Bac+4)</option>
            <option>5th Year (Bac+5)</option>
            <option>Master / PhD</option>
          </select>
        </div>
        <div class="form-group">
          <label>T-Shirt Size</label>
          <select name="member${i}_tshirt">
            <option value="">Select size</option>
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
const ideaTextarea = document.getElementById('project-idea');
const motivationTextarea = document.getElementById('motivation');

if (ideaTextarea) {
  ideaTextarea.addEventListener('input', () => {
    document.getElementById('idea-count').textContent = ideaTextarea.value.length;
  });
}

if (motivationTextarea) {
  motivationTextarea.addEventListener('input', () => {
    document.getElementById('motivation-count').textContent = motivationTextarea.value.length;
  });
}

/* ── APPLICATION SUMMARY ── */
function buildSummary() {
  const fields = [
    { label: 'Full Name', id: 'fullname' },
    { label: 'Email', id: 'email' },
    { label: 'Phone', id: 'phone' },
    { label: 'CIN', id: 'cin' },
    { label: 'Institution', id: 'etablissement' },
    { label: 'Program', id: 'filiere' },
    { label: 'Level', id: 'niveau' },
    { label: 'Experience', id: 'experience' },
    { label: 'T-Shirt', id: 'tshirt' },
    { label: 'Registering as', id: 'registering-as' },
    { label: 'Challenge Theme', id: 'project-theme' },
  ];

  const container = document.getElementById('summary-content');
  container.innerHTML = fields.map(f => {
    const el = document.getElementById(f.id);
    const val = el ? (el.options ? el.options[el.selectedIndex]?.text : el.value) : '—';
    return `<div class="fs-item"><span class="fs-label">${f.label}</span><span class="fs-value">${escHtml(val || '—')}</span></div>`;
  }).join('');

  // Add team name if applicable
  const regAs = document.getElementById('registering-as').value;
  if (regAs === 'team') {
    const teamName = document.getElementById('team-name').value || '—';
    container.innerHTML += `<div class="fs-item"><span class="fs-label">Team Name</span><span class="fs-value">${escHtml(teamName)}</span></div>`;
  }
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── FORM SUBMISSION ── */
const form = document.getElementById('hackathon-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Final validation of step 4
    if (!validateStep(4)) return;

    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Submitting...';
    submitSpinner.classList.remove('hidden');

    // Submit via Netlify Forms
    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(response => {
      if (response.ok) {
        window.location.href = '/success.html';
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Submission error:', error);
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Application';
      submitSpinner.classList.add('hidden');
      showToast('Something went wrong. Please try again.', 'error');
    });
  });
}

/* ── TOAST NOTIFICATION ── */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ── SPOTS BAR ANIMATION ── */
const spotsBar = document.querySelector('.spots-fill');
if (spotsBar) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        spotsBar.style.width = '30%';
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  barObserver.observe(spotsBar);
}

/* ── KEYBOARD NAVIGATION ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
    e.preventDefault();
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }
});
