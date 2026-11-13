
(() => {
  'use strict';

  // ==========================================
  // 1. SECTION CONFIGURATION
  // ==========================================

  const ids = [
    'hero',
    'about',
    'services',
    'work',
    'testimonial',
    'aboutus',
    'contact'
  ];

  const panels = ids
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const contactForm = document.getElementById('contactForm');

  let currentIndex = -1;
  let hasNavigatedFromHero = false;
  let isTransitioning = false;
  let transitionTimeout = null;
  let pendingCurrent = null;
  let pendingTarget = null;
  let lenis = null;
  let animationFrame = null;

  // ==========================================
  // 2. LENIS SMOOTH SCROLL
  // ==========================================

  function destroyLenis() {
    if (lenis) {
      try {
        lenis.destroy();
      } catch (error) {
        console.warn('Lenis cleanup error:', error);
      }

      lenis = null;
    }
  }

  function initLenis(activePanel) {
    destroyLenis();

    if (typeof Lenis === 'undefined' || !activePanel) {
      return;
    }

    const content =
      activePanel.querySelector('.panel-inner') || activePanel;

    lenis = new Lenis({
      wrapper: activePanel,
      content: content,
      duration: 1.15,
      easing: t =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5
    });
  }

  function raf(time) {
    if (lenis) {
      lenis.raf(time);
    }

    animationFrame = requestAnimationFrame(raf);
  }

  animationFrame = requestAnimationFrame(raf);

  // ==========================================
  // 3. HEADER AND NAVIGATION SYNCHRONIZATION
  // ==========================================

  function syncUI(index, options = {}) {
    const {
      historyMode = 'replace',
      hash = true
    } = options;

    document.body.classList.toggle(
      'start-here-visible',
      index === 0
    );

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle(
        'active',
        item.dataset.section === ids[index]
      );
    });

    if (hash) {
      const targetHash =
        index === 0 ? '' : '#' + ids[index];

      const newUrl =
        targetHash ||
        location.pathname + location.search;

      if (historyMode === 'push') {
        history.pushState(
          { section: ids[index] },
          '',
          newUrl
        );
      } else {
        history.replaceState(
          { section: ids[index] },
          '',
          newUrl
        );
      }
    }
  }

  // ==========================================
  // 4. FINISH SECTION TRANSITION
  // ==========================================

  function finalizeTransition() {
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    if (pendingCurrent) {
      pendingCurrent.classList.remove('active');
      pendingCurrent.style.display = 'none';
      pendingCurrent.style.visibility = 'hidden';
      pendingCurrent.style.transition = 'none';
      pendingCurrent.style.transform = '';
      pendingCurrent.scrollTop = 0;
      pendingCurrent.setAttribute('aria-hidden', 'true');
    }

    if (pendingTarget) {
      pendingTarget.classList.add('active');
      pendingTarget.style.display = 'block';
      pendingTarget.style.visibility = 'visible';
      pendingTarget.style.transition = 'none';
      pendingTarget.style.transform = '';
      pendingTarget.style.zIndex = '2';
      pendingTarget.scrollTop = 0;
      pendingTarget.setAttribute('aria-hidden', 'false');

      initLenis(pendingTarget);
    }

    panels.forEach((panel, index) => {
      if (index !== currentIndex) {
        panel.classList.remove('active');
        panel.style.display = 'none';
        panel.style.visibility = 'hidden';
        panel.style.transition = 'none';
        panel.style.transform = '';
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    isTransitioning = false;
    pendingCurrent = null;
    pendingTarget = null;
  }

  // ==========================================
  // ABOUT US TEAM LANYARD RAIL & PHYSICS ENGINE
  // ==========================================

  const TEAM_LANYARD_MEMBERS = [
    {
      id: "gowrinath",
      name: "Gowrinath",
      role: "Lead Developer & UI Architect",
      team: "SKETCHERZ · CORE",
      tone: 1,
      drop: 8,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio: "Architects fluid interactions, motion systems, and frontend repositories.",
      tags: ["React", "Motion", "UI/UX"]
    },
    {
      id: "harikrishna",
      name: "Hari Krishna",
      role: "Full Stack Engineer",
      team: "SKETCHERZ · SYSTEMS",
      tone: 2,
      drop: 22,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Builds backend microservices, GST billing engines, and scalable database logic.",
      tags: ["Node.js", "MySQL", "APIs"]
    },
    {
      id: "titu",
      name: "Titu",
      role: "Creative Direction & UI/UX",
      team: "SKETCHERZ · DESIGN",
      tone: 3,
      drop: 2,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      bio: "Crafts design systems, responsive hierarchies, and unmistakable brand identities.",
      tags: ["Figma", "Design", "Brand"]
    },
    {
      id: "karthik",
      name: "Karthik R.",
      role: "Motion Graphics & 3D",
      team: "SKETCHERZ · MOTION",
      tone: 4,
      drop: 16,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bio: "Engineers WebGL scenes, SVG choreography, and dynamic page transitions.",
      tags: ["Three.js", "WebGL", "SVG"]
    },
    {
      id: "priya",
      name: "Priya S.",
      role: "Frontend Developer",
      team: "SKETCHERZ · WEB",
      tone: 5,
      drop: 24,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      bio: "Turns complex interface concepts into accessible, sub-second web components.",
      tags: ["JS", "CSS Grid", "A11y"]
    },
    {
      id: "dinesh",
      name: "Dinesh K.",
      role: "Performance & SEO Engineer",
      team: "SKETCHERZ · GROWTH",
      tone: 2,
      drop: 6,
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
      bio: "Optimizes Core Web Vitals, search indexing, and 95+ Lighthouse audit scores.",
      tags: ["SEO", "Next.js", "Vitals"]
    },
    {
      id: "sneha",
      name: "Sneha M.",
      role: "QA & Automation",
      team: "SKETCHERZ · QUALITY",
      tone: 1,
      drop: 18,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      bio: "Guarantees bug-free launches, test automation pipelines, and cross-device polish.",
      tags: ["Cypress", "Testing", "QA"]
    },
    {
      id: "manoj",
      name: "Manoj V.",
      role: "DevOps & Cloud Systems",
      team: "SKETCHERZ · CLOUD",
      tone: 3,
      drop: 10,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      bio: "Manages continuous deployment pipelines, edge CDN caching, and cloud infrastructure.",
      tags: ["Cloudflare", "CI/CD", "Docker"]
    }
  ];

  function initAboutUsMotion() {
    const stage = document.getElementById("lanyardStage");
    const slotsWrap = document.getElementById("lanyardSlots");
    const dotsWrap = document.getElementById("lanyardDots");
    const titleEl = document.getElementById("lanyardActiveTitle");
    const hintEl = document.getElementById("lanyardActiveHint");
    if (!stage || !slotsWrap) return;
    if (slotsWrap.dataset.ready) {
      if (typeof window._recomputeLanyard === "function") {
        window._recomputeLanyard();
      }
      return;
    }
    slotsWrap.dataset.ready = "true";

    const count = TEAM_LANYARD_MEMBERS.length;
    const BADGE_W = 132;
    let activeIndex = 0;
    let flippedIndex = -1;
    let isCarousel = window.innerWidth <= 960;
    let dragStartX = 0;
    let swipeOffset = 0;
    let isDragging = false;

    // Physics state per badge
    const state = TEAM_LANYARD_MEMBERS.map((_, i) => ({
      x: 0,
      tx: 0,
      angle: (i % 2 === 0 ? -1.4 : 1.4),
      vel: 0,
      pull: 0
    }));

    // Build DOM slots & dots
    const slotEls = [];
    const swingEls = [];
    const btnEls = [];
    const dotEls = [];

    TEAM_LANYARD_MEMBERS.forEach((m, i) => {
      const strapLen = 42 + (m.drop || 0);
      const reelTop = 22 + strapLen;
      const cordTop = reelTop + 20;
      const clipTop = cordTop + 12;
      const cardTop = clipTop + 8;

      const slot = document.createElement("div");
      slot.className = `lanyard-slot tone-${m.tone || ((i % 5) + 1)}`;
      slot.innerHTML = `
        <span class="lanyard-ring" aria-hidden="true"></span>
        <span class="lanyard-swing">
          <span class="lanyard-strap" style="height:${strapLen}px"></span>
          <span class="lanyard-reel" style="top:${reelTop}px"></span>
          <span class="lanyard-cord" style="top:${cordTop}px"></span>
          <span class="lanyard-clip" style="top:${clipTop}px"></span>
          <button type="button" class="badge-btn" style="top:${cardTop}px" data-idx="${i}" data-flipped="false" aria-label="${m.name}, ${m.role}">
            <span class="badge-flipper">
              <span class="badge-face front">
                <span class="badge-band"></span>
                <span class="badge-hole"></span>
                <span class="badge-avatar"><img src="${m.image}" alt="${m.name}" loading="lazy" /></span>
                <span class="badge-name">${m.name}</span>
                <span class="badge-role">${m.role}</span>
                <span class="badge-team">${m.team || "CODE SKETCHERZ"}</span>
                <span class="badge-barcode">|||| || | |||| |||</span>
              </span>
              <span class="badge-face back">
                <span class="badge-band"></span>
                <span class="badge-hole"></span>
                <span class="badge-back-name">${m.name}</span>
                <span class="badge-back-role">${m.role}</span>
                <span class="badge-bio">${m.bio || ""}</span>
                <span class="badge-tags">${(m.tags || []).map(t => `<span>${t}</span>`).join("")}</span>
              </span>
            </span>
          </button>
        </span>
      `;
      slotsWrap.appendChild(slot);
      slotEls.push(slot);
      swingEls.push(slot.querySelector(".lanyard-swing"));
      const btn = slot.querySelector(".badge-btn");
      btnEls.push(btn);

      // Click to flip badge
      btn.addEventListener("click", () => {
        if (Math.abs(swipeOffset) > 10) return;
        flippedIndex = flippedIndex === i ? -1 : i;
        activeIndex = i;
        state[i].vel += (i % 2 === 0 ? 14 : -14);
        updateCaption();
        syncFlipStates();
      });

      // Hover impulse
      btn.addEventListener("mouseenter", () => {
        if (!isCarousel) {
          activeIndex = i;
          state[i].vel += (Math.random() > 0.5 ? 12 : -12);
          updateCaption();
          syncZIndex();
        }
      });

      // Dot button for tablet/mobile
      if (dotsWrap) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "lanyard-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", `Show ${m.name}`);
        dot.addEventListener("click", () => {
          activeIndex = i;
          flippedIndex = -1;
          state[i].vel += 10;
          syncFlipStates();
          updateCaption();
          computeTargets();
        });
        dotsWrap.appendChild(dot);
        dotEls.push(dot);
      }
    });

    function syncFlipStates() {
      btnEls.forEach((b, idx) => {
        b.dataset.flipped = flippedIndex === idx ? "true" : "false";
      });
      syncZIndex();
    }

    function syncZIndex() {
      slotEls.forEach((s, idx) => {
        s.style.zIndex = idx === flippedIndex ? "40" : idx === activeIndex ? "30" : String(10 + idx);
      });
      dotEls.forEach((d, idx) => d.classList.toggle("active", idx === activeIndex));
    }

    function updateCaption() {
      const m = TEAM_LANYARD_MEMBERS[activeIndex];
      if (!m || !titleEl || !hintEl) return;
      titleEl.textContent = `${m.name} — ${m.role}`;
      hintEl.textContent = flippedIndex === activeIndex
        ? "Tap badge again to turn back to photo"
        : "Tap badge to flip for bio & tech stack";
    }

    function computeTargets() {
      const W = stage.clientWidth || stage.parentElement?.clientWidth || window.innerWidth;
      isCarousel = W <= 960;
      if (!isCarousel) {
        const usable = W - 64;
        const pitch = usable / Math.max(1, count);
        const start = (W - pitch * (count - 1)) / 2;
        state.forEach((st, i) => {
          st.tx = start + i * pitch;
        });
      } else {
        const pitch = W < 540 ? 156 : 168;
        state.forEach((st, i) => {
          let diff = i - activeIndex;
          if (diff > count / 2) diff -= count;
          if (diff < -count / 2) diff += count;
          st.tx = W / 2 + diff * pitch + swipeOffset;
        });
      }
      syncZIndex();
    }

    window._recomputeLanyard = () => {
      computeTargets();
    };

    // Touch & Mouse Horizontal Swipe on Mobile/Tablet
    stage.addEventListener("pointerdown", (e) => {
      if (!isCarousel) return;
      isDragging = true;
      dragStartX = e.clientX;
      swipeOffset = 0;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isDragging || !isCarousel) return;
      swipeOffset = e.clientX - dragStartX;
      computeTargets();
    });

    window.addEventListener("pointerup", () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(swipeOffset) > 36) {
        const dir = swipeOffset < 0 ? 1 : -1;
        activeIndex = (activeIndex + dir + count) % count;
        flippedIndex = -1;
        state[activeIndex].vel += dir * -14;
        syncFlipStates();
        updateCaption();
      }
      swipeOffset = 0;
      computeTargets();
    });

    window.addEventListener("resize", computeTargets);
    computeTargets();
    state.forEach(st => { st.x = st.tx; });
    updateCaption();

    // Spring Physics Loop
    let lastT = performance.now();
    function animateRail(now) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      state.forEach((st, i) => {
        const prevX = st.x;
        st.x += (st.tx - st.x) * Math.min(1, dt * 11);
        const dx = (st.x - prevX) / Math.max(0.008, dt);

        // Pendulum spring
        st.vel += (-26 * st.angle - 2.4 * st.vel - dx * 0.035) * dt;
        st.angle = Math.max(-18, Math.min(18, st.angle + st.vel * dt));

        slotEls[i].style.transform = `translate3d(${(st.x - BADGE_W / 2).toFixed(2)}px, 0, 0)`;
        swingEls[i].style.transform = `rotate(${st.angle.toFixed(2)}deg)`;
      });

      requestAnimationFrame(animateRail);
    }
    requestAnimationFrame(animateRail);
  }

  // ==========================================
  // 5. OPEN SECTION
  // ==========================================

  function goToSection(to, options = {}) {
    const {
      historyMode = 'replace',
      hash = true
    } = options;

    const targetIndex =
      typeof to === 'number' ? to : ids.indexOf(to);

    if (
      targetIndex < 0 ||
      targetIndex >= ids.length ||
      !panels[targetIndex]
    ) {
      return;
    }

    if (
      currentIndex === targetIndex &&
      !isTransitioning &&
      panels[targetIndex].classList.contains('active')
    ) {
      return;
    }

    const targetId = ids[targetIndex];

    // First page load
    if (currentIndex === -1) {
      currentIndex = targetIndex;

      panels.forEach((panel, index) => {
        const active = index === targetIndex;

        panel.classList.toggle('active', active);
        panel.style.display = active ? 'block' : 'none';
        panel.style.visibility = active ? 'visible' : 'hidden';
        panel.style.transform = '';
        panel.style.transition = '';

        panel.setAttribute('aria-hidden', String(!active));

        if (active) {
          panel.scrollTop = 0;
          initLenis(panel);
        }
      });

      syncUI(targetIndex, { historyMode, hash });
      if (targetId === 'aboutus') {
        initAboutUsMotion();
      }
      return;
    }

    // Complete previous animation before starting another
    if (isTransitioning) {
      finalizeTransition();
    }

    const currentPanel = panels[currentIndex];
    const targetPanel = panels[targetIndex];

    const isForward = targetIndex > currentIndex;

    currentIndex = targetIndex;

    syncUI(targetIndex, { historyMode, hash });

    if (targetId === 'aboutus') {
      initAboutUsMotion();
    }

    // Instant transition fallback
    function instantSwitch() {
      destroyLenis();

      panels.forEach((panel, index) => {
        const active = index === targetIndex;

        panel.classList.toggle('active', active);
        panel.style.display = active ? 'block' : 'none';
        panel.style.visibility = active ? 'visible' : 'hidden';
        panel.style.transform = '';
        panel.style.transition = '';

        panel.setAttribute('aria-hidden', String(!active));

        if (active) {
          panel.scrollTop = 0;
          initLenis(panel);
        }
      });

      if (targetId === 'aboutus') {
        initAboutUsMotion();
      }

      isTransitioning = false;
      pendingCurrent = null;
      pendingTarget = null;
    }

    if (!currentPanel || !targetPanel) {
      instantSwitch();
      return;
    }

    // Reduced motion accessibility
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      instantSwitch();
      return;
    }

    destroyLenis();

    isTransitioning = true;

    pendingCurrent = currentPanel;
    pendingTarget = targetPanel;

    const targetStart = isForward
      ? 'translateY(100%)'
      : 'translateY(-100%)';

    const currentEnd = isForward
      ? 'translateY(-100%)'
      : 'translateY(100%)';

    // Prepare incoming panel
    targetPanel.classList.remove('active');
    targetPanel.style.display = 'block';
    targetPanel.style.visibility = 'visible';
    targetPanel.style.transition = 'none';
    targetPanel.style.transform = targetStart;
    targetPanel.style.zIndex = '3';
    targetPanel.scrollTop = 0;

    targetPanel.setAttribute('aria-hidden', 'false');

    // Prepare outgoing panel
    currentPanel.style.display = 'block';
    currentPanel.style.visibility = 'visible';
    currentPanel.style.transition = 'none';
    currentPanel.style.transform = 'translateY(0)';
    currentPanel.style.zIndex = '2';

    // Force browser reflow
    void targetPanel.offsetHeight;
    void currentPanel.offsetHeight;

    // Animate both panels together
    const transition =
      'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';

    targetPanel.style.transition = transition;
    currentPanel.style.transition = transition;

    targetPanel.style.transform = 'translateY(0)';
    currentPanel.style.transform = currentEnd;

    transitionTimeout = setTimeout(() => {
      finalizeTransition();
    }, 650);
  }

  // ==========================================
  // 6. NAVIGATION LINKS
  // ==========================================

  document.querySelectorAll('[data-section]').forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();

      const target = element.dataset.section;

      if (!ids.includes(target)) {
        return;
      }

      if (!hasNavigatedFromHero && target !== 'hero') {
        hasNavigatedFromHero = true;

        goToSection(target, {
          historyMode: 'push'
        });
      } else {
        if (target === 'hero') {
          hasNavigatedFromHero = false;
        }

        goToSection(target, {
          historyMode: 'replace'
        });
      }
    });
  });

  // ==========================================
  // 7. NEXT SECTION BUTTONS (SCRAMBLE + LETTER PAINT STROKE)
  // ==========================================

  function initNextSectionTriggers() {
    const glyphs = '01#/<>$%_ABCXYZ';
    const buttons = document.querySelectorAll('.cs-next-trigger');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      const codeEl = btn.querySelector('.tech-code-word');
      const wordEl = btn.querySelector('.brush-paint-word');
      if (!codeEl || !wordEl) return;

      // 1. Split Word 2 into individual animated letter spans
      const rawText = wordEl.dataset.paintWord || wordEl.textContent.trim();
      wordEl.innerHTML = rawText
        .split('')
        .map((char, i) => {
          if (char === ' ') return '<span style="display:inline-block;width:5px;">&nbsp;</span>';
          return `<span class="paint-char" style="--paint-delay: ${i * 0.045}s">${char}</span>`;
        })
        .join('');

      const originalCode = codeEl.dataset.text || 'EXPLORE';
      let isRunning = false;
      let loopTimer = null;
      let scrambleTimer = null;

      // 2. Play Sequence: Word 1 Scramble -> Word 2 Letter-by-Letter Paint Stroke
      function playPaintSequence(speedMultiplier = 1) {
        if (isRunning) return;
        isRunning = true;

        // Reset letters
        btn.classList.remove('is-brushing');
        void wordEl.offsetWidth; // Reflow to reset animation

        // Phase 1: Scramble Word 1
        let iteration = 0;
        clearInterval(scrambleTimer);
        const scrambleSpeed = 30 / speedMultiplier;

        scrambleTimer = setInterval(() => {
          codeEl.textContent = originalCode
            .split('')
            .map((char, index) => {
              if (index < iteration) return originalCode[index];
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join('');

          if (iteration >= originalCode.length) {
            clearInterval(scrambleTimer);
            codeEl.textContent = originalCode;

            // Phase 2: Paint Word 2 Letter-by-Letter
            const chars = wordEl.querySelectorAll('.paint-char');
            chars.forEach((c, idx) => {
              c.style.setProperty('--paint-delay', `${(idx * 0.045) / speedMultiplier}s`);
            });
            btn.classList.add('is-brushing');

            // Phase 3: Settle & Allow Next Cycle
            const totalSweepTime = (chars.length * 45 + 220) / speedMultiplier + 400;
            setTimeout(() => {
              isRunning = false;
            }, totalSweepTime);
          }
          iteration += 0.55 * speedMultiplier;
        }, scrambleSpeed);
      }

      // Automated 2.5s Idle Attract Loop when visible in viewport
      function scheduleNextLoop() {
        clearTimeout(loopTimer);
        loopTimer = setTimeout(() => {
          if (btn._isInView) {
            playPaintSequence(1);
          }
          scheduleNextLoop();
        }, 2800);
      }

      // Viewport Visibility Observer (Works on desktop & mobile)
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            btn._isInView = entry.isIntersecting;
            if (entry.isIntersecting) {
              playPaintSequence(1);
              scheduleNextLoop();
            } else {
              clearTimeout(loopTimer);
              clearInterval(scrambleTimer);
              isRunning = false;
            }
          });
        }, { threshold: 0.35 });
        observer.observe(btn);
      } else {
        btn._isInView = true;
        scheduleNextLoop();
      }

      // User Hover / Direct Touch: Accelerate immediately
      btn.addEventListener('mouseenter', () => {
        clearTimeout(loopTimer);
        playPaintSequence(1.6);
      });

      btn.addEventListener('touchstart', () => {
        clearTimeout(loopTimer);
        playPaintSequence(1.6);
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        scheduleNextLoop();
      });

      // Panel Transition Execution
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.nextTarget;
        if (target && typeof goToSection === 'function') {
          if (!hasNavigatedFromHero && target !== 'hero') {
            hasNavigatedFromHero = true;
          } else if (target === 'hero') {
            hasNavigatedFromHero = false;
          }
          goToSection(target, { historyMode: 'push' });
        }
      });
    });
  }

  // Call on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNextSectionTriggers);
  } else {
    initNextSectionTriggers();
  }

  // ==========================================
  // 8. BROWSER BACK AND FORWARD
  // ==========================================

  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);

    const target = ids.includes(hash)
      ? hash
      : 'hero';

    hasNavigatedFromHero = target !== 'hero';

    goToSection(target, {
      hash: false
    });
  });

  // ==========================================
  // 9. KEYBOARD NAVIGATION
  // ==========================================

  document.addEventListener('keydown', event => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest(
        'input, textarea, select, button, [contenteditable="true"]'
      )
    ) {
      return;
    }

    // Right arrow: next section
    if (event.key === 'ArrowRight') {
      event.preventDefault();

      if (currentIndex < ids.length - 1) {
        if (!hasNavigatedFromHero) {
          hasNavigatedFromHero = true;

          goToSection(currentIndex + 1, {
            historyMode: 'push'
          });
        } else {
          goToSection(currentIndex + 1);
        }
      }

      return;
    }

    // Left arrow: previous section
    if (event.key === 'ArrowLeft') {
      event.preventDefault();

      if (currentIndex > 0) {
        goToSection(currentIndex - 1);
      }

      return;
    }

    const panel = panels[currentIndex];

    if (!panel) {
      return;
    }

    // Down arrow / Page Down
    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown'
    ) {
      const atBottom =
        Math.ceil(
          panel.scrollTop + panel.clientHeight
        ) >= panel.scrollHeight;

      if (atBottom && currentIndex < ids.length - 1) {
        event.preventDefault();

        if (!hasNavigatedFromHero) {
          hasNavigatedFromHero = true;

          goToSection(currentIndex + 1, {
            historyMode: 'push'
          });
        } else {
          goToSection(currentIndex + 1);
        }
      }

      return;
    }

    // Up arrow / Page Up
    if (
      event.key === 'ArrowUp' ||
      event.key === 'PageUp'
    ) {
      const atTop = panel.scrollTop <= 0;

      if (atTop && currentIndex > 0) {
        event.preventDefault();
        goToSection(currentIndex - 1);
      }
    }
  });

  // ==========================================
  // 10. CONTACT FORM
  // ==========================================

  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(contactForm);

      const name = String(
        formData.get('name') || ''
      ).trim();

      const email = String(
        formData.get('email') || ''
      ).trim();

      const message = String(
        formData.get('message') || ''
      ).trim();

      const formNote =
        document.getElementById('formNote');

      // Basic validation
      if (!name || !email || !message) {
        if (formNote) {
          formNote.textContent =
            'Please fill in all the required fields.';
        }

        return;
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        if (formNote) {
          formNote.textContent =
            'Please enter a valid email address.';
        }

        return;
      }

      // Optional project type field
      const project =
        String(formData.get('project') || '').trim();

      const subject = encodeURIComponent(
        'New Studio Enquiry - ' + name
      );

      let body =
        'Hello Code Sketcherz,\n\n' +
        'You have received a new website enquiry.\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n';

      if (project) {
        body += 'Project Type: ' + project + '\n';
      }

      body +=
        '\nMessage:\n' + message +
        '\n\nThank you!';

      const mailto =
        'mailto:hello@codesketcherz.studio' +
        '?subject=' + subject +
        '&body=' + encodeURIComponent(body);

      if (formNote) {
        formNote.textContent =
          'Opening your email application...';
      }

      window.location.href = mailto;
    });
  }

  // ==========================================
  // 10.5. THEME SYSTEM (LIGHT & DARK MODE)
  // ==========================================

  function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const modeIcon = toggleBtn.querySelector('.mode-icon');

    function updateButtonUI(theme) {
      if (modeIcon) {
        modeIcon.textContent = theme === 'dark' ? '\u2600' : '\uD83C\uDF19';
      }
      toggleBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      toggleBtn.setAttribute('title', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateButtonUI(currentTheme);

    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = active === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (err) {
        console.warn('localStorage theme save error:', err);
      }
      updateButtonUI(next);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const sysTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', sysTheme);
          updateButtonUI(sysTheme);
        }
      });
    }
  }

  initTheme();

  // ==========================================
  // 10.6. FOOTER INTERACTION (SMOOTH BACK TO TOP)
  // ==========================================

  function initFooter() {
    document.querySelectorAll('.footer-back-to-top').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const activePanel = document.querySelector('.panel.active');
        if (activePanel) {
          if (typeof lenis !== 'undefined' && lenis) {
            try {
              lenis.scrollTo(0, { duration: 1.2 });
            } catch (err) {
              activePanel.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } else {
            activePanel.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  initFooter();

  // ==========================================
  // 11. INITIAL PAGE LOAD
  // ==========================================

  const initialHash = location.hash.slice(1);

  const startSection = ids.includes(initialHash)
    ? initialHash
    : 'hero';

  hasNavigatedFromHero = startSection !== 'hero';

  goToSection(startSection, {
    hash: false
  });

  // ==========================================
  // 12. CLEANUP
  // ==========================================

  window.addEventListener('pagehide', () => {
    destroyLenis();

    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

})();
