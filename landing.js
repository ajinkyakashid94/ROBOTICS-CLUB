/* ═══════════════════════════════════════
   Particle background canvas
═══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticles() {
    particles = [];
    const count = Math.floor(W / 18);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(2, 5),
        dx: rand(-.3, .3), dy: rand(-.5, -.15),
        alpha: rand(.15, .55),
      });
    }
  }
  createParticles();
  window.addEventListener('resize', createParticles);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,33,61,${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════
   Robot eye tracking
═══════════════════════════════════════ */
const pupils = document.querySelectorAll('.pupil');
document.addEventListener('mousemove', e => {
  pupils.forEach(p => {
    const eye = p.parentElement.getBoundingClientRect();
    const cx  = eye.left + eye.width  / 2;
    const cy  = eye.top  + eye.height / 2;
    const a   = Math.atan2(e.clientY - cy, e.clientX - cx);
    const r   = eye.width * 0.2;
    p.style.transform = `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px)`;
  });
});

/* ═══════════════════════════════════════
   Scroll-reveal (IntersectionObserver)
═══════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Hero reveals — run immediately then observe
document.querySelectorAll('.reveal').forEach((el, i) => {
  observer.observe(el);
});

// Stagger track cards and perks
function observeStaggered(selector) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(el);
  });
}
observeStaggered('.track-card');
observeStaggered('.perk');

/* ═══════════════════════════════════════
   Nav bg on scroll
═══════════════════════════════════════ */
const nav = document.querySelector('.top');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 40
    ? 'rgba(238,242,246,.97)'
    : 'rgba(238,242,246,.88)';
});
