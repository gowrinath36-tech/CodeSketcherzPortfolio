
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
  // IMAGE FAILURE HANDLING
  // Photos fall back once (inline onerror); if that fails too, hide the
  // broken-image glyph so the designed placeholder surface shows instead.
  // ==========================================

  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.closest('.brand, .footer-cs-badge')) return;
    const hasFallback = img.hasAttribute('onerror');
    if (hasFallback && !img.dataset.failedOnce) {
      img.dataset.failedOnce = '1';
      return;
    }
    img.style.visibility = 'hidden';
  }, true);

  // ==========================================
  // 3B. TRANSPARENT HEADER: SCROLL STATE + INK TONE
  // The header never has a background. While a panel scrolls, we only
  // pick the ink colour that stays readable over whatever is beneath it.
  // ==========================================

  function updateHeaderState() {
    const panel = panels[currentIndex];
    if (!panel) return;

    const probeY = 40;
    let tone = '';

    if (panel.scrollTop > 8) {
      const regions = panel.querySelectorAll('.panel-bottom-block, .section-footer');
      regions.forEach(region => {
        const rect = region.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          if (region.classList.contains('section-footer')) {
            tone = 'light';
          } else if (region.classList.contains('block-yellow') || region.matches('.panel.work .panel-bottom-block')) {
            tone = 'ink';
          }
        }
      });
    }

    document.body.classList.toggle('is-scrolled', panel.scrollTop > 8);
    if (tone) {
      document.body.dataset.headerTone = tone;
    } else {
      delete document.body.dataset.headerTone;
    }
  }

  let headerTick = null;
  function onPanelScroll() {
    if (headerTick) return;
    headerTick = requestAnimationFrame(() => {
      headerTick = null;
      updateHeaderState();
    });
  }
  panels.forEach(panel => panel.addEventListener('scroll', onPanelScroll, { passive: true }));
  window.addEventListener('resize', onPanelScroll);

  // ==========================================
  // 3C. MOBILE MENU
  // ==========================================

  const navToggle = document.getElementById('navToggle');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      setMenu(!document.body.classList.contains('menu-open'));
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      if (navToggle) navToggle.focus();
    }
  });

  // Leaving the narrow layout while the menu is open should not strand it open.
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

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
      pendingCurrent.style.opacity = '1';
      pendingCurrent.scrollTop = 0;
      pendingCurrent.setAttribute('aria-hidden', 'true');
    }

    if (pendingTarget) {
      pendingTarget.classList.add('active');
      pendingTarget.style.display = 'block';
      pendingTarget.style.visibility = 'visible';
      pendingTarget.style.transition = 'none';
      pendingTarget.style.transform = '';
      pendingTarget.style.opacity = '1';
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
        panel.style.opacity = '1';
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    isTransitioning = false;
    pendingCurrent = null;
    pendingTarget = null;
    updateHeaderState();
  }

  // ==========================================
  // ABOUT US · SEAMLESS TEAM MARQUEE
  // ==========================================

  const SKETCHERZ_MEMBERS = [
    {
      name: "Gowrinath",
      role: "Lead Developer & UI Architect",
      photo: "Images/about us/member-1.jpg",
      fallback: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
      website: "https://github.com/gowrinath36-tech",
      linkedin: "#"
    },
    {
      name: "Hari Krishna",
      role: "Full Stack Engineer",
      photo: "Images/about us/member-2.jpg",
      fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Titu",
      role: "Creative Direction & UI/UX",
      photo: "Images/about us/member-3.jpg",
      fallback: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Karthik R.",
      role: "Motion Graphics & 3D",
      photo: "Images/about us/member-4.jpg",
      fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Priya S.",
      role: "Frontend Developer",
      photo: "Images/about us/member-5.jpg",
      fallback: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Dinesh K.",
      role: "Performance & SEO Engineer",
      photo: "Images/about us/member-6.jpg",
      fallback: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Sneha M.",
      role: "QA & Automation",
      photo: "Images/about us/member-7.jpg",
      fallback: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      name: "Manoj V.",
      role: "DevOps & Cloud Systems",
      photo: "Images/about us/member-8.jpg",
      fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    }
  ];

  function initAboutUsMotion() {
    const root = document.getElementById("sketcherzGrid");
    if (!root || root.dataset.rendered) return;
    root.dataset.rendered = "true";

    const globeSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    const linkedinSvg = `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.633 13.633h-2.37V9.92c0-.885-.017-2.025-1.234-2.025-1.235 0-1.424.965-1.424 1.96v3.778h-2.37V5.998H8.51v1.043h.031a2.5 2.5 0 0 1 2.246-1.233c2.403 0 2.846 1.58 2.846 3.637zM3.56 4.954a1.376 1.376 0 1 1 0-2.751 1.376 1.376 0 0 1 0 2.751m1.185 8.679H2.372V5.998h2.373zM14.815.001H1.18A1.17 1.17 0 0 0 0 1.154v13.691A1.17 1.17 0 0 0 1.18 16h13.635A1.17 1.17 0 0 0 16 14.845V1.153A1.17 1.17 0 0 0 14.815 0"/></svg>`;

    // One <ul> per copy of the eight members. Copy B exists only for visual continuity:
    // it is aria-hidden + inert, so it adds no accessible content and no tab stops.
    const buildGroup = (isClone) => {
      const ul = document.createElement("ul");
      ul.className = "sk-group";
      ul.setAttribute("role", "list");
      if (isClone) {
        ul.setAttribute("aria-hidden", "true");
        ul.setAttribute("inert", "");
      }
      ul.innerHTML = SKETCHERZ_MEMBERS.map(m => `
        <li class="sk-card">
          <div class="sk-portrait">
            <img src="${m.photo}" data-fallback="${m.fallback}" alt="${isClone ? "" : m.name}" width="600" height="800" decoding="async" draggable="false" />
          </div>
          <div class="sk-meta">
            <h4>${m.name}</h4>
            <p>${m.role}</p>
            <div class="sk-socials">
              <a href="${m.website}" target="_blank" rel="noopener noreferrer" aria-label="${m.name} website">${globeSvg}</a>
              <a href="${m.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${m.name} LinkedIn">${linkedinSvg}</a>
            </div>
          </div>
        </li>`).join("");
      return ul;
    };

    const track = document.createElement("div");
    track.className = "sk-track";
    const groupA = buildGroup(false);
    track.append(groupA, buildGroup(true));
    root.appendChild(track);

    // Image fallback (error events don't bubble, so listen in the capture phase once)
    root.addEventListener("error", (e) => {
      const img = e.target;
      if (img.tagName === "IMG" && img.dataset.fallback && img.src !== img.dataset.fallback) {
        img.src = img.dataset.fallback;
        delete img.dataset.fallback;
      }
    }, true);

    initSquadMarquee(root, track, groupA);
  }

  /*
   * Seamless loop: the track holds two identical, equally-wide groups and a single
   * linear animation moves it from 0 to -50% of its own width. At -50% the second group
   * sits exactly where the first started, so the restart is pixel-identical (no jump,
   * no gap, no easing at the seam). One Web Animation drives everything; hover/focus
   * eases playbackRate to 0 and back instead of pausing abruptly.
   */
  function initSquadMarquee(root, track, groupA) {
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMQ = window.matchMedia("(max-width: 640px)");
    let anim = null;
    let visible = false;
    let hovering = false;
    let focused = false;
    let rate = 0;
    let raf = 0;
    let lastT = 0;

    const speed = () => (mobileMQ.matches ? 44 : 64);          // px per second
    const targetRate = () => (visible && !hovering && !focused ? 1 : 0);

    const tick = (t) => {
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      const target = targetRate();
      rate += (target - rate) * (1 - Math.exp(-dt / 140));
      if (Math.abs(target - rate) < 0.004) rate = target;
      if (anim) anim.playbackRate = rate;
      if (rate !== target) raf = requestAnimationFrame(tick);
      else { raf = 0; lastT = 0; }
    };
    const updateRate = () => { if (!raf && anim) raf = requestAnimationFrame(tick); };

    const sync = () => {
      const w = groupA.offsetWidth;
      if (!anim || !w) return;
      const duration = (w / speed()) * 1000;
      const cur = anim.effect.getComputedTiming();
      if (Math.abs(cur.duration - duration) < 1) return;
      const progress = cur.progress || 0;                      // keep position when resizing
      anim.effect.updateTiming({ duration });
      anim.currentTime = progress * duration;
    };

    const start = () => {
      if (anim || !track.animate) return;
      root.classList.remove("is-static");
      anim = track.animate(
        [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(-50%,0,0)" }],
        { duration: 60000, iterations: Infinity, easing: "linear" }
      );
      anim.playbackRate = rate = 0;
      sync();
      updateRate();
    };
    const stop = () => {
      if (anim) { anim.cancel(); anim = null; }
      cancelAnimationFrame(raf); raf = 0; lastT = 0; rate = 0;
      root.classList.add("is-static");
    };
    const applyMotionPref = () => (reduceMQ.matches ? stop() : start());

    // Only the mouse pauses on hover; touch keeps flowing so taps on links never fight the motion
    root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; updateRate(); } });
    root.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovering = false; updateRate(); } });

    // Keyboard: pause while focus is inside, and bring an off-screen card into view
    root.addEventListener("focusin", (e) => {
      focused = true;
      updateRate();
      const card = e.target.closest(".sk-card");
      if (!card || !anim) return;
      const r = card.getBoundingClientRect();
      const v = root.getBoundingClientRect();
      if (r.left >= v.left && r.right <= v.right) return;
      const w = groupA.offsetWidth;
      const T = card.offsetLeft - (v.width - card.offsetWidth) / 2;
      const p = (((T % w) + w) % w) / w;
      anim.currentTime = p * anim.effect.getComputedTiming().duration;
    });
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) { focused = false; updateRate(); }
    });

    // Run only while on screen (also covers hidden panels / section transitions)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateRate(); }, { threshold: 0 }).observe(root);
    } else {
      visible = true;
    }
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(groupA);
    window.addEventListener("resize", sync, { passive: true });
    (reduceMQ.addEventListener ? reduceMQ.addEventListener.bind(reduceMQ, "change") : reduceMQ.addListener.bind(reduceMQ))(applyMotionPref);

    applyMotionPref();
  }

      // ==========================================
  // 4B. OUR WORK HERO-PARALLAX DROP & SERVICE BRIDGE
  // ==========================================

  // Easy-to-update Placeholder Slots (Drop real screenshots in `Images/our works/work-1.jpg` etc.)
  const SKETCHERZ_PROJECTS = [
    {
      title: "Project Slot 01 · Forest Cafe",
      category: "web",
      tag: "WEB & HOSPITALITY",
      desc: "Replace Images/our works/work-1.jpg to showcase your live hospitality build.",
      image: "Images/our works/work-1.jpg",
      fallback: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
      link: "https://forestcafehills.in"
    },
    {
      title: "Project Slot 02 · GST Billing Suite",
      category: "systems",
      tag: "BUSINESS SYSTEMS",
      desc: "Replace Images/our works/work-2.jpg to showcase custom invoice & billing software.",
      image: "Images/our works/work-2.jpg",
      fallback: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
      link: "#contact"
    },
    {
      title: "Project Slot 03 · Brand Identity",
      category: "brand",
      tag: "BRANDING & UI/UX",
      desc: "Replace Images/our works/work-3.jpg to highlight visual identity & design systems.",
      image: "Images/our works/work-3.jpg",
      fallback: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80",
      link: "#about"
    },
    {
      title: "Project Slot 04 · E-Commerce Store",
      category: "web",
      tag: "WEB & PLATFORMS",
      desc: "Replace Images/our works/work-4.jpg to display high-speed storefront builds.",
      image: "Images/our works/work-4.jpg",
      fallback: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80",
      link: "#contact"
    },
    {
      title: "Project Slot 05 · Retail POS Hub",
      category: "systems",
      tag: "BUSINESS SYSTEMS",
      desc: "Replace Images/our works/work-5.jpg to showcase inventory & retail operations.",
      image: "Images/our works/work-5.jpg",
      fallback: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
      link: "#contact"
    },
    {
      title: "Project Slot 06 · Editorial UI",
      category: "brand",
      tag: "BRANDING & UI/UX",
      desc: "Replace Images/our works/work-6.jpg to showcase typographic & UI craft.",
      image: "Images/our works/work-6.jpg",
      fallback: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80",
      link: "#contact"
    }
  ];

  // Escapes text that is interpolated into card markup.
  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  // Portfolio: a clean, consistent case-study grid with category filtering.
  function initWaveDropShowcase(options = {}) {
    const {
      sectionId = "work",
      gridId = "workGrid",
      items = SKETCHERZ_PROJECTS
    } = options;

    const section = document.getElementById(sectionId);
    const grid = document.getElementById(gridId);
    const pills = section ? section.querySelectorAll(".work-filter-pill") : [];

    if (!section || !grid) return;

    function buildCardHTML(item) {
      const isExternal = /^https?:/i.test(item.link);
      const ext = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      // "Project Slot 01 · Forest Cafe" → index "Project Slot 01" + title "Forest Cafe"
      const parts = String(item.title).split(' · ');
      const index = parts.length > 1 ? parts[0] : '';
      const title = parts.length > 1 ? parts.slice(1).join(' · ') : item.title;
      return `
        <article class="work-card">
          <div class="work-card-media">
            <img src="${esc(item.image)}" onerror="this.onerror=null;this.src='${esc(item.fallback)}';" alt="${esc(title)}" loading="lazy" />
            <span class="work-card-tag">${esc(item.tag)}</span>
          </div>
          <div class="work-card-body">
            ${index ? `<span class="work-card-index">${esc(index)}</span>` : ''}
            <h4>${esc(title)}</h4>
            <p>${esc(item.desc)}</p>
            <a href="${esc(item.link)}"${ext} class="work-card-link" aria-label="View project: ${esc(title)}">VIEW PROJECT ↗</a>
          </div>
        </article>
      `;
    }

    function renderWork(filter = "all") {
      pills.forEach(p => p.classList.toggle("active", p.dataset.filter === filter));
      const matches = filter === "all" ? items : items.filter(p => p.category === filter);
      grid.innerHTML = matches.length
        ? matches.map(buildCardHTML).join("")
        : '<p class="work-empty">No projects in this category yet.</p>';
    }

    pills.forEach(pill => {
      pill.addEventListener("click", () => renderWork(pill.dataset.filter || "all"));
    });

    // Internal links (#contact, #about…) use the deck navigation, not a hash jump.
    grid.addEventListener("click", event => {
      const link = event.target.closest("a.work-card-link");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#") && ids.includes(href.slice(1))) {
        event.preventDefault();
        hasNavigatedFromHero = true;
        goToSection(href.slice(1), { historyMode: "push" });
      }
    });

    renderWork("all");
    return { renderWork };
  }

  function initWorkParallaxAndServiceBridge() {
    const workController = initWaveDropShowcase();
    const workSection = document.getElementById("work");
    if (!workController || !workSection) return;

    // Connect #services cards -> Swipe-back -> Navigate to #work & filter
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach((card, idx) => {
      if (!card.dataset.serviceFilter) {
        const categories = ["web", "brand", "systems"];
        card.dataset.serviceFilter = categories[idx % categories.length];
      }

      card.addEventListener("click", () => {
        const cat = card.dataset.serviceFilter || "all";
        card.classList.add("is-swiping-back");

        setTimeout(() => {
          workController.renderWork(cat);
          if (typeof goToSection === "function") {
            goToSection("work", { historyMode: "push" });
          } else {
            workSection.scrollIntoView({ behavior: "smooth" });
          }
          setTimeout(() => card.classList.remove("is-swiping-back"), 450);
        }, 220);
      });
    });
  }
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
    setMenu(false);
    document.body.classList.remove('is-scrolled');
    delete document.body.dataset.headerTone;

    // First page load
    if (currentIndex === -1) {
      currentIndex = targetIndex;

      panels.forEach((panel, index) => {
        const active = index === targetIndex;

        panel.classList.toggle('active', active);
        panel.style.display = active ? 'block' : 'none';
        panel.style.visibility = active ? 'visible' : 'hidden';
        panel.style.transform = '';
        panel.style.opacity = '1';
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
      updateHeaderState();
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
        panel.style.opacity = '1';
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
      updateHeaderState();
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

    // Slide the next full-screen panel into place. Both panels remain opaque,
    // so the deck background is never exposed during navigation.
    targetPanel.classList.remove('active');
    targetPanel.style.display = 'block';
    targetPanel.style.visibility = 'visible';
    targetPanel.style.transition = 'none';
    targetPanel.style.opacity = '1';
    targetPanel.style.transform = isForward
      ? 'translate3d(0, 100%, 0)'
      : 'translate3d(0, -100%, 0)';
    targetPanel.style.zIndex = '3';
    targetPanel.scrollTop = 0;
    targetPanel.setAttribute('aria-hidden', 'false');

    currentPanel.style.display = 'block';
    currentPanel.style.visibility = 'visible';
    currentPanel.style.transition = 'none';
    currentPanel.style.opacity = '1';
    currentPanel.style.transform = 'translate3d(0, 0, 0)';
    currentPanel.style.zIndex = '2';

    void targetPanel.offsetHeight;
    void currentPanel.offsetHeight;

    const slideTransition =
      'transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)';
    targetPanel.style.transition = slideTransition;
    currentPanel.style.transition = slideTransition;

    requestAnimationFrame(() => {
      targetPanel.style.transform = 'translate3d(0, 0, 0)';
      currentPanel.style.transform = isForward
        ? 'translate3d(0, -100%, 0)'
        : 'translate3d(0, 100%, 0)';
    });

    transitionTimeout = setTimeout(() => {
      finalizeTransition();
    }, 760);
  }

  // ==========================================
  // 6. NAVIGATION LINKS
  // ==========================================

  document.querySelectorAll('[data-section]:not(.marketplace-work-btn)').forEach(element => {
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

  // The hero's central EXPLORE CTA has its own explicit route so it always
  // uses the same panel-slide navigation as the header (without duplicate handlers).
  const heroWorkButton = document.querySelector('.marketplace-work-btn');
  if (heroWorkButton) {
    heroWorkButton.setAttribute('type', 'button');
    heroWorkButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      const aboutIndex = ids.indexOf('about');
      if (aboutIndex < 0) return;

      hasNavigatedFromHero = true;

      // If already on About, simply return to the top instead of replaying
      // a section transition against the same panel.
      if (currentIndex === aboutIndex && panels[aboutIndex].classList.contains('active')) {
        if (lenis) {
          lenis.scrollTo(0, { duration: 0.8 });
        } else {
          panels[aboutIndex].scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      goToSection('about', { historyMode: 'push' });
    });
  }

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
            .map((_, index) => {
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

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        wordEl.querySelectorAll('.paint-char').forEach(c => { c.style.clipPath = 'none'; });
      }

      // Automated idle attract loop when visible in viewport (skipped for reduced motion)
      function scheduleNextLoop() {
        if (reduceMotion) return;
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
            if (entry.isIntersecting && reduceMotion) return;
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
        if (reduceMotion) return;
        clearTimeout(loopTimer);
        playPaintSequence(1.6);
      });

      btn.addEventListener('touchstart', () => {
        if (reduceMotion) return;
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
        modeIcon.textContent = theme === 'dark' ? '\uD83C\uDF19' : '\u2600';
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
      updateHeaderState();
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
  initAboutUsMotion();
  initWorkParallaxAndServiceBridge();

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
