
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

  // Bottom nav can scroll horizontally on narrow screens: keep the active item in view.
  function centerActiveNavItem() {
    const nav = document.getElementById('primaryNav');
    const active = nav && nav.querySelector('.nav-item.active');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth + 1) return;
    const left = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

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
      const isActive = item.dataset.section === ids[index];
      item.classList.toggle('active', isActive);
      if (isActive) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
    centerActiveNavItem();

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
          // The footer follows the theme (white in light, black in dark), so only
          // the yellow content blocks need the dark ink override.
          if (!region.classList.contains('section-footer') &&
              (region.classList.contains('block-yellow') || region.matches('.panel.work .panel-bottom-block'))) {
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
    const TAP_PAUSE_MS = 5000;
    let tapPaused = false;
    let tapTimer = 0;
    let watchingScroll = false;
    let tapScrollBase = 0;
    let touchStartY = 0;
    const scrollPanel = root.closest(".panel");

    const targetRate = () => (visible && !hovering && !focused && !tapPaused ? 1 : 0);

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
      endTapPause();
      root.classList.add("is-static");
    };
    const applyMotionPref = () => (reduceMQ.matches ? stop() : start());

    // Mobile tap-to-pause: a tap on a card holds the marquee for 5s. Any real user scroll
    // (touch drag, wheel, or the panel's own scroll position changing) ends the hold at once.
    // The marquee itself moves with transforms, so it never produces scroll events.
    const isUserScrollTouch = (e) => {
      const t = e.touches && e.touches[0];
      return !!t && Math.abs(t.clientY - touchStartY) > 8;
    };
    const onWatchTouchStart = (e) => { if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY; };
    const onWatchTouchMove = (e) => { if (isUserScrollTouch(e)) endTapPause(); };
    const onWatchWheel = () => endTapPause();
    const onWatchScroll = () => {
      if (scrollPanel && Math.abs(scrollPanel.scrollTop - tapScrollBase) > 2) endTapPause();
    };
    const watchScroll = () => {
      if (watchingScroll) return;
      watchingScroll = true;
      document.addEventListener("touchstart", onWatchTouchStart, { passive: true, capture: true });
      document.addEventListener("touchmove", onWatchTouchMove, { passive: true, capture: true });
      document.addEventListener("wheel", onWatchWheel, { passive: true, capture: true });
      if (scrollPanel) scrollPanel.addEventListener("scroll", onWatchScroll, { passive: true });
    };
    const unwatchScroll = () => {
      if (!watchingScroll) return;
      watchingScroll = false;
      document.removeEventListener("touchstart", onWatchTouchStart, { capture: true });
      document.removeEventListener("touchmove", onWatchTouchMove, { capture: true });
      document.removeEventListener("wheel", onWatchWheel, { capture: true });
      if (scrollPanel) scrollPanel.removeEventListener("scroll", onWatchScroll);
    };
    function endTapPause() {
      clearTimeout(tapTimer);
      tapTimer = 0;
      unwatchScroll();
      if (!tapPaused) return;
      tapPaused = false;
      updateRate();                                          // eases back to full speed
    }
    const startTapPause = () => {
      if (!anim || !mobileMQ.matches) return;
      tapPaused = true;
      tapScrollBase = scrollPanel ? scrollPanel.scrollTop : 0;
      rate = 0;                                              // stop immediately, no easing
      anim.playbackRate = 0;
      clearTimeout(tapTimer);                                // re-tap restarts the 5s, never stacks timers
      tapTimer = setTimeout(endTapPause, TAP_PAUSE_MS);
      watchScroll();
      updateRate();
    };
    const pointOnCard = (x, y) => Array.from(root.querySelectorAll(".sk-card")).some((card) => {
      const r = card.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    // Geometry-based hit test: the duplicate group is inert, so taps on it never reach event targets.
    root.addEventListener("click", (e) => {
      if (!e.clientX && !e.clientY) return;                  // keyboard-triggered click: focus already pauses
      if (pointOnCard(e.clientX, e.clientY)) startTapPause();
    });
    (mobileMQ.addEventListener ? mobileMQ.addEventListener.bind(mobileMQ, "change") : mobileMQ.addListener.bind(mobileMQ))(
      () => { if (!mobileMQ.matches) endTapPause(); }
    );

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
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) endTapPause();
        updateRate();
      }, { threshold: 0 }).observe(root);
    } else {
      visible = true;
    }
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(groupA);
    window.addEventListener("resize", sync, { passive: true });
    (reduceMQ.addEventListener ? reduceMQ.addEventListener.bind(reduceMQ, "change") : reduceMQ.addListener.bind(reduceMQ))(applyMotionPref);

    applyMotionPref();
  }

      // ==========================================
  // 4B. OUR WORK SHOWCASE, FILTERING & PREVIEW MODAL
  // ==========================================
  function initWorkShowcase() {
    const pills = document.querySelectorAll('.work-filter-pills .filter-pill');
    const cards = document.querySelectorAll('.projects-showcase-grid .project-showcase-card');
    const modal = document.getElementById('projectPreviewModal');
    if (!cards.length) return;

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter || 'all';
        pills.forEach((p) => {
          const active = p === pill;
          p.classList.toggle('is-active', active);
          p.setAttribute('aria-selected', String(active));
        });
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });

    const ppmImage = document.getElementById('ppmImage');
    const ppmTag = document.getElementById('ppmTag');
    const ppmTitle = document.getElementById('ppmTitle');
    const ppmDesc = document.getElementById('ppmDesc');
    const ppmDeliverables = document.getElementById('ppmDeliverables');
    const ppmEnquireBtn = document.getElementById('ppmEnquireBtn');
    let activeProjectType = 'Custom Websites';

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };

    const openCardAction = (card) => {
      const liveUrl = (card.dataset.liveUrl || '').trim();
      if (liveUrl) {
        window.open(liveUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (!modal) return;
      const img = card.querySelector('.project-thumb');
      const tag = card.querySelector('.project-badge');
      const title = card.querySelector('h4');
      const desc = card.querySelector('p');

      if (ppmImage && img) {
        ppmImage.src = img.getAttribute('src') || '';
        ppmImage.alt = img.getAttribute('alt') || '';
      }
      if (ppmTag && tag) ppmTag.textContent = tag.textContent;
      if (ppmTitle && title) ppmTitle.textContent = title.textContent;
      if (ppmDesc && desc) ppmDesc.textContent = desc.textContent;
      if (ppmDeliverables) ppmDeliverables.textContent = card.dataset.deliverables || '';
      activeProjectType = card.dataset.projectType || 'Custom Websites';

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    };

    cards.forEach((card) => {
      card.addEventListener('click', () => openCardAction(card));
      const btn = card.querySelector('.project-link-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCardAction(card);
        });
      }
    });

    if (modal) {
      modal.querySelectorAll('[data-ppm-close]').forEach((el) => {
        el.addEventListener('click', closeModal);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });
    }

    if (ppmEnquireBtn) {
      ppmEnquireBtn.addEventListener('click', () => {
        closeModal();
        const contactSelect = document.getElementById('contactProject');
        if (contactSelect) contactSelect.value = activeProjectType;
        const contactNav = document.querySelector('[data-section="contact"]');
        if (contactNav) contactNav.click();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkShowcase);
  } else {
    initWorkShowcase();
  }

    function initWorkParallaxAndServiceBridge() {
    initWorkShowcase();
    initServiceToContact();
  }

  // ==========================================
  // SERVICES -> CONTACT (pre-selects Project Type)
  // The six service names match the <select name="project"> option labels
  // exactly; SERVICE_TO_PROJECT keeps the mapping explicit and falls back to a
  // whitespace-normalised label match if a label is ever tweaked.
  // ==========================================
  const SERVICE_TO_PROJECT = {
    'Custom Websites': 'Custom Websites',
    'UI / UX Design': 'UI/UX Design',
    'UI/UX Design': 'UI/UX Design',
    'Business Software': 'Business Software',
    'Brand & Visual Design': 'Brand & Visual Design',
    'Digital Marketing': 'Digital Marketing',
    'Website Redesign & Care': 'Website Redesign & Care'
  };

  function normalizeLabel(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function selectProjectType(service) {
    const select = contactForm && contactForm.querySelector('select[name="project"]');
    if (!select) return null;

    const wanted = normalizeLabel(SERVICE_TO_PROJECT[service] || service);
    const option = Array.from(select.options).find(opt =>
      normalizeLabel(opt.value || opt.textContent) === wanted ||
      normalizeLabel(opt.textContent) === wanted
    );
    if (!option) return null;

    select.value = option.value;       // real form state, submitted with the form
    option.selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return select;
  }

  function revealProjectField(select) {
    const panel = panels[ids.indexOf('contact')];
    if (!panel || !select) return;

    const field = select.closest('label') || select;
    const panelRect = panel.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const headerClearance = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72) + 24;
    // Keep the field comfortably in the upper part of the visible area.
    const topOffset = Math.max(headerClearance, panel.clientHeight * 0.3);
    const target = Math.max(0, panel.scrollTop + (fieldRect.top - panelRect.top) - topOffset);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis && !reduce) {
      lenis.scrollTo(target, { duration: 1.1 });
    } else {
      panel.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }

    field.classList.remove('is-prefilled');
    void field.offsetWidth;            // restart the highlight animation on repeat clicks
    field.classList.add('is-prefilled');
    setTimeout(() => field.classList.remove('is-prefilled'), 2200);

    try { select.focus({ preventScroll: true }); } catch (e) { select.focus(); }
  }

  function openContactForService(service) {
    const select = selectProjectType(service);   // set first: state is right even if the scroll is interrupted
    hasNavigatedFromHero = true;
    goToSection('contact', { historyMode: 'push' });

    // Wait for the panel slide to finish (and Lenis to re-attach), then scroll to the field.
    const started = Date.now();
    (function waitThenReveal() {
      if (isTransitioning && Date.now() - started < 2000) {
        setTimeout(waitThenReveal, 60);
        return;
      }
      setTimeout(() => revealProjectField(select), 60);
    })();
  }

  function initServiceToContact() {
    document.querySelectorAll('.service-card[data-project]').forEach(card => {
      const service = card.dataset.project;

      card.addEventListener('click', () => openContactForService(service));
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openContactForService(service);
        }
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

      const targetIndex = ids.indexOf(target);

      // Already on this section (e.g. a footer nav link to the current
      // page): goToSection() would no-op and leave the old scroll position.
      // Reset the panel's own scroll to the top instead.
      if (
        currentIndex === targetIndex &&
        !isTransitioning &&
        panels[targetIndex] &&
        panels[targetIndex].classList.contains('active')
      ) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (lenis && !reduce) {
          lenis.scrollTo(0, { duration: 0.8 });
        } else {
          panels[targetIndex].scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        }
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
  // 9b. CONTACT FORM — starting-point chips, "Other" project type, validation,
  //     and WhatsApp hand-off
  // ==========================================

  // Temporary business WhatsApp number (country code + number, digits only).
  const WHATSAPP_NUMBER = '919789672327';

  (function initContactForm() {
    if (!contactForm) return;

    const els = {
      name: document.getElementById('contactName'),
      email: document.getElementById('contactEmail'),
      project: document.getElementById('contactProject'),
      other: document.getElementById('contactProjectOther'),
      otherWrap: document.getElementById('contactProjectOtherWrap'),
      message: document.getElementById('contactMessage')
    };
    const errorEls = {
      name: document.getElementById('contactNameError'),
      email: document.getElementById('contactEmailError'),
      project: document.getElementById('contactProjectError'),
      other: document.getElementById('contactProjectOtherError'),
      message: document.getElementById('contactMessageError')
    };
    const formNote = document.getElementById('formNote');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const touched = {};

    // ---------- Project type: "Other" reveals a required text input ----------
    function isOtherSelected() {
      return els.project.value === 'Other';
    }

    function syncOtherField() {
      const other = isOtherSelected();
      els.otherWrap.hidden = !other;
      els.other.required = other;
      if (!other) {
        els.other.value = '';
        touched.other = false;
        clearError('other');
      }
    }

    els.project.addEventListener('change', () => {
      syncOtherField();
      touched.project = true;
      validateField('project');
    });

    // ---------- Validation ----------
    function messageFor(key) {
      const value = (els[key].value || '').trim();
      switch (key) {
        case 'name':
          return value ? '' : 'Please enter your name.';
        case 'email':
          if (!value) return 'Please enter your email address.';
          return emailPattern.test(value) ? '' : 'Please enter a valid email address, like name@example.com.';
        case 'project':
          return value ? '' : 'Please select a project type.';
        case 'other':
          return isOtherSelected() && !value ? 'Please specify your project type.' : '';
        case 'message':
          return value ? '' : 'Please tell us a little about your idea.';
        default:
          return '';
      }
    }

    function showError(key, text) {
      const el = errorEls[key];
      els[key].classList.add('is-invalid');
      els[key].setAttribute('aria-invalid', 'true');
      el.textContent = text;
      el.hidden = false;
    }

    function clearError(key) {
      const el = errorEls[key];
      els[key].classList.remove('is-invalid');
      els[key].removeAttribute('aria-invalid');
      el.textContent = '';
      el.hidden = true;
    }

    function validateField(key) {
      const text = messageFor(key);
      if (text) showError(key, text); else clearError(key);
      return !text;
    }

    ['name', 'email', 'other', 'message'].forEach(key => {
      // Errors appear only after the visitor has left the field (or submitted)...
      els[key].addEventListener('blur', () => {
        touched[key] = true;
        validateField(key);
      });
      // ...and then update live while they fix it.
      els[key].addEventListener('input', () => {
        if (touched[key]) validateField(key);
      });
    });

    // ---------- WhatsApp message ----------
    function buildWhatsAppMessage() {
      const lines = [
        'Hello Code Sketcherz, I would like to discuss a project.',
        '',
        '*Name:* ' + els.name.value.trim(),
        '*Email:* ' + els.email.value.trim(),
        '*Project Type:* ' + els.project.value
      ];
      if (isOtherSelected()) {
        lines.push('*Custom Project Type:* ' + els.other.value.trim());
      }
      const activePromptChip = contactForm.querySelector('.prompt-chip.is-selected');
      if (activePromptChip) {
        lines.push('*Starting Point:* ' + activePromptChip.textContent.trim());
      }
      lines.push('', '*Project Details:*', els.message.value.trim());
      return lines.join('\n');
    }

    function whatsappUrl() {
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage());
    }

    function setNote(text, url) {
      if (!formNote) return;
      formNote.textContent = text;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Tap here if WhatsApp did not open.';
        formNote.append(' ', link);
      }
    }

    contactForm.addEventListener('submit', event => {
      event.preventDefault();

      const keys = ['name', 'email', 'project', 'other', 'message'];
      keys.forEach(key => { touched[key] = true; });
      const invalid = keys.filter(key => !validateField(key));

      if (invalid.length) {
        setNote('Please fix the highlighted fields and try again.');
        try { els[invalid[0]].focus(); } catch (e) { /* no-op */ }
        return;
      }

      const url = whatsappUrl();
      // Opened synchronously inside the click/submit gesture so popup blockers allow it.
      const win = window.open(url, '_blank');
      if (win) {
        try { win.opener = null; } catch (e) { /* cross-origin guard */ }
        setNote('WhatsApp is opening with your message ready. Press Send there to deliver it.', url);
      } else {
        setNote('Your browser blocked the new tab.', url);
      }
    });

    // Contact-card WhatsApp link: carry over the typed message when there is one.
    const whatsappLink = document.getElementById('contactWhatsappBtn');
    if (whatsappLink) {
      whatsappLink.addEventListener('click', () => {
        const name = els.name.value.trim();
        const message = els.message.value.trim();
        if (!message) { whatsappLink.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER); return; }
        const text = encodeURIComponent((name ? 'Hi, I\'m ' + name + '. ' : '') + message);
        whatsappLink.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text);
      });
    }

    syncOtherField();
  })();

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


// ==========================================
// CONTACT STARTER PROMPT CHIPS
// ==========================================
function initContactPromptChips() {
  const chips = document.querySelectorAll('#contact .prompt-chip');
  const messageBox = document.getElementById('contactMessage') || document.querySelector('#contact textarea');
  const projectSelect = document.getElementById('contactProject') || document.querySelector('#contact select');
  if (!chips.length || !messageBox) return;

  const promptTemplates = {
    website: [
      'Hi Code Sketcherz, I am planning a new website for my business. Could you share how your design and development process works, typical timelines, and how we get started?',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. My business or industry: ',
      '2. Main goal of the website: ',
      '3. Preferred launch timeline: '
    ].join('\n'),
    software: [
      'Hi Code Sketcherz, we are facing a challenge in our everyday workflow and are looking for a custom digital solution to automate or simplify it.',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. The workflow challenge we are facing: ',
      '2. How we currently handle this task: ',
      '3. Preferred time for a quick discussion: '
    ].join('\n'),
    problem: [
      'Hi Code Sketcherz, we are facing a challenge in our everyday workflow and are looking for a custom digital solution to automate or simplify it.',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. The workflow challenge we are facing: ',
      '2. How we currently handle this task: ',
      '3. Preferred time for a quick discussion: '
    ].join('\n'),
    brand: [
      'Hi Code Sketcherz, I want to create a clean brand identity and interface design. Could you share how your design process, concepts, and revisions work?',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. What I am building (Brand / Website / App): ',
      '2. Style or feel I have in mind: ',
      '3. Preferred timeline: '
    ].join('\n'),
    redesign: [
      'Hi Code Sketcherz, I want to upgrade my existing website for better design and mobile performance. Could you share how you handle redesigns smoothly?',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. Current website link: ',
      '2. Main improvements I want: ',
      '3. Preferred timeline: '
    ].join('\n'),
    guidance: [
      'Hi Code Sketcherz, I have a project idea in mind and would love your guidance on the best approach and next steps before starting.',
      '',
      '(Optional details, feel free to send as is or add below)',
      '1. What I am trying to build or solve: ',
      '2. Where I need clarity (Design / Tech / Scope): ',
      '3. Preferred time to connect: '
    ].join('\n')
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');

      const projectType = chip.dataset.projectType;
      if (projectSelect && projectType) {
        projectSelect.value = projectType;
        try { projectSelect.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
      }

      const key = chip.dataset.promptKey;
      const filledText = promptTemplates[key] || chip.textContent.trim();
      messageBox.value = filledText;
      try { messageBox.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
      messageBox.focus();

      const firstColonPos = filledText.indexOf(': ') + 2;
      if (firstColonPos > 1) {
        messageBox.setSelectionRange(firstColonPos, firstColonPos);
      } else {
        messageBox.setSelectionRange(filledText.length, filledText.length);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactPromptChips);
} else {
  initContactPromptChips();
}
