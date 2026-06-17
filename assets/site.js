/* Spire Tome — shared site behaviour
   - Hamburger (menu icon) opens a slide-in navigation drawer
   - "Spire Tome" / brand in the top bar links to the home page
   - Search inputs filter the entries on the current page live
*/
(function () {
  if (window.__sptInit) return;
  window.__sptInit = true;

  var PAGES = [
    ['index.html', 'Home'],
    ['characters.html', 'Characters'],
    ['necrobinder-cards.html', 'Cards'],
    ['necrobinder-keywords.html', 'Keywords'],
    ['relics.html', 'Relics'],
    ['relic-pool.html', 'Relic Pool'],
    ['symbols.html', 'Symbols'],
    ['glossary.html', 'Glossary'],
    ['bestiary.html', 'Bestiary'],
    ['boss-patterns.html', 'Boss Patterns'],
    ['map-events.html', 'Map & Events'],
    ['merchant.html', 'Merchant'],
    ['strategies.html', 'Strategies'],
    ['poison-strategy.html', 'Poison Strategy'],
    ['daily-challenges.html', 'Daily Challenges'],
    ['ascension-levels.html', 'Ascension Levels'],
    ['achievements.html', 'Achievements'],
    ['character-achievements.html', 'Character Achievements'],
    ['meta-progression.html', 'Meta-Progression'],
    ['hud.html', 'HUD & Exploration'],
    ['custom-run.html', 'Custom Run']
  ];

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    /* ---------- Slide-in navigation drawer ---------- */
    var overlay = document.createElement('div');
    overlay.id = 'spt-menu-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(13,26,21,.7);' +
      'backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .25s';

    var panel = document.createElement('nav');
    panel.style.cssText =
      'position:absolute;top:0;left:0;height:100%;width:300px;max-width:85%;' +
      'background:#1f1a1a;border-right:1px solid rgba(231,196,66,.3);' +
      'transform:translateX(-100%);transition:transform .3s;display:flex;' +
      'flex-direction:column;padding:24px;overflow-y:auto;box-shadow:0 0 40px rgba(0,0,0,.5)';

    var head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:24px';
    var brandSpan = document.createElement('span');
    brandSpan.textContent = 'Spire Tome';
    brandSpan.style.cssText = "font-family:'EB Garamond',serif;font-size:24px;font-weight:700;color:#e7c442";
    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'background:none;border:none;color:#c2c8c3;font-size:28px;line-height:1;cursor:pointer';
    head.appendChild(brandSpan);
    head.appendChild(closeBtn);
    panel.appendChild(head);

    PAGES.forEach(function (p) {
      var a = document.createElement('a');
      a.href = p[0];
      a.textContent = p[1];
      var active = p[0] === current;
      a.style.cssText =
        'display:block;padding:10px 12px;border-radius:8px;margin-bottom:4px;' +
        "text-decoration:none;font-family:'Hanken Grotesk',sans-serif;font-size:15px;" +
        'color:' + (active ? '#e7c442' : '#ebe0e0') + ';' +
        'background:' + (active ? 'rgba(231,196,66,.12)' : 'transparent') + ';' +
        (active ? 'border-left:3px solid #e7c442;' : 'border-left:3px solid transparent;');
      a.addEventListener('mouseenter', function () { if (!active) a.style.background = 'rgba(231,196,66,.08)'; });
      a.addEventListener('mouseleave', function () { if (!active) a.style.background = 'transparent'; });
      panel.appendChild(a);
    });

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function openMenu() {
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
      panel.style.transform = 'translateX(0)';
    }
    function closeMenu() {
      overlay.style.opacity = '0';
      panel.style.transform = 'translateX(-100%)';
      setTimeout(function () { overlay.style.visibility = 'hidden'; }, 250);
    }
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    /* ---------- Wire up hamburger icons (override page-specific handlers) ---------- */
    document.querySelectorAll('.material-symbols-outlined').forEach(function (ic) {
      if ((ic.textContent || '').trim() === 'menu') {
        var clickable = ic.closest('button, a') || ic;
        clickable.classList.add('spt-ham');
        clickable.style.cursor = 'pointer';
      }
    });
    document.addEventListener('click', function (e) {
      var h = e.target.closest('.spt-ham');
      if (h) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openMenu();
      }
    }, true);

    /* ---------- Brand in the top bar links home ---------- */
    var brand = document.querySelector('header h1, header .font-headline, nav h1, nav .font-headline');
    if (brand) {
      brand.style.cursor = 'pointer';
      brand.setAttribute('title', 'Back to Home');
      brand.addEventListener('click', function () { location.href = 'index.html'; });
    }

    /* ---------- Enable search bars (live filter on the current page) ---------- */
    var SELECTOR = [
      'main .bento-card', 'main article', 'main .achievement-card',
      'main .modifier-card', 'main .glossary-card-hover', 'main .relic-card-glow',
      'main .group'
    ].join(',');

    function filterEntries(term) {
      term = (term || '').trim().toLowerCase();
      var seen = [];
      document.querySelectorAll(SELECTOR).forEach(function (el) {
        if (seen.indexOf(el) > -1) return;
        seen.push(el);
        if (!term) { el.style.display = ''; return; }
        var txt = (el.textContent || '').toLowerCase();
        el.style.display = txt.indexOf(term) > -1 ? '' : 'none';
      });
    }

    document.querySelectorAll('input[type="text"], input:not([type])').forEach(function (inp) {
      inp.addEventListener('input', function () { filterEntries(inp.value); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); filterEntries(inp.value); }
      });
    });
  });
})();
