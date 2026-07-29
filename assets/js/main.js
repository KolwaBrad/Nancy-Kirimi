/* =====================================================================
   Nancy Kirimi — Personal Portfolio
   1. Header state          4. Impact counters
   2. Mobile navigation     5. Portfolio filtering
   3. Scroll reveal         6. Gallery lightbox
   7. Footer year
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------- 1. Header state ---------------------- */
  var header = $('#siteHeader');

  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40);
  }

  /* ---------------------- 2. Mobile navigation -------------------- */
  var nav = $('#primaryNav');
  var navToggle = $('#navToggle');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNav(nav.classList.contains('is-open') === false);
    });

    // Any nav link closes the panel on small screens.
    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', function () { setNav(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Reset when the layout returns to the desktop breakpoint.
    var wide = window.matchMedia('(min-width: 1041px)');
    var onWide = function (e) { if (e.matches) setNav(false); };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); }
    else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ------------------------ 3. Scroll reveal ---------------------- */
  var revealables = $$('.reveal');

  revealables.forEach(function (el) {
    var d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', d);
  });

  function showAll() {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------- 4. Impact counters --------------------- */
  var counters = $$('[data-count-to]');

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (isNaN(target)) return;

    var duration = 1500;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(frame);
  }

  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }
  // Without observers the markup already carries the final value — nothing to do.

  /* --------------------- 5. Portfolio filtering ------------------- */
  var filters = $$('.filter');
  var workItems = $$('#workGrid .work');
  var filterStatus = $('#filterStatus');

  function applyFilter(key) {
    var shown = 0;

    workItems.forEach(function (item) {
      var cats = (item.getAttribute('data-cat') || '').split(/\s+/);
      var match = key === 'all' || cats.indexOf(key) !== -1;
      item.hidden = !match;
      if (match) shown++;
    });

    if (filterStatus) {
      filterStatus.textContent = shown + (shown === 1 ? ' project' : ' projects') + ' shown.';
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ----------------------- 6. Gallery lightbox -------------------- */
  var lightbox = $('#lightbox');
  var lbImage  = $('#lbImage');
  var lbCap    = $('#lbCaption');
  var lbClose  = $('#lbClose');
  var lbPrev   = $('#lbPrev');
  var lbNext   = $('#lbNext');
  var shots    = $$('.shot__btn');
  var lbIndex  = 0;
  var lastFocused = null;

  function renderSlide(i) {
    if (!shots.length) return;
    lbIndex = (i + shots.length) % shots.length;

    var btn = shots[lbIndex];
    var img = $('img', btn);

    lbImage.src = btn.getAttribute('data-full');
    lbImage.alt = img ? img.alt : '';
    lbCap.textContent = btn.getAttribute('data-caption') || '';
  }

  function openLightbox(i) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    renderSlide(i);
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-locked');

    var finish = function () {
      lightbox.hidden = true;
      lbImage.src = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    if (reduceMotion) finish();
    else window.setTimeout(finish, 300);
  }

  shots.forEach(function (btn, i) {
    btn.addEventListener('click', function () { openLightbox(i); });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { renderSlide(lbIndex - 1); });
    lbNext.addEventListener('click', function () { renderSlide(lbIndex + 1); });

    // Clicking the backdrop (but not the image or controls) closes the viewer.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;

      if (e.key === 'Escape')     { closeLightbox(); }
      if (e.key === 'ArrowLeft')  { renderSlide(lbIndex - 1); }
      if (e.key === 'ArrowRight') { renderSlide(lbIndex + 1); }

      // Keep focus inside the dialog while it is open.
      if (e.key === 'Tab') {
        var focusables = [lbClose, lbPrev, lbNext];
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (focusables.indexOf(document.activeElement) === -1) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* -------------------------- 7. Footer year ---------------------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------- Listeners ------------------------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { syncHeader(); ticking = false; });
  }, { passive: true });

  syncHeader();
})();
