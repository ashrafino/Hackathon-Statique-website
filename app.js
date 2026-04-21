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
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
    document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when any link is clicked
  navLinksContainer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('open');
      document.body.style.overflow = '';
    });
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
(function() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const lines = [
    '48 hours of non-stop creation. AI as the tool.',
    'Innovation as the goal. Laâyoune as the playground.'
  ];
  const full = lines.join('\n');
  el.textContent = '';
  el.style.whiteSpace = 'pre-line';
  let i = 0;
  function type() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i++;
      setTimeout(type, 28);
    }
  }
  setTimeout(type, 900);
})();

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
  // Remove active class from all language buttons
  document.querySelectorAll('.btn-lang').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to the clicked button
  event.target.classList.add('active');
  
  // Store language preference
  localStorage.setItem('language', lang);
  
  // TODO: Implement actual language switching logic here
  // For now, just update the active state
  if (lang === 'fr') {
    // French translation logic will go here
    console.log('Switched to French');
  } else {
    // English is default
    console.log('Switched to English');
  }
}

// Load saved language preference on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'en';
  const langButtons = document.querySelectorAll('.btn-lang');
  langButtons.forEach(btn => {
    if (btn.textContent.toLowerCase() === savedLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
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
