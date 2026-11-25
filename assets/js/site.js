/* Portfolio interactions: mobile drawer, scroll-spy, dashboard lightbox. No dependencies. */
(function () {
  'use strict';

  /* ---------- mobile drawer ---------- */
  var sidebar = document.getElementById('sidebar');
  var menuBtn = document.querySelector('.menu-btn');
  var scrim = document.querySelector('.scrim');
  var mq = window.matchMedia('(max-width: 1023px)');

  function setDrawer(open) {
    if (!sidebar || !menuBtn) return;
    sidebar.classList.toggle('open', open);
    if (scrim) scrim.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = sidebar.querySelector('.sb-close');
      if (first) first.focus();
    }
  }
  function syncDrawerMode() {
    if (!sidebar) return;
    // On small screens the closed drawer is removed from the tab order.
    if (mq.matches) {
      if (!sidebar.classList.contains('open')) sidebar.setAttribute('inert', '');
    } else {
      sidebar.removeAttribute('inert');
      setDrawer(false);
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !sidebar.classList.contains('open');
      if (open) sidebar.removeAttribute('inert');
      setDrawer(open);
      if (!open) syncDrawerMode();
    });
  }
  document.querySelectorAll('[data-close-drawer]').forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(false); syncDrawerMode(); if (menuBtn) menuBtn.focus(); });
  });
  if (sidebar) {
    sidebar.querySelectorAll('.sb-nav a').forEach(function (a) {
      a.addEventListener('click', function () { if (mq.matches) { setDrawer(false); syncDrawerMode(); } });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      setDrawer(false); syncDrawerMode(); if (menuBtn) menuBtn.focus();
    }
  });
  if (mq.addEventListener) mq.addEventListener('change', syncDrawerMode); else if (mq.addListener) mq.addListener(syncDrawerMode);
  syncDrawerMode();

  /* ---------- scroll-spy (sidebar + top navigation) ---------- */
  var groups = [];
  document.querySelectorAll('[data-spy]').forEach(function (list) {
    var items = [];
    list.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) items.push({ link: a, target: target });
    });
    if (items.length) groups.push(items);
  });
  function spy() {
    var line = window.innerHeight * 0.35;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    groups.forEach(function (items) {
      var current = null;
      items.forEach(function (it) { if (it.target.getBoundingClientRect().top <= line) current = it; });
      if (atBottom) {
        // At the end of the page, short final sections cannot reach the line:
        // honour the section the visitor jumped to, otherwise use the last one.
        var hashed = null;
        items.forEach(function (it) { if ('#' + it.target.id === location.hash) hashed = it; });
        var r = hashed && hashed.target.getBoundingClientRect();
        current = (r && r.top >= 0 && r.top < window.innerHeight) ? hashed : items[items.length - 1];
      }
      items.forEach(function (it) {
        var on = it === current;
        it.link.classList.toggle('active', on);
        if (on) it.link.setAttribute('aria-current', 'location'); else it.link.removeAttribute('aria-current');
      });
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; spy(); }); }
  }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---------- dashboard lightbox ---------- */
  var lb = document.getElementById('lb');
  var items = Array.prototype.slice.call(document.querySelectorAll('#gallery .g-item'));
  if (!lb || !items.length) return;

  var stage = document.getElementById('lb-stage');
  var img = document.getElementById('lb-img');
  var title = document.getElementById('lb-title');
  var zoomBtn = document.getElementById('lb-zoom');
  var closeBtn = document.getElementById('lb-close');
  var index = 0, lastFocus = null;

  function setZoom(on, fx, fy) {
    stage.classList.toggle('zoom', on);
    zoomBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    zoomBtn.textContent = on ? 'Fit to screen' : 'Zoom in';
    if (on) {
      // keep the clicked point (fractions fx, fy of the image) near the centre
      stage.scrollLeft = (fx === undefined ? 0.5 : fx) * img.offsetWidth - stage.clientWidth / 2;
      stage.scrollTop = (fy === undefined ? 0.5 : fy) * img.offsetHeight - stage.clientHeight / 2;
    }
  }
  function show(n) {
    index = (n + items.length) % items.length;
    var item = items[index];
    setZoom(false);
    img.src = item.getAttribute('data-full');
    img.alt = item.querySelector('img').alt;
    title.textContent = 'Page ' + (index + 1) + ' of ' + items.length + ' · ' + item.querySelector('.cap b').textContent;
    var next = new Image(); // warm the next page
    next.src = items[(index + 1) % items.length].getAttribute('data-full');
  }
  function open(n) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    show(n);
    closeBtn.focus();
  }
  function close() {
    lb.classList.remove('open');
    lb.hidden = true;
    document.body.style.overflow = '';
    setZoom(false);
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (item, n) { item.addEventListener('click', function () { open(n); }); });
  document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });
  closeBtn.addEventListener('click', close);
  zoomBtn.addEventListener('click', function () { setZoom(!stage.classList.contains('zoom')); });
  img.addEventListener('click', function (e) {
    if (stage.classList.contains('zoom')) { setZoom(false); return; }
    var r = img.getBoundingClientRect();
    setZoom(true, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'Tab') { // keep focus inside the viewer
      var f = Array.prototype.slice.call(lb.querySelectorAll('button'));
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();
