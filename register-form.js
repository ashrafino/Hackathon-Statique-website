/* =============================================
   REGISTER FORM — Multi-Step Wizard Logic
   Separated from app.js to avoid DOM errors
   on pages that don't have hero/nav elements.
============================================= */

let currentStep = 1;
const totalSteps = 4;
let currentLang = 'en';

/* =============================================
   INTERNATIONALIZATION (i18n)
============================================= */
const translations = {
  fr: {
    // Header & general
    back_to_site: 'Retour au site',
    section_label: 'Formulaire de Candidature',
    title: 'Inscrivez-vous en tant que<br /><em>participant</em>',
    subtitle: 'Remplissez vos informations ci-dessous. Nous confirmerons votre place sous 48 heures.',

    // Steps
    step_personal: 'Personnel',
    step_team: 'Équipe',
    step_project: 'Projet',
    step_submit: 'Soumettre',

    // Step 1: Personal Info
    personal_info: 'Informations Personnelles',
    label_fullname: 'Nom Complet <span class="req">*</span>',
    ph_fullname: 'Votre nom complet',
    label_phone: 'Numéro de Téléphone <span class="req">*</span>',
    ph_phone: '+212 6XX XXX XXX',
    label_email: 'Adresse Email <span class="req">*</span>',
    ph_email: 'vous@exemple.com',
    label_cin: 'CIN / N° Étudiant <span class="req">*</span>',
    ph_cin: 'AB123456',
    label_institution: 'Établissement <span class="req">*</span>',
    ph_institution: 'Votre université ou école',
    label_program: 'Filière / Domaine d\'Études <span class="req">*</span>',
    label_level: 'Niveau Académique <span class="req">*</span>',
    label_experience: 'Expérience Technique <span class="req">*</span>',
    label_tshirt: 'Taille T-Shirt <span class="req">*</span>',
    btn_next_team: 'Suivant : Équipe',

    // Step 2: Team
    team_info: 'Informations d\'Équipe',
    label_registering_as: 'Inscription en tant que <span class="req">*</span>',

    // Step 3: Project
    project_idea_section: 'Idée de Projet',
    label_theme: 'Thème du Challenge <span class="req">*</span>',
    label_project_idea: 'Brève Idée de Projet',
    ph_project_idea: 'Décrivez votre idée en 2–3 phrases (facultatif à ce stade)...',

    // Step 4: Motivation
    motivation_section: 'Motivation',
    label_motivation: 'Pourquoi souhaitez-vous participer ?',
    ph_motivation: 'Dites-nous ce qui vous motive à rejoindre ce hackathon (facultatif)...',
    label_heard_from: 'Comment avez-vous entendu parler de nous ?',
    terms_text: 'Je confirme être disponible les <strong>23–24 mai 2026</strong> et j\'accepte les conditions de l\'événement.',
    summary_title: 'Résumé de la Candidature',
    btn_submit: 'Soumettre la Candidature',

    // Sidebar
    what_to_expect: 'À quoi s\'attendre',
    event_details: 'Détails de l\'Événement',

    // Validation messages
    field_required: 'Ce champ est obligatoire',
    invalid_email: 'Veuillez saisir une adresse email valide',
    invalid_phone: 'Saisissez un numéro valide (ex. +212 6XX XXX XXX)',
    must_agree: 'Vous devez accepter les conditions',
  },
  en: {
    back_to_site: 'Back to site',
    section_label: 'Application Form',
    title: 'Register as a<br /><em>participant</em>',
    subtitle: 'Fill in your details below. We\'ll confirm your spot within 48 hours.',
    step_personal: 'Personal',
    step_team: 'Team',
    step_project: 'Project',
    step_submit: 'Submit',
    personal_info: 'Personal Information',
    label_fullname: 'Full Name <span class="req">*</span>',
    ph_fullname: 'Your full name',
    label_phone: 'Phone Number <span class="req">*</span>',
    ph_phone: '+212 6XX XXX XXX',
    label_email: 'Email Address <span class="req">*</span>',
    ph_email: 'you@example.com',
    label_cin: 'CIN / Student ID <span class="req">*</span>',
    ph_cin: 'AB123456',
    label_institution: 'Institution <span class="req">*</span>',
    ph_institution: 'Your university or school',
    label_program: 'Program / Field of Study <span class="req">*</span>',
    label_level: 'Academic Level <span class="req">*</span>',
    label_experience: 'Technical Experience <span class="req">*</span>',
    label_tshirt: 'T-Shirt Size <span class="req">*</span>',
    btn_next_team: 'Next: Team Info',
    team_info: 'Team Information',
    label_registering_as: 'Registering as <span class="req">*</span>',
    project_idea_section: 'Project Idea',
    label_theme: 'Challenge Theme <span class="req">*</span>',
    label_project_idea: 'Brief Project Idea',
    ph_project_idea: 'Describe your idea in 2–3 sentences (optional at this stage)...',
    motivation_section: 'Motivation',
    label_motivation: 'Why do you want to participate?',
    ph_motivation: 'Tell us what motivates you to join this hackathon (optional)...',
    label_heard_from: 'How did you hear about us?',
    terms_text: 'I confirm I will be available on <strong>May 23–24, 2026</strong> and agree to the event terms.',
    summary_title: 'Application Summary',
    btn_submit: 'Submit Application',
    what_to_expect: 'What to expect',
    event_details: 'Event Details',
    field_required: 'This field is required',
    invalid_email: 'Please enter a valid email address',
    invalid_phone: 'Enter a valid phone number (e.g. +212 6XX XXX XXX)',
    must_agree: 'You must agree to the terms',
  }
};

function toggleFormLanguage() {
  const btn = document.getElementById('reg-lang-toggle');
  if (currentLang === 'en') {
    currentLang = 'fr';
    btn.textContent = 'EN';
  } else {
    currentLang = 'en';
    btn.textContent = 'FR';
  }
  applyTranslations();
  toggleCINField();
}

function applyTranslations() {
  const t = translations[currentLang];

  // Text content translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      // For buttons with SVG children, only replace the text node
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        const svg = el.querySelector('svg');
        if (svg) {
          // Remove text nodes, keep SVG
          Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              node.textContent = '';
            }
          });
          // Insert text before SVG
          if (el.classList.contains('reg-back')) {
            el.childNodes[el.childNodes.length - 1].textContent = '\n      ' + t[key] + '\n    ';
          } else {
            // For next buttons — text before SVG
            const textNode = document.createTextNode('\n                ' + t[key] + '\n                ');
            el.insertBefore(textNode, svg);
            // Remove old text nodes (keep only latest + svg)
            let count = 0;
            Array.from(el.childNodes).forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                count++;
                if (count > 1) return; // keep only first text node
              }
            });
          }
        } else {
          el.textContent = t[key];
        }
      } else {
        el.textContent = t[key];
      }
    }
  });

  // innerHTML translations (for labels with <span> req markers)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // Placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) {
      el.placeholder = t[key];
    }
  });
}

function toggleCINField() {
  const cinGroup = document.getElementById('cin-group');
  const cinInput = document.getElementById('cin');
  if (!cinGroup || !cinInput) return;

  if (currentLang === 'fr') {
    // Hide CIN field in French mode
    cinGroup.style.display = 'none';
    cinInput.required = false;
    cinInput.value = '';
  } else {
    // Show CIN field in English mode
    cinGroup.style.display = 'flex';
    cinInput.required = true;
  }
}

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
  const t = translations[currentLang];

  // Clear previous errors in this step
  stepEl.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  stepEl.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));

  requiredFields.forEach(field => {
    // Skip hidden fields (like CIN in FR mode)
    if (field.offsetParent === null && field.type !== 'checkbox') return;

    if (field.type === 'checkbox') {
      if (!field.checked) {
        valid = false;
        const errEl = document.getElementById('err-terms');
        if (errEl) errEl.textContent = t.must_agree;
      }
    } else if (!field.value || field.value.trim() === '') {
      valid = false;
      markError(field, t.field_required);
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
      valid = false;
      markError(field, t.invalid_email);
    } else if (field.type === 'tel' && !isValidPhone(field.value)) {
      valid = false;
      markError(field, t.invalid_phone);
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
          <label>Institution</label>
          <input type="text" name="member${i}_etablissement" placeholder="Universiapolis Laâyoune" />
        </div>
      </div>
      <div class="form-row">
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
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>T-Shirt Size</label>
          <select name="member${i}_tshirt">
            <option value="">Select size</option>
            <option>XS</option><option>S</option><option>M</option>
            <option>L</option><option>XL</option><option>XXL</option>
          </select>
        </div>
        <div class="form-group"></div>
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
    { label: 'Institution', id: 'etablissement' },
    { label: 'Program', id: 'filiere' },
    { label: 'Level', id: 'niveau' },
    { label: 'Experience', id: 'experience' },
    { label: 'T-Shirt', id: 'tshirt' },
    { label: 'Registering as', id: 'registering-as' },
    { label: 'Challenge Theme', id: 'project-theme' },
  ];

  // Add CIN only if visible (EN mode)
  if (currentLang === 'en') {
    fields.splice(3, 0, { label: 'CIN', id: 'cin' });
  }

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
    submitText.textContent = currentLang === 'fr' ? 'Envoi en cours...' : 'Submitting...';
    submitSpinner.classList.remove('hidden');

    // Use native form submission via a hidden iframe-like approach
    // This is the most reliable method for Netlify Forms
    const formData = new FormData(form);
    const encoded = new URLSearchParams(formData).toString();

    fetch(form.action || '/success.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encoded
    })
    .then(response => {
      if (response.ok) {
        window.location.href = '/success.html';
      } else {
        // Fallback: submit the form natively
        console.warn('Fetch submission returned', response.status, '— falling back to native submit.');
        form.submit();
      }
    })
    .catch(error => {
      console.warn('Fetch failed, falling back to native submit:', error);
      // Fallback: let the browser handle it natively
      form.submit();
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
