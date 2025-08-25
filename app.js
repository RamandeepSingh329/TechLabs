/* =============================================
   Animated Resume · App JS
   Requires: GSAP + ScrollTrigger
   ============================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ====== Theme Toggle with persistence
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const saved = localStorage.getItem('theme') || 'dark';
  if(saved === 'light') root.setAttribute('data-theme', 'light');
  themeBtn?.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
    themeBtn.innerHTML = isLight ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-clear-line"></i>';
  });

  // ====== Smooth anchor focus (a11y)
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id && id !== '#' ? $(id) : null;
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); el.tabIndex = -1; el.focus({preventScroll:true}); setTimeout(() => el.removeAttribute('tabindex'), 500); }
  }));

  // ====== Counters
  const counters = $$('[data-count]');
  const obs = new IntersectionObserver((entries, io) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target; const target = +el.dataset.count; let cur = 0; const dur = 1000; const start = performance.now();
      const step = (t) => {
        const p = Math.min((t - start) / dur, 1); cur = Math.floor(p * target); el.textContent = cur.toString(); if(p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step); io.unobserve(el);
    });
  }, {threshold: .5});
  counters.forEach(el => obs.observe(el));

  // ====== GSAP
  if(window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    // Global defaults
    gsap.defaults({ ease: 'power2.out', duration: .8 });

    // Reveal on scroll
    $$('[data-reveal]').forEach((el, i) => {
      gsap.fromTo(el, {opacity:0, y:16}, {opacity:1, y:0, delay: i * 0.02, scrollTrigger:{ trigger: el, start:'top 85%' }});
    });

    // Hero parallax
    const heroImg = $('.avatar-card img');
    if(heroImg){
      gsap.to(heroImg, { yPercent: 8, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }});
    }

    // Timeline line glow on progress
    const tlLine = $('.timeline');
    if(tlLine){
      const glow = document.createElement('div');
      glow.className = 'line-glow';
      tlLine.appendChild(glow);
      Object.assign(glow.style, { position:'absolute', left:'-2px', top:0, width:'4px', height:'0%', background:'linear-gradient(180deg, var(--brand), transparent)', filter:'blur(2px)' });
      gsap.to(glow, { height: '100%', ease:'none', scrollTrigger:{ trigger: tlLine, start:'top 80%', end:'bottom 20%', scrub:true }});
    }

    // Projects stagger pop
    const cards = $$('.p-card');
    if(cards.length){
      gsap.from(cards, { y: 24, opacity:0, stagger:.1, scrollTrigger:{ trigger:'#projects', start:'top 75%' }});
    }
  }

  // ====== 3D Tilt (pointer based)
  const tilts = $$('.tilt');
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
  tilts.forEach(card => {
    let bounds;
    const reset = () => { card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'; }
    const onMove = (e) => {
      bounds = bounds || card.getBoundingClientRect();
      const x = e.clientX - bounds.left; const y = e.clientY - bounds.top;
      const rx = clamp(((y / bounds.height) - .5) * -14, -14, 14);
      const ry = clamp(((x / bounds.width) - .5) * 14, -14, 14);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', () => { bounds = null; reset(); });
    reset();
  });

  // ====== Magnetic buttons
  const magnets = $$('.magnet');
  magnets.forEach(btn => {
    let r; const s = 12; // strength
    btn.addEventListener('pointermove', (e) => {
      r = r || btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      btn.style.transform = `translate(${x/s}px, ${y/s}px)`;
    });
    btn.addEventListener('pointerleave', () => { r = null; btn.style.transform = 'translate(0,0)'; });
  });

  // ====== Infinite marquee (CSS-driven fallback, JS duplicates for length)
  const marquee = $('[data-marquee]');
  if(marquee){ marquee.innerHTML += marquee.innerHTML; }

  // ====== Scramble headline effect
  const scramble = $('[data-scramble]');
  if(scramble){
    const chars = '!<>-_/:~;[]{}—=+*^?#________';
    const text = scramble.textContent.trim();
    let frame = 0; let queue = [];
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const update = () => {
      let output = ''; let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end, char } = queue[i];
        if (frame >= end) { complete++; output += to; }
        else if (frame >= start) { if (!char || Math.random() < 0.28) queue[i].char = randomChar(); output += `<span aria-hidden="true">${queue[i].char}</span>`; }
        else { output += from; }
      }
      scramble.innerHTML = output;
      if (complete === queue.length) return; frame++; requestAnimationFrame(update);
    };
    const setText = (newText) => {
      const oldText = text;
      const length = Math.max(oldText.length, newText.length);
      queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        queue.push({ from, to, start, end, char:'' });
      }
      frame = 0; update();
    };
    // trigger once on load (keeps same text but animates)
    setText(text);
  }

  // ====== Fake form submit
  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', () => {
    const status = document.getElementById('formStatus');
    status.textContent = 'Thanks! I\'ll get back to you within 24 hours.';
    setTimeout(() => status.textContent = '', 3000);
  });

  // Footer year
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
})();
