
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
  // ABOUT US GEOMETRIC S-K-E-T-C-H-E-R-Z SHOWCASE
  // ==========================================

  const SKETCHERZ_MEMBERS = [
    {
      letter: "S",
      name: "Gowrinath",
      role: "Lead Developer & UI Architect",
      shape: "shape-double-pill",
      photo: "Images/about us/member-1.jpg",
      fallback: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
      website: "https://github.com/gowrinath36-tech",
      linkedin: "#"
    },
    {
      letter: "K",
      name: "Hari Krishna",
      role: "Full Stack Engineer",
      shape: "shape-arch",
      photo: "Images/about us/member-2.jpg",
      fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "E",
      name: "Titu",
      role: "Creative Direction & UI/UX",
      shape: "shape-circle",
      photo: "Images/about us/member-3.jpg",
      fallback: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "T",
      name: "Karthik R.",
      role: "Motion Graphics & 3D",
      shape: "shape-triple-pill",
      photo: "Images/about us/member-4.jpg",
      fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "C",
      name: "Priya S.",
      role: "Frontend Developer",
      shape: "shape-arch",
      photo: "Images/about us/member-5.jpg",
      fallback: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "H",
      name: "Dinesh K.",
      role: "Performance & SEO Engineer",
      shape: "shape-double-pill",
      photo: "Images/about us/member-6.jpg",
      fallback: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "E",
      name: "Sneha M.",
      role: "QA & Automation",
      shape: "shape-triple-pill",
      photo: "Images/about us/member-7.jpg",
      fallback: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    },
    {
      letter: "R",
      name: "Manoj V.",
      role: "DevOps & Cloud Systems",
      shape: "shape-circle",
      photo: "Images/about us/member-8.jpg",
      fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
      website: "#",
      linkedin: "#"
    }
  ];

  function initAboutUsMotion() {
    const grid = document.getElementById("sketcherzGrid");
    const modal = document.getElementById("squadZModal");
    const closeBtn = document.getElementById("squadZClose");
    const rosterEl = document.getElementById("squadZRoster");
    if (!grid || grid.dataset.rendered) return;
    grid.dataset.rendered = "true";

    const globeSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    const linkedinSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.633 13.633h-2.37V9.92c0-.885-.017-2.025-1.234-2.025-1.235 0-1.424.965-1.424 1.96v3.778h-2.37V5.998H8.51v1.043h.031a2.5 2.5 0 0 1 2.246-1.233c2.403 0 2.846 1.58 2.846 3.637zM3.56 4.954a1.376 1.376 0 1 1 0-2.751 1.376 1.376 0 0 1 0 2.751m1.185 8.679H2.372V5.998h2.373zM14.815.001H1.18A1.17 1.17 0 0 0 0 1.154v13.691A1.17 1.17 0 0 0 1.18 16h13.635A1.17 1.17 0 0 0 16 14.845V1.153A1.17 1.17 0 0 0 14.815 0"/></svg>`;

    // Render 8 Members (S-K-E-T-C-H-E-R)
    SKETCHERZ_MEMBERS.forEach(m => {
      const article = document.createElement("article");
      article.className = "sk-member-card";
      article.innerHTML = `
        <div class="sk-portrait-box ${m.shape}">
          <span class="sk-letter-tag">${m.letter}</span>
          <img src="${m.photo}" onerror="this.onerror=null;this.src='${m.fallback}';" alt="${m.name}" loading="lazy" />
        </div>
        <div class="sk-meta">
          <h4>${m.name}</h4>
          <p>${m.role}</p>
          <div class="sk-socials">
            <a href="${m.website}" target="_blank" rel="noopener noreferrer" aria-label="${m.name} Website">${globeSvg}</a>
            <a href="${m.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${m.name} LinkedIn">${linkedinSvg}</a>
          </div>
        </div>
      `;
      grid.appendChild(article);
    });

    // Render 9th Interactive "Z" Card (Click to see more)
    const zBtn = document.createElement("button");
    zBtn.type = "button";
    zBtn.className = "sk-member-card sk-z-trigger-card";
    zBtn.setAttribute("aria-label", "See more about Code Sketcherz team");
    zBtn.innerHTML = `
      <div class="sk-z-box">
        <span class="sk-z-giant">Z</span>
        <span class="sk-z-pill">Click to see more ↗</span>
      </div>
      <div class="sk-meta">
        <h4>More &amp; Careers</h4>
        <p>Full Stack · Motion · Cloud</p>
      </div>
    `;
    grid.appendChild(zBtn);

    if (rosterEl) {
      rosterEl.innerHTML = SKETCHERZ_MEMBERS.map(m => `<span>${m.letter} · ${m.name} (${m.role})</span>`).join("");
    }

    if (modal) {
      zBtn.addEventListener("click", () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
      });
      const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
      };
      closeBtn?.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      const ctaBtn = modal.querySelector(".squad-z-cta");
      ctaBtn?.addEventListener("click", () => {
        closeModal();
      });
    }
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

  function initWaveDropShowcase(options = {}) {
    const {
      sectionId = "work",
      topPlaneId = "workTopPlane",
      topRow1Id = "workTopRow1",
      topRow2Id = "workTopRow2",
      revealPlaneId = "workRevealPlane",
      row1Id = "workRow1",
      row2Id = "workRow2",
      row3Id = "workRow3",
      items = SKETCHERZ_PROJECTS
    } = options;

    const section = document.getElementById(sectionId);
    const topPlane = document.getElementById(topPlaneId);
    const topRow1 = document.getElementById(topRow1Id);
    const topRow2 = document.getElementById(topRow2Id);
    const revealPlane = document.getElementById(revealPlaneId);
    const row1 = document.getElementById(row1Id);
    const row2 = document.getElementById(row2Id);
    const row3 = document.getElementById(row3Id);
    const pills = section ? section.querySelectorAll(".work-filter-pill") : [];

    if (!section || !revealPlane || !row1 || !row2 || !row3) return;

    let currentFilter = "all";

    // Spring physics state (replicates Framer Motion useSpring stiffness: 300, damping: 30)
    let currentDrop = 0;
    let velocityDrop = 0;
    let currentDrift = 0;
    let velocityDrift = 0;
    let lastTime = performance.now();

    function buildCardHTML(item, interactive = true) {
      const imgTag = `<img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallback}';" alt="${interactive ? item.title : ""}" loading="lazy" />`;
      if (!interactive) {
        return `<div class="work-project-card">${imgTag}</div>`;
      }
      const ext = item.link.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : "";
      return `
        <article class="work-project-card" onclick="window.open('${item.link}', '${item.link.startsWith("http") ? "_blank" : "_self"}')">
          ${imgTag}
          <div class="work-card-overlay">
            <span class="work-card-tag">${item.tag}</span>
            <div class="work-card-info">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
              <a href="${item.link}" ${ext} class="work-card-link" onclick="event.stopPropagation()">VIEW PROJECT ↗</a>
            </div>
          </div>
        </article>
      `;
    }

    function renderWork(filter = "all") {
      currentFilter = filter;
      pills.forEach(p => p.classList.toggle("active", p.dataset.filter === filter));

      if (topRow1 && topRow2) {
        const ghost1 = [items[0], items[1], items[2], items[3]];
        const ghost2 = [items[4], items[5], items[0], items[1]];
        topRow1.innerHTML = ghost1.map(item => buildCardHTML(item, false)).join("");
        topRow2.innerHTML = ghost2.map(item => buildCardHTML(item, false)).join("");
      }

      if (filter === "all") {
        section.classList.remove("is-filtered");
        const r1 = [items[0], items[1], items[2], items[0]];
        const r2 = [items[3], items[4], items[5], items[3]];
        const r3 = items.length > 6
          ? items.slice(6)
          : [items[1], items[5], items[0], items[4]];

        row1.innerHTML = r1.map(item => buildCardHTML(item, true)).join("");
        row2.innerHTML = r2.map(item => buildCardHTML(item, true)).join("");
        row3.innerHTML = r3.map(item => buildCardHTML(item, true)).join("");
      } else {
        section.classList.add("is-filtered");
        const matches = items.filter(p => p.category === filter);
        row1.innerHTML = matches.map(item => buildCardHTML(item, true)).join("");
      }
    }

    pills.forEach(pill => {
      pill.addEventListener("click", () => renderWork(pill.dataset.filter || "all"));
    });

    // Realistic Spring-Damped Falling & Un-Tilting Animation
    function animateSpringDrop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const sectionRect = section.getBoundingClientRect();
      const scrolledInside = Math.max(section.scrollTop || 0, window.scrollY || 0, Math.max(0, -sectionRect.top));

      // Target 0 -> 1 over the first 340px of scrolling down #work
      const targetDrop = Math.max(0, Math.min(1, scrolledInside / 340));
      // Target horizontal parallax drift across the whole section scroll
      const targetDrift = scrolledInside * 0.45;

      // Spring solver (stiffness = 180, damping = 24 for silky gravity-like fall)
      const stiffness = 180;
      const damping = 24;

      const forceDrop = (targetDrop - currentDrop) * stiffness;
      velocityDrop = (velocityDrop + forceDrop * dt) * Math.exp(-damping * dt);
      currentDrop += velocityDrop * dt;

      const forceDrift = (targetDrift - currentDrift) * 140;
      velocityDrift = (velocityDrift + forceDrift * dt) * Math.exp(-22 * dt);
      currentDrift += velocityDrift * dt;

      const p = Math.max(0, Math.min(1.05, currentDrop));

      // 1. Top Faded Cards: Drop downward behind the solid yellow wave as you scroll
      if (topPlane) {
        const topY = -10 + p * 340; // Falls behind the opaque yellow wave
        const topOpacity = 0.22 * (1 - Math.min(1, p * 1.15));
        topPlane.style.opacity = Math.max(0, topOpacity).toFixed(3);
        topPlane.style.transform = `translate3d(${(-currentDrift * 0.4).toFixed(1)}px, ${topY.toFixed(1)}px, 0px) rotateX(${(15 * (1 - p * 0.4)).toFixed(2)}deg) rotateZ(${(20 * (1 - p * 0.4)).toFixed(2)}deg) scale(0.95)`;
      }

      // 2. Yellow Section Cards: Fall from behind "Featured Works" (-320px -> 0px) & flatten 3D tilt (15deg/20deg -> 0deg)
      if (currentFilter === "all" && revealPlane) {
        const fallY = -320 * (1 - p);
        const rx = 15 * (1 - p);
        const rz = 20 * (1 - p);
        const sc = 0.92 + 0.08 * p;
        const op = p <= 0.02 ? 0 : Math.min(1, p * 1.35);

        revealPlane.style.opacity = op.toFixed(3);
        revealPlane.style.transform = `translate3d(0px, ${fallY.toFixed(1)}px, 0px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(3)})`;

        // Opposing horizontal row glide (Row 1 & 3 right-to-left, Row 2 left-to-right)
        row1.style.transform = `translate3d(${(-currentDrift - 40).toFixed(1)}px, 0, 0)`;
        row2.style.transform = `translate3d(${(currentDrift - 220).toFixed(1)}px, 0, 0)`;
        row3.style.transform = `translate3d(${(-currentDrift - 20).toFixed(1)}px, 0, 0)`;
      }

      requestAnimationFrame(animateSpringDrop);
    }

    renderWork("all");
    requestAnimationFrame(animateSpringDrop);

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
