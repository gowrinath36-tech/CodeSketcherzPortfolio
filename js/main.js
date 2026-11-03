(() => {
  const ids = ['hero', 'about', 'services', 'work', 'testimonial', 'contact', 'aboutus'];
  const panels = ids.map(id => document.getElementById(id));
  const contactForm = document.getElementById('contactForm');

  let currentIndex = -1;
  let hasNavigatedFromHero = false;
  let isTransitioning = false;
  let transitionTimeout = null;
  let pendingCurrent = null;
  let pendingTarget = null;
  let lenis = null;

  // 1. Smooth Momentum Scroll (Lenis) Sub-Scroller Management
  function destroyLenis() {
    if (lenis) {
      try {
        lenis.destroy();
      } catch (e) {
        console.warn('Lenis cleanup:', e);
      }
      lenis = null;
    }
  }

  function initLenis(activePanel) {
    destroyLenis();
    if (typeof Lenis === 'undefined' || !activePanel) return;

    const content = activePanel.querySelector('.panel-inner') || activePanel;

    lenis = new Lenis({
      wrapper: activePanel,
      content: content,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
  }

  function raf(time) {
    if (lenis) {
      lenis.raf(time);
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 2. UI Synchronization (Header Nav & Start-Here Callout)
  function syncUI(n, { historyMode = 'replace', hash = true } = {}) {
    // Start-here callout sits beside About link on hero only
    document.body.classList.toggle('start-here-visible', n === 0);

    // Active state on header navigation items
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.section === ids[n]);
    });

    // History and URL hash
    if (hash) {
      const targetHash = n === 0 ? '' : '#' + ids[n];
      if (historyMode === 'push') {
        history.pushState({ section: ids[n] }, '', targetHash || location.pathname + location.search);
      } else {
        history.replaceState({ section: ids[n] }, '', targetHash || location.pathname + location.search);
      }
    }
  }

  // 3. Finalize Transition State
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

      // Bind Lenis smooth momentum scrolling to the newly active panel
      initLenis(pendingTarget);
    }

    // Clean all inactive panels
    panels.forEach((p, i) => {
      if (i !== currentIndex) {
        p.classList.remove('active');
        p.style.display = 'none';
        p.style.visibility = 'hidden';
        p.style.transition = 'none';
        p.style.transform = '';
        p.setAttribute('aria-hidden', 'true');
      }
    });

    isTransitioning = false;
    pendingCurrent = null;
    pendingTarget = null;
  }

  // 4. Seamless Vertical Gliding Panel Transition
  function goToSection(to, { historyMode = 'replace', hash = true } = {}) {
    const targetIndex = typeof to === 'number' ? to : ids.indexOf(to);
    if (targetIndex < 0 || targetIndex >= ids.length) return;
    if (currentIndex !== -1 && targetIndex === currentIndex && panels[currentIndex].classList.contains('active') && !isTransitioning) return;

    // Initial boot: display target section immediately with zero slide animation
    if (currentIndex === -1) {
      currentIndex = targetIndex;
      panels.forEach((p, i) => {
        const isActive = (i === targetIndex);
        p.classList.toggle('active', isActive);
        p.style.display = isActive ? 'block' : 'none';
        p.style.visibility = isActive ? 'visible' : 'hidden';
        p.style.transform = '';
        p.style.transition = '';
        p.setAttribute('aria-hidden', String(!isActive));
        if (isActive) {
          p.scrollTop = 0;
          initLenis(p);
        }
      });
      syncUI(targetIndex, { historyMode, hash });
      return;
    }

    // If an animation is already running, complete it immediately
    if (isTransitioning) {
      finalizeTransition();
    }

    const currentPanel = panels[currentIndex];
    const targetPanel = panels[targetIndex];
    const isForward = targetIndex > currentIndex;

    currentIndex = targetIndex;
    syncUI(targetIndex, { historyMode, hash });

    // Fallback instant load if panel is missing or identical
    if (!currentPanel || currentPanel === targetPanel) {
      panels.forEach((p, i) => {
        const isActive = (i === targetIndex);
        p.classList.toggle('active', isActive);
        p.style.display = isActive ? 'block' : 'none';
        p.style.visibility = isActive ? 'visible' : 'hidden';
        p.style.transform = '';
        p.style.transition = '';
        p.setAttribute('aria-hidden', String(!isActive));
        if (isActive) {
          p.scrollTop = 0;
          initLenis(p);
        }
      });
      return;
    }

    // Prefers reduced motion: instant switch
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      destroyLenis();
      panels.forEach((p, i) => {
        const isActive = (i === targetIndex);
        p.classList.toggle('active', isActive);
        p.style.display = isActive ? 'block' : 'none';
        p.style.visibility = isActive ? 'visible' : 'hidden';
        p.style.transform = '';
        p.style.transition = '';
        p.setAttribute('aria-hidden', String(!isActive));
        if (isActive) {
          p.scrollTop = 0;
          initLenis(p);
        }
      });
      return;
    }

    // Pause current Lenis before animating
    destroyLenis();

    isTransitioning = true;
    pendingCurrent = currentPanel;
    pendingTarget = targetPanel;

    // Attach target immediately below or above current viewport
    const targetStart = isForward ? 'translateY(100%)' : 'translateY(-100%)';
    const currentEnd = isForward ? 'translateY(-100%)' : 'translateY(100%)';

    targetPanel.classList.remove('active');
    targetPanel.style.display = 'block';
    targetPanel.style.visibility = 'visible';
    targetPanel.style.transition = 'none';
    targetPanel.style.transform = targetStart;
    targetPanel.style.zIndex = '3';
    targetPanel.scrollTop = 0;
    targetPanel.setAttribute('aria-hidden', 'false');

    currentPanel.style.display = 'block';
    currentPanel.style.visibility = 'visible';
    currentPanel.style.transition = 'none';
    currentPanel.style.transform = 'translateY(0)';
    currentPanel.style.zIndex = '2';

    // Force reflow to commit initial styles
    void targetPanel.offsetHeight;
    void currentPanel.offsetHeight;

    // Lockstep vertical gliding animation over 650ms
    const transitionVal = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
    targetPanel.style.transition = transitionVal;
    currentPanel.style.transition = transitionVal;

    targetPanel.style.transform = 'translateY(0)';
    currentPanel.style.transform = currentEnd;

    transitionTimeout = setTimeout(() => {
      finalizeTransition();
    }, 650);
  }

  // 5. Event Listeners

  // Header and Footer Section Links
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.section;
      if (!hasNavigatedFromHero && target !== 'hero') {
        hasNavigatedFromHero = true;
        goToSection(target, { historyMode: 'push' });
      } else {
        if (target === 'hero') hasNavigatedFromHero = false;
        goToSection(target, { historyMode: 'replace' });
      }
    });
  });

  // In-Page Next Section Buttons
  document.querySelectorAll('[data-next-target]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.nextTarget;
      if (target) {
        if (!hasNavigatedFromHero && target !== 'hero') {
          hasNavigatedFromHero = true;
          goToSection(target, { historyMode: 'push' });
        } else {
          if (target === 'hero') hasNavigatedFromHero = false;
          goToSection(target, { historyMode: 'replace' });
        }
      }
    });
  });

  // Browser History Navigation (Back / Forward)
  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    const target = ids.includes(hash) ? hash : 'hero';
    if (target === 'hero') hasNavigatedFromHero = false;
    else hasNavigatedFromHero = true;
    goToSection(target, { hash: false });
  });

  // Keyboard Arrow / PageDown Navigation
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input,textarea,select')) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < ids.length - 1) {
        if (!hasNavigatedFromHero) {
          hasNavigatedFromHero = true;
          goToSection(currentIndex + 1, { historyMode: 'push' });
        } else {
          goToSection(currentIndex + 1, { historyMode: 'replace' });
        }
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        goToSection(currentIndex - 1, { historyMode: 'replace' });
      }
      return;
    }

    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      const panel = panels[currentIndex];
      if (!panel) return;
      const atBottom = Math.ceil(panel.scrollTop + panel.clientHeight) >= panel.scrollHeight;
      if (atBottom && currentIndex < ids.length - 1) {
        e.preventDefault();
        if (!hasNavigatedFromHero) {
          hasNavigatedFromHero = true;
          goToSection(currentIndex + 1, { historyMode: 'push' });
        } else {
          goToSection(currentIndex + 1, { historyMode: 'replace' });
        }
      }
      return;
    }

    if (['ArrowUp', 'PageUp'].includes(e.key)) {
      const panel = panels[currentIndex];
      if (!panel) return;
      const atTop = panel.scrollTop <= 0;
      if (atTop && currentIndex > 0) {
        e.preventDefault();
        goToSection(currentIndex - 1, { historyMode: 'replace' });
      }
      return;
    }
  });

  // Initial Section Load
  const initialHash = location.hash.slice(1);
  const startSection = ids.includes(initialHash) ? initialHash : 'hero';
  if (startSection !== 'hero') {
    hasNavigatedFromHero = true;
  }
  goToSection(startSection, { hash: false });

  // 6. Contact Form Submission Handler
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(e.currentTarget);
      const subject = encodeURIComponent('Studio enquiry from ' + d.get('name'));
      const body = encodeURIComponent('Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('message'));
      window.location.href = 'mailto:hello@codesketchers.studio?subject=' + subject + '&body=' + body;
    });
  }
})();
