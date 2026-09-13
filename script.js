/* =====================================================
   ImmunoHuman Research — site interactions
===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('done'), 400);
  });
  // Fallback in case 'load' is slow / already fired
  setTimeout(() => document.getElementById('loader')?.classList.add('done'), 2500);

  /* ---------- Nav scroll state + mobile toggle ---------- */
  const nav = document.getElementById('siteNav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), (i % 4) * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* =====================================================
     DNA HELIX — hero canvas animation
  ===================================================== */
  const canvas = document.getElementById('dnaCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  const strandColorA = '#2E9C9C';
  const strandColorB = '#C9A24B';
  const rungColor = 'rgba(111,169,108,0.55)';

  function resizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth = canvas.parentElement.offsetWidth;
    H = canvas.clientHeight = canvas.parentElement.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;
  const NODES = 26;

  function drawHelix() {
    ctx.clearRect(0, 0, W, H);

    // helix runs diagonally across the hero, right-of-center
    const originX = W * 0.72;
    const spanY = H * 1.25;
    const startY = -H * 0.1;
    const amplitude = Math.min(W * 0.13, 150);
    const wavelength = spanY / 3.1;

    const pointsA = [];
    const pointsB = [];

    for (let i = 0; i <= NODES; i++) {
      const y = startY + (spanY / NODES) * i;
      const phase = (y / wavelength) * Math.PI * 2 + t;
      const xA = originX + Math.sin(phase) * amplitude;
      const xB = originX + Math.sin(phase + Math.PI) * amplitude;
      const depth = (Math.sin(phase) + 1) / 2; // 0..1 for pseudo depth
      pointsA.push({ x: xA, y, depth });
      pointsB.push({ x: xB, y, depth: 1 - depth });
    }

    // rungs (base pairs) first, behind strands
    for (let i = 0; i < pointsA.length; i += 1) {
      if (i % 2 !== 0) continue;
      const a = pointsA[i], b = pointsB[i];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = rungColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // nucleotide dots
      [a, b].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + p.depth * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,75,${0.25 + p.depth * 0.5})`;
        ctx.fill();
      });
    }

    drawStrand(pointsA, strandColorA);
    drawStrand(pointsB, strandColorB);
  }

  function drawStrand(points, color) {
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const midX = (prev.x + p.x) / 2;
        const midY = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function animate() {
    t += 0.006;
    drawHelix();
    if (!reduceMotion) requestAnimationFrame(animate);
  }
  if (reduceMotion) {
    drawHelix();
  } else {
    requestAnimationFrame(animate);
  }

  /* =====================================================
     HELIX SPINE — decorative divider between hero & about
  ===================================================== */
  const spineSvg = document.getElementById('spineSvg');
  const pathA = document.getElementById('spinePathA');
  const pathB = document.getElementById('spinePathB');
  const rungsG = document.getElementById('spineRungs');

  function buildSpine() {
    // Coordinates match the SVG's own viewBox (0 0 100 200) exactly,
    // so no non-uniform CSS scaling ever distorts or shrinks the helix.
    const H_ = 200, steps = 24, amp = 30, mid = 50;
    let dA = '', dB = '';
    rungsG.innerHTML = '';
    for (let i = 0; i <= steps; i++) {
      const y = (H_ / steps) * i;
      const phase = (i / steps) * Math.PI * 4;
      const xA = mid + Math.sin(phase) * amp;
      const xB = mid + Math.sin(phase + Math.PI) * amp;
      dA += (i === 0 ? 'M' : 'L') + xA.toFixed(1) + ',' + y.toFixed(1) + ' ';
      dB += (i === 0 ? 'M' : 'L') + xB.toFixed(1) + ',' + y.toFixed(1) + ' ';
      if (i % 2 === 0) {
        const a = { x: xA, y };
        const b = { x: xB, y };
        [a, b].forEach((p, k) => {
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', p.x);
          c.setAttribute('cy', p.y);
          c.setAttribute('r', 4);
          c.dataset.index = i * 2 + k;
          rungsG.appendChild(c);
        });
        // connecting rung between the two strands at this step
        const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rung.setAttribute('x1', a.x); rung.setAttribute('y1', a.y);
        rung.setAttribute('x2', b.x); rung.setAttribute('y2', b.y);
        rung.setAttribute('stroke', 'rgba(15,42,67,0.18)');
        rung.setAttribute('stroke-width', '1');
        rungsG.appendChild(rung);
      }
    }
    pathA.setAttribute('d', dA);
    pathB.setAttribute('d', dB);
  }
  buildSpine();

  const spineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circles = Array.from(rungsG.querySelectorAll('circle'));
        circles.forEach((c, idx) => {
          setTimeout(() => c.classList.add('lit'), idx * 70);
        });
      }
    });
  }, { threshold: 0.4 });
  spineObserver.observe(document.querySelector('.spine-wrap'));

  /* =====================================================
     SPECIALITIES — data + expandable cards
  ===================================================== */
  const specialities = [
    {
      name: 'Cardiology',
      def: 'The branch of medicine dealing with disorders of the heart and blood vessels.',
      more: 'Our cardiology trials evaluate new therapies for heart failure, arrhythmia, hypertension and coronary artery disease — helping bring safer treatments to a condition that remains a leading cause of illness worldwide.',
      icon: '<path d="M24 42s-16-9.6-16-21A9 9 0 0 1 24 14a9 9 0 0 1 16 7c0 11.4-16 21-16 21Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 27h6l3-6 4 10 3-6h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
    },
    {
      name: 'Neurology',
      def: 'The study and treatment of disorders of the brain, spinal cord and nervous system.',
      more: 'From epilepsy and migraine to stroke recovery and neurodegenerative disease, our neurology studies demand precise, long-horizon monitoring — exactly the discipline our data management is built for.',
      icon: '<path d="M24 6c-6 0-9 4-9 8 0 3-2 4-2 7s2 4 2 6c0 5 4 9 9 9s9-4 9-9c0-2 2-3 2-6s-2-4-2-7c0-4-3-8-9-8Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 16c2 1 2 4 0 6M28 16c-2 1-2 4 0 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    },
    {
      name: 'Oncology',
      def: 'The branch of medicine devoted to the diagnosis and treatment of cancer.',
      more: 'We support trials spanning chemotherapy, targeted therapy and immunotherapy across tumour types — where rigorous safety monitoring and participant welfare matter more than in almost any other field.',
      icon: '<circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4.2 4.2M32.8 32.8 37 37M37 11l-4.2 4.2M15.2 32.8 11 37" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      name: 'Gynaecology',
      def: "The branch of medicine concerned with women's reproductive health.",
      more: 'Our studies in this area cover menstrual and fertility disorders, menopause management and gynaecological cancers, always designed with sensitivity to participant dignity and informed consent.',
      icon: '<circle cx="24" cy="18" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 28v14M17 38h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
    },
    {
      name: 'Dermatology',
      def: 'The branch of medicine dealing with the skin, hair and nails.',
      more: 'Trials here evaluate treatments for psoriasis, eczema, acne and skin cancers — conditions that are highly visible to patients and deserve treatments proven both safe and effective.',
      icon: '<path d="M24 6C14 14 10 22 10 28a14 14 0 0 0 28 0c0-6-4-14-14-22Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 18c-4 4-5 8-5 11a5 5 0 0 0 10 0c0-3-1-7-5-11Z" fill="none" stroke="currentColor" stroke-width="1.8"/>'
    },
    {
      name: 'Gastrointestinal',
      def: 'The field concerned with disorders of the digestive system.',
      more: 'We support research into IBD, IBS, liver disease and GERD, among others — conditions where quality of life is often as important an endpoint as clinical measurements.',
      icon: '<path d="M18 6c0 6-8 6-8 14a14 14 0 0 0 28 0c0-6-6-8-6-14M14 20a10 10 0 0 0 20 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      name: 'Immuno Therapy',
      def: 'Treatments that harness or modulate the immune system to fight disease.',
      more: 'Immunotherapy sits at the heart of our name and our focus — from autoimmune conditions to cancer, we run trials that study how the body\u2019s own defences can be directed toward healing.',
      icon: '<path d="M24 4 6 12v10c0 12 8 19.6 18 22 10-2.4 18-10 18-22V12L24 4Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="22" r="6" fill="none" stroke="currentColor" stroke-width="2"/>'
    },
    {
      name: 'Medical Devices',
      def: 'Clinical evaluation of diagnostic and therapeutic devices, implants and wearables.',
      more: 'We assess device safety and performance under real clinical conditions, generating the evidence regulators and hospitals need before a device reaches everyday patient care.',
      icon: '<rect x="14" y="8" width="20" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M18 18h12M18 24h12M18 30h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      name: 'And Other Related Diseases',
      def: 'Additional therapeutic areas taken on as research needs and partnerships evolve.',
      more: 'Beyond our core specialities, our team is equipped to design and manage trials in infectious disease, endocrinology, respiratory illness and other emerging areas of clinical need.',
      icon: '<circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 15v18M15 24h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
    }
  ];

  const specGrid = document.getElementById('specGrid');
  specialities.forEach((s, i) => {
    const card = document.createElement('article');
    card.className = 'spec-card reveal';
    card.innerHTML = `
      <span class="spec-toggle" aria-hidden="true">+</span>
      <div class="spec-icon"><svg viewBox="0 0 48 48">${s.icon}</svg></div>
      <h3>${s.name}</h3>
      <p class="spec-def">${s.def}</p>
      <p class="spec-more">${s.more}</p>
    `;
    card.addEventListener('click', () => card.classList.toggle('active'));
    specGrid.appendChild(card);
    revealObserver.observe(card);
  });

  /* =====================================================
     PHASE LINE fill on scroll into view
  ===================================================== */
  const phaseFill = document.getElementById('phaseLineFill');
  const phaseTrack = document.getElementById('phaseTrack');
  if (phaseFill && phaseTrack) {
    const phaseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          phaseFill.style.width = '100%';
          phaseObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    phaseObserver.observe(phaseTrack);
  }

  /* =====================================================
     CONTACT FORM — posts to Python backend (app.py)
     Falls back to a friendly local confirmation if the
     backend isn't running (e.g. static file preview).
  ===================================================== */
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    form.classList.add('loading');
    submitBtn.disabled = true;
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('bad-status');
      statusEl.textContent = 'Thank you — your message has been sent. Our team will get back to you shortly.';
      statusEl.classList.add('ok');
      form.reset();
    } catch (err) {
      // Backend not reachable (e.g. opening index.html directly).
      statusEl.textContent = 'Message captured locally. Run app.py to enable live email delivery — see README.';
      statusEl.classList.add('err');
    } finally {
      form.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

});
