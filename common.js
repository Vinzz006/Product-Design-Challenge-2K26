// =========================================================
// Product Design Challenge '26 — shared page behavior
// =========================================================

// ---- anime.js modules used across this site ----
// (anime.min.js is loaded as a UMD bundle so these are pulled off the
// global namespace rather than via `import`, which keeps the site
// openable directly from disk with no build step or local server.)
const { animate, stagger, createTimeline, createDraggable, utils } = (typeof anime !== 'undefined') ? anime : {};
const hasAnimeLib = typeof animate === 'function';

// ---- loader ----
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 700);
});

// ---- mobile menu ----
(function initMobileMenu(){
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burger || !mobileMenu) return;
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.style.display === 'block';
    if (isOpen){
      mobileMenu.style.display = 'none';
      burger.setAttribute('aria-expanded', 'false');
      return;
    }
    mobileMenu.style.display = 'block';
    burger.setAttribute('aria-expanded', 'true');
    if (hasAnimeLib){
      animate(mobileMenu.querySelectorAll('a'), {
        opacity: [0, 1],
        translateX: [16, 0],
        delay: stagger(45),
        duration: 380,
        ease: 'outQuad'
      });
    }
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.style.display = 'none';
    burger.setAttribute('aria-expanded', 'false');
  }));
})();

// ---- header scroll state + progress bar + back-to-top ----
(function initScrollChrome(){
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  function onScroll(){
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 600);
    if (progressBar) {
      const h = document.documentElement;
      const scrollPct = (y / (h.scrollHeight - h.clientHeight)) * 100;
      progressBar.style.width = Math.min(100, Math.max(0, scrollPct)) + '%';
    }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
})();

// ---- scroll reveal (anime.js `animate` + `stagger` modules, IO-triggered) ----
(function initReveal(){
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in'); // CSS fallback / base visibility
      if (hasAnimeLib && !reduceMotion){
        animate(el, {
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.97, 1],
          duration: 750,
          delay: (el.closest('.reveal-stagger') ? (parseInt(getComputedStyle(el).getPropertyValue('--i')) || 0) * 70 : 0),
          ease: 'outExpo'
        });
      }
      io.unobserve(el);
    });
  }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
})();

// ---- floating aurora background blobs (anime.js `animate`, infinite alternate loop) ----
(function initBlobs(){
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length || !hasAnimeLib) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  blobs.forEach((blob, i) => {
    animate(blob, {
      translateX: [() => utils.random(-60, 60), () => utils.random(-60, 60)],
      translateY: [() => utils.random(-50, 50), () => utils.random(-50, 50)],
      scale: [1, 1.15, 1],
      duration: 14000 + i * 3000,
      loop: true,
      alternate: true,
      ease: 'inOutSine'
    });
  });
})();

// ---- magnetic hover on solid buttons (anime.js `animate`, spring-style ease) ----
(function initMagneticButtons(){
  if (!hasAnimeLib || window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn-solid').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.4;
      animate(btn, { translateX: x, translateY: y, duration: 300, ease: 'outQuad' });
    });
    btn.addEventListener('mouseleave', () => {
      animate(btn, { translateX: 0, translateY: 0, duration: 500, ease: 'outElastic(1, .5)' });
    });
  });
})();

// ---- active nav link on scroll (same-page sections only) ----
(function initActiveNav(){
  const navLinks = document.querySelectorAll('nav.links a[href^="#"]');
  if (!navLinks.length) return;
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = document.querySelector('nav.links a[href="' + id + '"]');
      if (!link) return;
      if (entry.isIntersecting){
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin:'-45% 0px -45% 0px' });
  sections.forEach(s => navIO.observe(s));
})();
