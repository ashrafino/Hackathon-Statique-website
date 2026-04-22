/* =============================================
   NAV SCROLL
============================================= */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* =============================================
   ACTIVE NAV LINK
============================================= */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
if (navLinks.length > 0) {
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY + 120;
    sections.forEach(sec => {
      if (scroll >= sec.offsetTop && scroll < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  });
}

/* =============================================
   SPLIT TEXT — HERO TITLE LETTER ANIMATION
   Only applied to .line-3 (no bg-clip gradient)
============================================= */
document.querySelectorAll('.line-3').forEach(el => {
  const text = el.textContent.trim();
  el.innerHTML = text.split('').map((ch, i) =>
    `<span class="char" style="animation-delay:${0.4 + i * 0.04}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');
});

/* =============================================
   ANIMATED COUNTER — STATS
============================================= */
function animateCounter(el, target, duration = 1800) {
  const isTime = el.dataset.suffix === 'H';
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(ease * target) + (isTime ? 'H' : '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num');
statNums.forEach(el => {
  const raw = el.textContent.trim();
  const num = parseInt(raw);
  if (isNaN(num)) return; // skip non-numeric stats (teasers, icons, etc.)
  el.dataset.suffix = raw.includes('H') ? 'H' : '';
  el.dataset.target = num;
  el.textContent = '0' + el.dataset.suffix;
});

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.target);
      if (isNaN(target)) return; // skip non-numeric stats
      animateCounter(el, target);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statsObserver.observe(el));

/* =============================================
   SCROLL REVEAL — STAGGERED
============================================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.why-card, .orga-card, .sponsor-card, .tl-item, .benefit, .gallery-item, .section-label, .section-title'
).forEach((el, i) => {
  el.classList.add('reveal-el');
  el.style.transitionDelay = `${(i % 5) * 0.07}s`;
  revealObserver.observe(el);
});

/* =============================================
   TILT CARDS — 3D HOVER
============================================= */
document.querySelectorAll('.why-card, .orga-card, .sponsor-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    card.style.boxShadow = `${-x * 16}px ${-y * 16}px 40px rgba(108,99,255,0.18)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

/* =============================================
   MAGNETIC BUTTONS
============================================= */
document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
    setTimeout(() => btn.style.transition = '', 400);
  });
});

/* =============================================
   HAMBURGER — MOBILE NAV
============================================= */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.querySelector('.nav-links');

if (hamburger && navLinksContainer) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
    document.body.classList.toggle('nav-open', navLinksContainer.classList.contains('open'));
  });

  // Close menu when any link is clicked
  navLinksContainer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });

  // Close menu when clicking on the overlay background (not a link)
  navLinksContainer.addEventListener('click', (e) => {
    if (e.target === navLinksContainer) {
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  });
}

/* =============================================
   REACTBITS SPOTLIGHT — CARD HOVER
============================================= */
document.querySelectorAll('.why-card, .sponsor-card, .orga-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    card.style.setProperty('--spot-x', x);
    card.style.setProperty('--spot-y', y);
  });
});

/* =============================================
   AURORA / PARTICLE CANVAS — HERO BG
============================================= */
(function() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'aurora-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.55;';
  heroBg.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: 0, y: 0 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.5 ? '108,99,255' : '0,212,170';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.x += dx / dist * 1.2;
        this.y += dy / dist * 1.2;
      }
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${0.12 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* =============================================
   TYPEWRITER — HERO SUBTITLE
============================================= */
function runHeroTypewriter(lines) {
  const el = document.querySelector('.hero-sub');
  if (!el || !Array.isArray(lines)) return;
  const full = lines.join('\n');
  el.textContent = '';
  el.style.whiteSpace = 'pre-line';
  let i = 0;
  function type() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i++;
      setTimeout(type, 22);
    }
  }
  setTimeout(type, 350);
}

/* =============================================
   SHINY SHIMMER ON SECTION LABELS
============================================= */
document.querySelectorAll('.section-label').forEach(el => {
  el.classList.add('shimmer-text');
});

/* =============================================
   CURSOR GLOW
============================================= */
(function() {
  const cursor = document.createElement('div');
  cursor.id = 'cursor-glow';
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .why-card, .orga-card, .sponsor-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-big'));
  });
})();

/* =============================================
   TIMELINE PROGRESS LINE DRAW
============================================= */
document.querySelectorAll('.timeline').forEach(tl => {
  const tlObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('tl-animate');
    });
  }, { threshold: 0.1 });
  tlObserver.observe(tl);
});

/* =============================================
   SPOTS BAR ANIMATION
============================================= */
const spotsBar = document.querySelector('.spots-fill');
if (spotsBar) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // simulate ~30 spots taken out of 100
        spotsBar.style.width = '30%';
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  barObserver.observe(spotsBar);
}

/* =============================================
   TEAM REGISTRATION LOGIC
   (Moved to register-form.js for the register page)
============================================= */

/* renderMembers() moved to register-form.js */

/* =============================================
   LANGUAGE TOGGLE
============================================= */
function setLanguage(lang) {
  applyLanguage(lang);
  localStorage.setItem('language', lang);
}

const i18n = {
  en: {
    title: 'Vibe Coding Hackathon — Laâyoune',
    heroSubLines: [
      '48 hours to build real MVPs with AI, mentors, and industry experts.',
      'Water, finance, and tourism challenges. Career opportunities included.'
    ],
    heroPrize: 'Prizes Revealed Soon',
    ctaPrize: 'Prizes Soon',
    map: {
      '.nav-links li:nth-child(1) a': 'Concept',
      '.nav-links li:nth-child(2) a': 'Schedule',
      '.nav-links li:nth-child(3) a': 'Organizers',
      '.nav-links li:nth-child(4) a': 'Sponsorship',
      '.nav-links li:nth-child(5) a': 'Apply',
      '.nav-links li:nth-child(6) a': 'Contact',
      '.hero-badge': '<span class="badge-dot"></span> May 23–24, 2026 · Laâyoune',
      '.hero-cta .btn-primary': 'Apply Now',
      '.hero-cta .btn-ghost': 'Discover the Concept',
      '.stat:nth-child(1) .stat-label': 'Participants',
      '.stat:nth-child(3) .stat-label': 'Non-Stop',
      '.concept .section-label': '02 — Concept',
      '.concept .section-title': 'A new era of<br /><em>development</em>',
      '.concept-lead': 'Vibe Coding marks a revolution: the democratization of coding through AI. By delegating syntactic complexity to AI, participants — engineers, managers, doctors, nurses, lawyers, and marketers — break free from technical barriers to focus on what truly matters: solution architecture and real-world value.',
      '.concept-body': '120 students from all higher education institutions in the Laâyoune-Sakia El Hamra region form pluridisciplinary teams to build functional MVPs tackling three real local challenges: <strong>smart water management (GreenTech)</strong>, <strong>financial inclusion for cooperatives (FinTech)</strong>, and <strong>tourism modernization</strong> — guided by local business leaders, financial experts, and Universiapolis professors throughout the full 48 hours.',
      '.concept-list li:nth-child(1)': '<strong>Who can join:</strong> Students from engineering, management, health, law, and all majors.',
      '.concept-list li:nth-child(2)': '<strong>What you build:</strong> A working MVP solving a real regional challenge in 48H.',
      '.concept-list li:nth-child(3)': '<strong>What you get:</strong> AI tools, mentors, jury feedback, and internship visibility.',
      '.why-card:nth-child(1) h3': 'Freedom to Innovate',
      '.why-card:nth-child(1) p': 'Prototype without limits. Turn the impossible into reality using generative AI.',
      '.why-card:nth-child(2) h3': 'Direct Regional Impact',
      '.why-card:nth-child(2) p': 'Water scarcity, economic development, and sustainable tourism — real challenges, real solutions.',
      '.why-card:nth-child(3) h3': 'Transformation Potential',
      '.why-card:nth-child(3) p': 'Positioning Universiapolis as the crossroads of tech and financial innovation in Laâyoune — and beyond.',
      '.programme .section-label': '03 — Schedule',
      '.programme .section-title': 'A marathon<br /><em>48H non-stop</em>',
      '.timeline-col:nth-child(1) .day-num': 'FRI',
      '.timeline-col:nth-child(1) .day-date': 'May 23',
      '.timeline-col:nth-child(1) .tl-item:nth-child(1) .tl-content': '<strong>Welcome &amp; Opening Ceremony</strong><p>Registration, breakfast &amp; regional challenge briefing</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(2) .tl-content': '<strong>Masterclass: Vibe Coding 101</strong><p>Advanced AI prompting with Cursor, Claude &amp; Copilot</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(3) .tl-content': '<strong>Sprint Launch 🚀</strong><p>48 hours of AI-assisted development officially begins</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(4) .tl-content': '<strong>Mentor Checkpoint #1</strong><p>Business model validation with industry experts</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(5) .tl-time': 'Night',
      '.timeline-col:nth-child(1) .tl-item:nth-child(5) .tl-content': '<strong>Code &amp; Energy</strong><p>Dinner and overnight AI-powered development session</p>',
      '.timeline-col:nth-child(3) .day-num': 'SAT',
      '.timeline-col:nth-child(3) .day-date': 'May 24',
      '.timeline-col:nth-child(3) .tl-item:nth-child(1) .tl-content': '<strong>Mentor Checkpoint #2</strong><p>Pitch coaching and MVP testing with experts</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(2) .tl-content': '<strong>Code Freeze ⛔</strong><p>AI stops. Teams submit a functional MVP, demo link, and 5-slide pitch.</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(3) .tl-content': '<strong>Demo Day — Live Pitches</strong><p>Teams demo working apps before the expert jury</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(4) .tl-content': '<strong>Closing Ceremony &amp; Awards</strong><p>Awards ceremony, surprise reveals &amp; celebration</p>',
      '.jury-note span': 'The jury is composed of <strong>university professors</strong> and <strong>industry experts</strong> to ensure an objective evaluation.',
      '.organisateurs .section-label': '01 — Organizers',
      '.organisateurs .section-title': 'The forces<br /><em>behind the event</em>',
      '.orga-badge': 'Host',
      '.orga-card p': 'Founded in 2016, Universiapolis Laâyoune stands as a center of excellence in Morocco\'s southern provinces. It offers programs in Engineering, Management, and Sciences aligned with international standards, while actively contributing to the region\'s socio-economic development.',
      '.orga-tags': '<span>Engineering</span><span>Management</span><span>Sciences</span>',
      '.partenariat .section-label': '04 — Sponsorship',
      '.partenariat .section-title': 'A universal<br /><em>partnership</em>',
      '.partenariat-lead': 'Whether you\'re in construction, food industry, banking, tourism, or services, this hackathon creates value for you. <strong>Goal: Zero cost for students.</strong>',
      '.trust-strip': '<span>Hosted by Universiapolis Laâyoune</span><span>120 participants target</span><span>48H production sprint</span><span>50K+ media impressions</span>',
      '.sponsor-card:nth-child(1) h3': 'Catering',
      '.sponsor-card:nth-child(1) p': '240 full meals (2 lunches), 120 dinners Saturday night, continuous coffee breaks &amp; energy drinks over 48h',
      '.sponsor-card:nth-child(1) .sponsor-type': 'Catering Service · Food Donations',
      '.sponsor-card:nth-child(2) h3': 'Infrastructure &amp; AI Tools',
      '.sponsor-card:nth-child(2) p': '40 power strips, 4 backup 4G/5G routers, 30 premium AI subscriptions (Cursor / ChatGPT Plus) for 48h',
      '.sponsor-card:nth-child(2) .sponsor-type': 'Equipment · IT &amp; AI Access',
      '.sponsor-card:nth-child(3) h3': 'Prizes &amp; Career',
      '.sponsor-card:nth-child(3) p:not(.prize-note)': 'Top teams walk away with more than recognition. Cash prizes, internship fast-tracks &amp; direct recruitment opportunities await — details revealed at the opening ceremony.',
      '.sponsor-card:nth-child(3) .sponsor-type': 'Rewards · Internships · Recruitment',
      '.sponsor-card:nth-child(4) h3': 'Logistics &amp; Print',
      '.sponsor-card:nth-child(4) p': '120 custom T-shirts with sponsor logos, 120 professional badges, 4 banners (3×1m), 2 roll-ups, photo wall',
      '.sponsor-card:nth-child(4) .sponsor-type': 'Printing · Textile · Signage',
      '.benefit:nth-child(1) h4': 'Media Visibility',
      '.benefit:nth-child(1) p': '50,000+ social media impressions target, professional aftermovie &amp; post-event CSR impact report delivered to every partner',
      '.benefit:nth-child(2) h4': 'Employer Branding',
      '.benefit:nth-child(2) p': 'Direct access to 120 top profiles — engineers, finance, management &amp; more — ideal for internship &amp; pre-hire recruitment',
      '.benefit:nth-child(3) h4': 'CSR Impact',
      '.benefit:nth-child(3) p': 'Concrete support for education &amp; innovation in Laâyoune-Sakia El Hamra — aligned with Morocco\'s New Development Model',
      '.gallery .section-label': '00 — Previous Edition',
      '.gallery .section-title': 'Proven track<br /><em>record</em>',
      '.gallery-lead': 'May 23–24 · <strong>Vibe Coding &amp; FinTech Hackathon</strong> — 48-hour competition open to all Universiapolis programs. Multidisciplinary teams combining Tech and Management disciplines to solve real local challenges.',
      '.registration .section-label': '06 — Apply',
      '.registration .section-title': 'Ready to<br /><em>participate?</em>',
      '.reg-lead': '120 spots available. Applications close May 20, 2026. Free for all students — Engineers, Managers, Doctors, Nurses, Lawyers &amp; more.',
      '.rcs-item:nth-child(1) small': 'Spots',
      '.rcs-item:nth-child(3) small': 'Non-Stop',
      '.registration .btn-primary': 'Apply Now',
      '.reg-cta-note': 'Takes about 3 minutes · No fee required',
      '.faq .section-label': '07 — FAQ',
      '.faq .section-title': 'Everything you need<br /><em>before applying</em>',
      '.faq-item:nth-child(1) h3': 'Who can apply?',
      '.faq-item:nth-child(1) p': 'All students in the Laâyoune-Sakia El Hamra region, across all majors.',
      '.faq-item:nth-child(2) h3': 'Can I join without coding experience?',
      '.faq-item:nth-child(2) p': 'Yes. Teams are multidisciplinary and AI tools help accelerate execution.',
      '.faq-item:nth-child(3) h3': 'What is the team size?',
      '.faq-item:nth-child(3) p': 'You can apply solo or as a team. Team details are confirmed during registration.',
      '.faq-item:nth-child(4) h3': 'What should we submit?',
      '.faq-item:nth-child(4) p': 'A working MVP, a demo link, and a short pitch deck by the Code Freeze deadline.',
      '.faq-item:nth-child(5) h3': 'What should I bring?',
      '.faq-item:nth-child(5) p': 'Your laptop, charger, student ID, and your best execution mindset.',
      '.faq-item:nth-child(6) h3': 'When do applications close?',
      '.faq-item:nth-child(6) p': 'Applications close on May 20, 2026. Spots are limited to 120 participants.',
      '.contact .section-label': '05 — Contact',
      '.contact .section-title': 'Join the<br /><em>adventure</em>',
      '.contact-lead': 'No complex pricing tiers. We believe in tailored partnerships — cash or in-kind. Every contribution is a brick in the foundation of regional innovation. We commit to a full CSR Impact Report within 15 days of closing.',
      '.contact .btn-primary': 'Get in Touch',
      '.contact-tags': '<span>Logo on all materials</span><span>Stand &amp; Networking</span><span>Speaking opportunity</span><span>Recruitment access</span><span>R&amp;D Lab access</span><span>50K+ impressions</span>',
      '.footer-copy a': 'Privacy & Contact',
      '.fuzzy-prize-hint': 'hover to peek',
      '.prize-note': 'Full prize breakdown announced on May 23 at opening ceremony.',
      '.footer-info': 'Universiapolis Laâyoune · May 23–24, 2026',
    }
  },
  fr: {
    title: 'Hackathon Vibe Coding — Laâyoune',
    heroSubLines: [
      '48 heures pour construire des MVPs concrets avec l’IA, des mentors et des experts.',
      'Défis eau, finance et tourisme. Opportunités de carrière incluses.'
    ],
    heroPrize: 'Prix annonces bientot',
    ctaPrize: 'Prix bientot',
    map: {
      '.nav-links li:nth-child(1) a': 'Concept',
      '.nav-links li:nth-child(2) a': 'Programme',
      '.nav-links li:nth-child(3) a': 'Organisateurs',
      '.nav-links li:nth-child(4) a': 'Partenariat',
      '.nav-links li:nth-child(5) a': 'Postuler',
      '.nav-links li:nth-child(6) a': 'Contact',
      '.hero-badge': '<span class="badge-dot"></span> 23–24 Mai 2026 · Laâyoune',
      '.hero-cta .btn-primary': 'Postuler',
      '.hero-cta .btn-ghost': 'Découvrir le concept',
      '.stat:nth-child(1) .stat-label': 'Participants',
      '.stat:nth-child(3) .stat-label': 'Non-Stop',
      '.concept .section-label': '02 — Concept',
      '.concept .section-title': 'Une nouvelle ère<br /><em>du développement</em>',
      '.concept-lead': 'Vibe Coding marque une révolution : la démocratisation du codage grâce à l\'IA. En déléguant la complexité syntaxique à l\'IA, les participants — ingénieurs, managers, médecins, infirmiers, avocats et marketeurs — s\'affranchissent des barrières techniques pour se concentrer sur l\'essentiel : l\'architecture des solutions et la valeur réelle.',
      '.concept-body': '120 étudiants de tous les établissements d\'enseignement supérieur de la région Laâyoune-Sakia El Hamra forment des équipes pluridisciplinaires pour construire des MVPs fonctionnels répondant à trois défis locaux concrets : <strong>la gestion intelligente de l\'eau (GreenTech)</strong>, <strong>l\'inclusion financière des coopératives (FinTech)</strong> et <strong>la modernisation du tourisme</strong> — guidés par des chefs d\'entreprise locaux, des experts financiers et des professeurs d\'Universiapolis pendant 48 heures.',
      '.concept-list li:nth-child(1)': '<strong>Qui peut participer :</strong> Les étudiants en ingénierie, gestion, santé, droit et toutes les autres filières.',
      '.concept-list li:nth-child(2)': '<strong>Ce que vous construisez :</strong> Un MVP fonctionnel résolvant un défi régional concret en 48H.',
      '.concept-list li:nth-child(3)': '<strong>Ce que vous obtenez :</strong> Outils IA, mentors, retours du jury et visibilité pour des stages.',
      '.why-card:nth-child(1) h3': 'Liberté d\'innover',
      '.why-card:nth-child(1) p': 'Protypez sans limites. Transformez l\'impossible en réalité grâce à l\'IA générative.',
      '.why-card:nth-child(2) h3': 'Impact Régional Direct',
      '.why-card:nth-child(2) p': 'Pénurie d\'eau, développement économique et tourisme durable — de vrais défis, de vraies solutions.',
      '.why-card:nth-child(3) h3': 'Potentiel de Transformation',
      '.why-card:nth-child(3) p': 'Positionner Universiapolis comme le carrefour de l\'innovation technologique et financière à Laâyoune — et au-delà.',
      '.programme .section-label': '03 — Programme',
      '.programme .section-title': 'Un marathon<br /><em>48H non-stop</em>',
      '.timeline-col:nth-child(1) .day-num': 'VEN',
      '.timeline-col:nth-child(1) .day-date': '23 Mai',
      '.timeline-col:nth-child(1) .tl-item:nth-child(1) .tl-content': '<strong>Accueil et Cérémonie d\'Ouverture</strong><p>Inscription, petit-déjeuner et présentation des défis régionaux</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(2) .tl-content': '<strong>Masterclass : Vibe Coding 101</strong><p>Prompting IA avancé avec Cursor, Claude et Copilot</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(3) .tl-content': '<strong>Lancement du Sprint 🚀</strong><p>Le développement assisté par IA de 48 heures commence officiellement</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(4) .tl-content': '<strong>Point d\'Étape Mentors #1</strong><p>Validation du business model avec des experts de l\'industrie</p>',
      '.timeline-col:nth-child(1) .tl-item:nth-child(5) .tl-time': 'Nuit',
      '.timeline-col:nth-child(1) .tl-item:nth-child(5) .tl-content': '<strong>Code et Énergie</strong><p>Dîner et session de développement de nuit par IA</p>',
      '.timeline-col:nth-child(3) .day-num': 'SAM',
      '.timeline-col:nth-child(3) .day-date': '24 Mai',
      '.timeline-col:nth-child(3) .tl-item:nth-child(1) .tl-content': '<strong>Point d\'Étape Mentors #2</strong><p>Coaching de pitch et test du MVP avec des experts</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(2) .tl-content': '<strong>Arrêt du Code ⛔</strong><p>L\'IA s\'arrête. Les équipes soumettent un MVP fonctionnel, un lien de démo et un pitch de 5 slides.</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(3) .tl-content': '<strong>Demo Day — Pitchs en Direct</strong><p>Les équipes font la démo de leurs applications devant le jury d\'experts</p>',
      '.timeline-col:nth-child(3) .tl-item:nth-child(4) .tl-content': '<strong>Cérémonie de Clôture et Remise des Prix</strong><p>Remise des prix, révélations surprises et célébration</p>',
      '.jury-note span': 'Le jury est composé de <strong>professeurs d\'université</strong> et d\'<strong>experts de l\'industrie</strong> pour assurer une évaluation objective.',
      '.organisateurs .section-label': '01 — Organisateurs',
      '.organisateurs .section-title': 'Les forces<br /><em>derrière l\'événement</em>',
      '.orga-badge': 'Hôte',
      '.orga-card p': 'Fondée en 2016, Universiapolis Laâyoune s\'impose comme un pôle d\'excellence dans les provinces du sud du Maroc. Elle propose des programmes en Ingénierie, Management et Sciences alignés sur les standards internationaux, tout en contribuant activement au développement socio-économique de la région.',
      '.orga-tags': '<span>Ingénierie</span><span>Management</span><span>Sciences</span>',
      '.partenariat .section-label': '04 — Partenariat',
      '.partenariat .section-title': 'Un partenariat<br /><em>universel</em>',
      '.partenariat-lead': 'Que vous soyez dans la construction, l\'agroalimentaire, la banque, le tourisme ou les services, ce hackathon crée de la valeur pour vous. <strong>Objectif : Zéro coût pour les étudiants.</strong>',
      '.trust-strip': '<span>Hébergé par Universiapolis Laâyoune</span><span>Objectif 120 participants</span><span>Sprint de production de 48H</span><span>Plus de 50K impressions médias</span>',
      '.sponsor-card:nth-child(1) h3': 'Restauration',
      '.sponsor-card:nth-child(1) p': '240 repas complets (2 déjeuners), 120 dîners samedi soir, pauses café continues &amp; boissons énergisantes sur 48h',
      '.sponsor-card:nth-child(1) .sponsor-type': 'Service Traiteur · Dons Alimentaires',
      '.sponsor-card:nth-child(2) h3': 'Infrastructure &amp; Outils IA',
      '.sponsor-card:nth-child(2) p': '40 multiprises, 4 routeurs 4G/5G de secours, 30 abonnements IA premium (Cursor / ChatGPT Plus) pour 48h',
      '.sponsor-card:nth-child(2) .sponsor-type': 'Équipement · Accès IT &amp; IA',
      '.sponsor-card:nth-child(3) h3': 'Prix &amp; Carrière',
      '.sponsor-card:nth-child(3) p:not(.prize-note)': 'Les meilleures équipes repartent avec bien plus que de la reconnaissance. Des prix en espèces, des accès rapides aux stages et des opportunités de recrutement direct vous attendent — détails révélés lors de la cérémonie d\'ouverture.',
      '.sponsor-card:nth-child(3) .sponsor-type': 'Récompenses · Stages · Recrutement',
      '.sponsor-card:nth-child(4) h3': 'Logistique &amp; Impression',
      '.sponsor-card:nth-child(4) p': '120 T-shirts personnalisés avec les logos des sponsors, 120 badges professionnels, 4 banderoles (3×1m), 2 roll-ups, mur de photos',
      '.sponsor-card:nth-child(4) .sponsor-type': 'Impression · Textile · Signalétique',
      '.benefit:nth-child(1) h4': 'Visibilité Médiatique',
      '.benefit:nth-child(1) p': 'Objectif de 50 000+ impressions sur les réseaux sociaux, aftermovie professionnel &amp; rapport d\'impact RSE post-événement remis à chaque partenaire',
      '.benefit:nth-child(2) h4': 'Marque Employeur',
      '.benefit:nth-child(2) p': 'Accès direct à 120 profils de haut niveau — ingénieurs, finance, management &amp; plus — idéal pour les stages et le recrutement en pré-embauche',
      '.benefit:nth-child(3) h4': 'Impact RSE',
      '.benefit:nth-child(3) p': 'Soutien concret à l\'éducation et à l\'innovation à Laâyoune-Sakia El Hamra — aligné sur le Nouveau Modèle de Développement du Maroc',
      '.gallery .section-label': '00 — Édition Précédente',
      '.gallery .section-title': 'Un bilan<br /><em>éprouvé</em>',
      '.gallery-lead': '23–24 Mai · <strong>Hackathon Vibe Coding &amp; FinTech</strong> — Compétition de 48 heures ouverte à tous les programmes d\'Universiapolis. Équipes pluridisciplinaires combinant les disciplines Tech et Management pour résoudre des défis locaux concrets.',
      '.registration .section-label': '06 — Postuler',
      '.registration .section-title': 'Prêt à<br /><em>participer ?</em>',
      '.reg-lead': '120 places disponibles. Clôture des candidatures le 20 mai 2026. Gratuit pour tous les étudiants — Ingénieurs, Managers, Médecins, Infirmiers, Avocats &amp; plus.',
      '.rcs-item:nth-child(1) small': 'Places',
      '.rcs-item:nth-child(3) small': 'Non-Stop',
      '.registration .btn-primary': 'Postuler',
      '.reg-cta-note': 'Prend environ 3 minutes · Aucun frais requis',
      '.faq .section-label': '07 — FAQ',
      '.faq .section-title': 'Tout ce qu\'il faut savoir<br /><em>avant de postuler</em>',
      '.faq-item:nth-child(1) h3': 'Qui peut postuler ?',
      '.faq-item:nth-child(1) p': 'Tous les étudiants de la région Laâyoune-Sakia El Hamra, toutes filières confondues.',
      '.faq-item:nth-child(2) h3': 'Puis-je participer sans expérience en codage ?',
      '.faq-item:nth-child(2) p': 'Oui. Les équipes sont pluridisciplinaires et les outils d\'IA permettent d\'accélérer l\'exécution.',
      '.faq-item:nth-child(3) h3': 'Quelle est la taille de l\'équipe ?',
      '.faq-item:nth-child(3) p': 'Vous pouvez postuler seul ou en équipe. Les détails de l\'équipe sont confirmés lors de l\'inscription.',
      '.faq-item:nth-child(4) h3': 'Que devons-nous soumettre ?',
      '.faq-item:nth-child(4) p': 'Un MVP fonctionnel, un lien de démo et un court pitch deck avant la date limite d\'arrêt du code.',
      '.faq-item:nth-child(5) h3': 'Que dois-je apporter ?',
      '.faq-item:nth-child(5) p': 'Votre ordinateur portable, chargeur, carte d\'étudiant et votre meilleur état d\'esprit d\'exécution.',
      '.faq-item:nth-child(6) h3': 'Quand les candidatures sont-elles closes ?',
      '.faq-item:nth-child(6) p': 'Les candidatures ferment le 20 mai 2026. Les places sont limitées à 120 participants.',
      '.contact .section-label': '05 — Contact',
      '.contact .section-title': 'Rejoignez<br /><em>l\'aventure</em>',
      '.contact-lead': 'Pas de niveaux de tarification complexes. Nous croyons aux partenariats sur mesure — en espèces ou en nature. Chaque contribution est une brique dans les fondations de l\'innovation régionale. Nous nous engageons à fournir un rapport complet d\'impact RSE dans les 15 jours suivant la clôture.',
      '.contact .btn-primary': 'Nous contacter',
      '.contact-tags': '<span>Logo sur tous les supports</span><span>Stand &amp; Réseautage</span><span>Opportunité de prise de parole</span><span>Accès au recrutement</span><span>Accès au labo R&amp;D</span><span>Plus de 50K impressions</span>',
      '.footer-copy a': 'Confidentialité et Contact',
      '.fuzzy-prize-hint': 'survolez pour voir',
      '.prize-note': 'Le détail des prix sera annoncé le 23 mai lors de l\'ouverture.',
      '.footer-info': 'Universiapolis Laâyoune · 23–24 Mai 2026',
    }
  }
};

function setNodeText(selector, value, useHtml = false) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach(node => {
    if (useHtml) node.innerHTML = value;
    else node.textContent = value;
  });
}

function applyLanguage(lang) {
  const config = i18n[lang] || i18n.en;
  document.documentElement.lang = lang;
  document.title = config.title;

  document.querySelectorAll('.btn-lang').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
  });

  Object.entries(config.map).forEach(([selector, text]) => {
    const useHtml = text.includes('<');
    setNodeText(selector, text, useHtml);
  });

  runHeroTypewriter(config.heroSubLines);

  const heroCanvas = document.getElementById('hero-prize-fuzzy');
  if (heroCanvas) {
    initFuzzyText(heroCanvas, {
      text: config.heroPrize,
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'Space Mono, monospace',
      gradient: ['#6c63ff', '#00d4aa'],
      baseIntensity: 0.4,
      hoverIntensity: 0.05,
      fuzzRange: 10,
      fps: 60,
      glitchMode: true,
      glitchInterval: 3000,
      glitchDuration: 200,
    });
  }

  const ctaCanvas = document.getElementById('cta-prize-fuzzy');
  if (ctaCanvas) {
    initFuzzyText(ctaCanvas, {
      text: config.ctaPrize,
      fontSize: '12px',
      fontWeight: 700,
      fontFamily: 'Space Mono, monospace',
      gradient: ['#6c63ff', '#00d4aa'],
      baseIntensity: 0.4,
      hoverIntensity: 0.05,
      fuzzRange: 8,
      fps: 60,
      glitchMode: true,
      glitchInterval: 2800,
      glitchDuration: 180,
    });
  }
}

// Load saved language preference on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'fr';
  applyLanguage(savedLang);
});

/* =============================================
   FUZZYTEXT ENGINE — Simplified & Robust
============================================= */
function initFuzzyText(canvas, {
  text          = '??? MAD',
  fontSize      = '16px',
  fontWeight    = 900,
  fontFamily    = 'Space Mono, monospace',
  gradient      = ['#6c63ff', '#00d4aa'],
  baseIntensity = 0.4,
  hoverIntensity= 0.05,
  fuzzRange     = 10,
  fps           = 60,
  glitchMode    = true,
  glitchInterval= 2200,
  glitchDuration= 180,
} = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animId;
  let glitchTimer;
  let isHovering = false, isGlitching = false;
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resolveFontPx(fontValue) {
    if (typeof fontValue === 'number') return fontValue;
    if (typeof fontValue === 'string') {
      const parsed = Number.parseFloat(fontValue);
      if (fontValue.includes('px') && !Number.isNaN(parsed)) return parsed;
    }
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.fontSize = String(fontValue || '16px');
    probe.textContent = 'M';
    document.body.appendChild(probe);
    const measured = parseFloat(getComputedStyle(probe).fontSize) || 16;
    probe.remove();
    return measured;
  }

  function build() {
    // 1. Resolve exact pixel size (supports clamp/rem/vw)
    const numPx = resolveFontPx(fontSize);

    const fontStr = `${fontWeight} ${numPx}px ${fontFamily}`;
    ctx.font = fontStr;

    // 2. Measure exactly
    const textWidth = ctx.measureText(text).width || (text.length * numPx * 0.6);
    const hm = fuzzRange + 10;
    const vm = numPx * 0.5;

    // 3. Set CSS and physical canvas size (prevents flex collapse)
    const cssWidth = textWidth + (hm * 2);
    const cssHeight = numPx + (vm * 2);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.style.minWidth = `${cssWidth}px`;
    canvas.width = Math.ceil(cssWidth * dpr);
    canvas.height = Math.ceil(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = fontStr;

    // 4. Glitch timer
    if (glitchMode) {
      glitchTimer = setInterval(() => {
        isGlitching = true;
        setTimeout(() => isGlitching = false, glitchDuration);
      }, glitchInterval);
    }

    let currentI = baseIntensity;
    let lastTime = 0;
    const frameStep = 1000 / Math.max(1, fps);

    function draw(ts = 0) {
      if (ts - lastTime < frameStep) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = ts;
      // Background clear
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Smooth intensity transition
      const target = isGlitching ? 0.9 : (isHovering ? hoverIntensity : baseIntensity);
      currentI += (target - currentI) * 0.2;

      ctx.font = fontStr;
      ctx.textBaseline = 'middle';

      // Create gradient
      const grad = ctx.createLinearGradient(hm, 0, hm + textWidth, 0);
      gradient.forEach((c, i) => grad.addColorStop(i / (Math.max(1, gradient.length - 1)), c));
      
      // Draw multiple jittered layers to simulate "fuzz"
      const layers = 5;
      const centerY = (canvas.height / dpr) / 2;

      // Solid base text for guaranteed visibility
      ctx.fillStyle = grad;
      ctx.globalAlpha = 1;
      ctx.fillText(text, hm, centerY);

      for (let i = 0; i < layers; i++) {
        // Random offset based on intensity
        const dx = (Math.random() - 0.5) * fuzzRange * currentI * 2;
        const dy = (Math.random() - 0.5) * fuzzRange * currentI * 0.5;
        
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.26 / layers;
        
        ctx.fillText(text, hm + dx, centerY + dy);
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(draw);
    }
    draw();

    // Interaction
    canvas.addEventListener('mouseenter', () => isHovering = true);
    canvas.addEventListener('mouseleave', () => isHovering = false);
    canvas.addEventListener('touchstart', () => isHovering = true, {passive: true});
    canvas.addEventListener('touchend', () => isHovering = false);
  }

  // Force build immediately
  build();

  return () => {
    cancelAnimationFrame(animId);
    if (glitchTimer) clearInterval(glitchTimer);
  };
}

/* ── Mount prize teaser ── */
document.addEventListener('DOMContentLoaded', () => {
  const prizeFuzzyCanvas = document.getElementById('prize-fuzzy');
  if (prizeFuzzyCanvas) {
    initFuzzyText(prizeFuzzyCanvas, {
      text:           '??? MAD',
      fontSize:       'clamp(1.2rem, 3.5vw, 1.8rem)',
      fontWeight:     900,
      fontFamily:     'Space Mono, monospace',
      gradient:       ['#6c63ff', '#00d4aa', '#ff6baf'],
      baseIntensity:  0.58,
      hoverIntensity: 0.07,
      fuzzRange:      30,
      fps:            60,
      direction:      'horizontal',
      glitchMode:     true,
      glitchInterval: 2400,
      glitchDuration: 160,
      clickEffect:    true,
    });
  }
  const heroPrizeFuzzy = document.getElementById('hero-prize-fuzzy');
  if (heroPrizeFuzzy) {
    initFuzzyText(heroPrizeFuzzy, {
      text:           'Prizes Revealed Soon',
      fontSize:       '14px',
      fontWeight:     700,
      fontFamily:     'Space Mono, monospace',
      gradient:       ['#6c63ff', '#00d4aa'],
      baseIntensity:  0.4,
      hoverIntensity: 0.05,
      fuzzRange:      10,
      fps:            60,
      direction:      'horizontal',
      glitchMode:     true,
      glitchInterval: 3000,
      glitchDuration: 200,
      clickEffect:    true,
    });
  }

  const ctaPrizeFuzzy = document.getElementById('cta-prize-fuzzy');
  if (ctaPrizeFuzzy) {
    initFuzzyText(ctaPrizeFuzzy, {
      text:           'Prizes Soon',
      fontSize:       '12px',
      fontWeight:     700,
      fontFamily:     'Space Mono, monospace',
      gradient:       ['#6c63ff', '#00d4aa'],
      baseIntensity:  0.4,
      hoverIntensity: 0.05,
      fuzzRange:      8,
      fps:            60,
      direction:      'horizontal',
      glitchMode:     true,
      glitchInterval: 2800,
      glitchDuration: 180,
      clickEffect:    true,
    });
  }
});
