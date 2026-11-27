// LeafWorks Software: site interactions
(function () {
  document.documentElement.classList.add('js');

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Buttons with data-interest pre-select the form dropdown
  var interest = document.getElementById('interest');
  document.querySelectorAll('[data-interest]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-interest');
      for (var i = 0; i < interest.options.length; i++) {
        if (interest.options[i].text === value) { interest.selectedIndex = i; break; }
      }
    });
  });

  // Contact form
  var EMAIL = 'hello@leafworkssoftware.ca';
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form-status');
  var submit = form.querySelector('button[type="submit"]');

  function setStatus(msg, cls) {
    status.textContent = msg;
    status.className = 'form-status' + (cls ? ' ' + cls : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var valid = field.value.trim() !== '' && (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
      field.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { setStatus('Please fill in your name, a valid email and a message.', 'err'); return; }
    if (form.querySelector('.hp').value) return; // spam bot

    var data = new FormData(form);

    // No Formspree ID yet: fall back to opening the visitor's email app
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      var body =
        'Name: ' + data.get('name') + '\n' +
        'Business: ' + (data.get('business') || '-') + '\n' +
        'Email: ' + data.get('email') + '\n' +
        'Interested in: ' + data.get('interest') + '\n\n' +
        data.get('message');
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Website enquiry: ' + data.get('interest')) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app…', 'ok');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';
    setStatus('');

    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        setStatus('Thanks! Your message has been sent. We\'ll be in touch within one business day.', 'ok');
      })
      .catch(function () {
        setStatus('Something went wrong. Please email us directly at ' + EMAIL + '.', 'err');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
  });

  form.querySelectorAll('input, textarea').forEach(function (f) {
    f.addEventListener('input', function () { f.classList.remove('invalid'); });
  });
})();
