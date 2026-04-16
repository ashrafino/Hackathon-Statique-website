// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Scroll-reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.why-card, .orga-card, .sponsor-card, .tl-item, .benefit'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

// Stagger cards
document.querySelectorAll('.why-card, .orga-card, .sponsor-card').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

// Smooth active nav link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

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
