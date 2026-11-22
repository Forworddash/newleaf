// New Leaf Software: site interactions
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

  // Hero terminal: types out a short "session"
  var term = document.getElementById('terminal');
  if (term) {
    var script = [
      { cmd: 'newleaf launch website --pages 5' },
      { out: '  building mobile-friendly pages ...', cls: 't-dim' },
      { out: '  adding click-to-call, map & booking form ...', cls: 't-dim' },
      { out: '✓ live at https://yourbusiness.com', cls: 't-ok' },
      { cmd: 'newleaf setup email --domain yourbusiness.com' },
      { out: '✓ you@yourbusiness.com ready (SPF · DKIM · DMARC)', cls: 't-ok' },
      { cmd: 'newleaf automate quote → booking → invoice' },
      { out: '✓ automation running · ~6 hrs/week saved', cls: 't-ok' },
      { cmd: '' }
    ];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    term.innerHTML = '';

    var line = function (html) {
      var p = document.createElement('p');
      p.innerHTML = html;
      term.appendChild(p);
      return p;
    };
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

    if (reduce) {
      script.forEach(function (s) {
        if ('cmd' in s) line('<span class="t-prompt">$</span>' + esc(s.cmd));
        else line('<span class="' + s.cls + '">' + esc(s.out) + '</span>');
      });
    } else {
      var i = 0;
      var next = function () {
        if (i >= script.length) return;
        var s = script[i++];
        if ('cmd' in s) {
          var p = line('<span class="t-prompt">$</span><span class="typed"></span><span class="cursor"></span>');
          var typed = p.querySelector('.typed');
          var c = 0;
          var type = function () {
            if (c < s.cmd.length) {
              typed.textContent += s.cmd[c++];
              setTimeout(type, 28 + Math.random() * 40);
            } else if (i < script.length) {
              p.querySelector('.cursor').remove();
              setTimeout(next, 350);
            }
          };
          setTimeout(type, 400);
        } else {
          line('<span class="' + s.cls + '">' + esc(s.out) + '</span>');
          setTimeout(next, s.cls === 't-ok' ? 500 : 380);
        }
      };
      // Start typing when the terminal scrolls into view
      if ('IntersectionObserver' in window) {
        var tio = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { tio.disconnect(); next(); }
        }, { threshold: 0.3 });
        tio.observe(term);
      } else { next(); }
    }
  }

  // Cursor-follow glow on service tiles
  document.querySelectorAll('.tile').forEach(function (tile) {
    tile.addEventListener('pointermove', function (e) {
      var r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

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
  var EMAIL = 'hello@newleafsoftware.com';
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
