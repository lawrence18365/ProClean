document.addEventListener('DOMContentLoaded', () => {
  // Controlled, not-too-slow initial reveal
  const HERO_URL = document.body.classList.contains('home')
    ? 'https://i.postimg.cc/kXjd4WYB/Pro-Clean-One-Backgroun.jpg'
    : 'alt_hero_image.png';
  const MAX_WAIT_MS = 1500;   // never wait longer than this before reveal
  const MIN_HOLD_MS = 200;    // ensure we don't reveal instantly on very fast loads
  const FADE_DURATION = 0.8;  // seconds for the reveal animation

  const startTime = performance.now();
  function timeSinceStart() { return performance.now() - startTime; }

  function revealSite() {
    if (!document.body.classList.contains('preload')) return; // already revealed
    if (window.gsap) {
      gsap.to(document.body, { opacity: 1, duration: FADE_DURATION, ease: 'power2.out', onComplete: () => {
        document.body.classList.remove('preload');
        document.body.style.opacity = '';
      }});
    } else {
      // Fallback without GSAP: rely on CSS transition if present
      document.body.classList.remove('preload');
    }
  }

  // Preload hero background image (same as CSS) and then reveal
  const img = new Image();
  let revealed = false;
  function maybeReveal() {
    if (revealed) return;
    revealed = true;
    const remaining = Math.max(0, MIN_HOLD_MS - timeSinceStart());
    setTimeout(revealSite, remaining);
  }
  img.onload = maybeReveal;
  img.onerror = maybeReveal;
  img.src = HERO_URL;
  // Fallback: reveal after MAX_WAIT_MS regardless
  setTimeout(maybeReveal, MAX_WAIT_MS);
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.setAttribute('aria-controls', 'primary-navigation');
    mobileNavToggle.setAttribute('aria-expanded', 'false');

    mobileNavToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a link is clicked, except the dropdown trigger
    navLinks.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', (e) => {
        // If this is the SERVICE AREAS dropdown trigger, don't close the menu
        const isDropdownTrigger = item.closest('.dropdown') && !item.closest('.dropdown-menu');
        if (isDropdownTrigger) return;

        // Use the same breakpoint as CSS nav collapse (1200px)
        if (window.innerWidth <= 1200) {
          navLinks.classList.remove('active');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      const isClickInsideNav = navLinks.contains(event.target);
      const isClickOnToggle = mobileNavToggle.contains(event.target);
      if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Suburbs dropdown (desktop click + mobile inline)
  const dropdown = document.querySelector('.nav-links .dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('a');
    const menu = dropdown.querySelector('.dropdown-menu');
    function closeAll() { dropdown.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', (e) => {
      // On mobile, this simply expands inline; on desktop it's a dropdown
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) closeAll();
    });
    // Basic keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && !dropdown.classList.contains('open')) {
        e.preventDefault();
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        const first = menu?.querySelector('a');
        first && first.focus();
      }
    });
  }

  // Smooth scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (window.gsap && window.ScrollToPlugin) {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, offsetY: 70 },
          ease: 'power2.inOut'
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // GSAP animations
  if (window.gsap) {
    if (gsap.registerPlugin && window.ScrollTrigger && window.ScrollToPlugin) {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    }
    gsap.to('.hero', {
      backgroundPosition: '50% 70%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

  }
});
