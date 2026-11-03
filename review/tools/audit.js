// Site audit: every page × every world × phone/phone/desktop, plus links, tap targets, focus, world persistence, door walk-throughs.
// usage: node audit.js <base-url> <shots-dir> <out.json>
const { chromium } = require('playwright');
const fs = require('fs');
const [BASE, SHOTS, OUT] = process.argv.slice(2);
const PAGES = ['/', '/gallery/', '/form-index/', '/soulprint/'];
const WORLDS = ['washi', 'night', 'day', 'dawn', 'autumn'];
const DEVICES = {
  'phone-375': { viewport: { width: 375, height: 667 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'phone-390': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'desktop': { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 }
};
const slug = p => p === '/' ? 'rail' : p.replace(/\//g, '');
fs.mkdirSync(SHOTS, { recursive: true });

function watch(page, bag) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bag.console.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => bag.console.push('pageerror: ' + String(e).slice(0, 300)));
  page.on('requestfailed', r => { const u = r.url(); if (!/\.mp4($|\?)/.test(u)) bag.network.push('failed ' + (r.failure() || {}).errorText + ' ' + u); });
  page.on('response', r => { if (r.status() >= 400) bag.network.push(r.status() + ' ' + r.url()); });
}
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } window.scrollTo(0, 0); });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(900);
}
const overflowProbe = () => {
  const vw = document.documentElement.clientWidth, out = [];
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.position === 'fixed' && el.getAttribute('aria-hidden') === 'true') continue;
    let a = el.parentElement, clipped = false;
    while (a && a !== document.body && a !== document.documentElement) {
      const ac = getComputedStyle(a);
      if (ac.overflowX !== 'visible' || ac.overflow !== 'visible' || ac.clipPath !== 'none' || ac.contain.includes('paint')) { const ar = a.getBoundingClientRect(); if (ar.right <= vw + 1 && ar.left >= -1) { clipped = true; break; } }
      a = a.parentElement;
    }
    if (!clipped) out.push(name(el) + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ' of ' + vw + ']');
  }
  return out;
};
const imageProbe = () => [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'));

(async () => {
  const b = await chromium.launch();
  const R = { combos: [], links: {}, targets: {}, focus: {}, persistence: [], doors: [], manifests: {} };

  // ---- every page × world × device ----
  for (const path of PAGES) for (const world of WORLDS) for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await b.newContext(opts);
    await ctx.addInitScript(w => { try { if (!sessionStorage.getItem('audit-seeded')) { localStorage.setItem('doorrail-world', w); sessionStorage.setItem('audit-seeded', '1'); } } catch (e) {} }, world);
    const page = await ctx.newPage();
    const bag = { console: [], network: [] };
    watch(page, bag);
    await page.goto(BASE + path, { waitUntil: 'load' });
    await settle(page);
    const m = await page.evaluate(() => ({ iw: innerWidth, cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, world: document.documentElement.getAttribute('data-world') || 'night', pressed: (document.querySelector('.world-btn[aria-pressed="true"]') || {}).dataset?.world || null }));
    const offenders = await page.evaluate(overflowProbe);
    const broken = await page.evaluate(imageProbe);
    const shot = `${SHOTS}/${slug(path)}--${world}--${dev}.png`;
    await page.screenshot({ path: shot });
    if (path === '/form-index/') {
      await page.evaluate(() => { const g = document.getElementById('forms'); window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 70); });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SHOTS}/form-index-cards--${world}--${dev}.png` });
    }
    R.combos.push({ page: path, world, device: dev, width: opts.viewport.width, innerWidth: m.iw, scrollWidth: m.sw, dataWorld: m.world, pressed: m.pressed, offenders: offenders.slice(0, 8), offenderCount: offenders.length, broken, console: bag.console, network: bag.network, shot });
    process.stdout.write('.');
    await ctx.close();
  }
  console.log(' combos done');

  // ---- links, tap targets and focus, once per page ----
  for (const path of PAGES) {
    const ctx = await b.newContext(DEVICES['phone-375']);
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await settle(page);
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({ href: a.getAttribute('href'), abs: a.href, text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40), target: a.target, rel: a.rel })));
    const checked = [];
    for (const l of links) {
      let status = null;
      if (l.href.startsWith('#')) status = await page.evaluate(id => id === '#' || !!document.getElementById(id.slice(1)) ? 'anchor ok' : 'MISSING ANCHOR', l.href);
      else if (l.abs.startsWith(BASE)) { const res = await ctx.request.get(l.abs).catch(e => null); status = res ? res.status() : 'ERR'; }
      else status = 'external';
      checked.push({ ...l, status });
    }
    R.links[path] = checked;
    R.targets[path] = await page.evaluate(() => {
      const small = [];
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), summary')) {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!r.width || !r.height || cs.visibility === 'hidden') continue;
        if (el.closest('[hidden],[inert]')) continue;
        let w = r.width, h = r.height;
        const after = getComputedStyle(el, '::after');
        if (after.content !== 'none' && after.position === 'absolute') { const c = el.closest('.form-card'); if (c) { const cr = c.getBoundingClientRect(); w = cr.width; h = cr.height; } }
        for (const pe of ['::before', '::after']) {   // an invisible pseudo-element that widens the hit area
          const ps = getComputedStyle(el, pe);
          if (ps.content === 'none' || ps.position !== 'absolute' || cs.position === 'static') continue;
          const L = -parseFloat(ps.left) || 0, T = -parseFloat(ps.top) || 0, Rr = -parseFloat(ps.right) || 0, B = -parseFloat(ps.bottom) || 0;
          if (L > 0 || T > 0) { w = Math.max(w, r.width + Math.max(0, L) + Math.max(0, Rr)); h = Math.max(h, r.height + Math.max(0, T) + Math.max(0, B)); }
        }
        const inline = cs.display === 'inline' && el.closest('p, li, td') && (el.closest('p, li, td').textContent.trim().length > el.textContent.trim().length + 3);
        if ((w < 44 || h < 44) && !inline) small.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + ' "' + (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim().slice(0, 28) + '" ' + Math.round(w) + '×' + Math.round(h));
      }
      return small;
    });
    await ctx.close();
    // focus: tab through on desktop and see that each stop shows something
    const dctx = await b.newContext(DEVICES.desktop);
    const dp = await dctx.newPage();
    await dp.goto(BASE + path, { waitUntil: 'networkidle' });
    await dp.waitForTimeout(500);
    const stops = [];
    for (let i = 0; i < 45; i++) {
      await dp.keyboard.press('Tab');
      const s = await dp.evaluate(() => {
        const a = document.activeElement; if (!a || a === document.body) return null;
        const cs = getComputedStyle(a), af = getComputedStyle(a, '::after'), bf = getComputedStyle(a, '::before');
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none' || (af.outlineStyle !== 'none' && parseFloat(af.outlineWidth) > 0) || (bf.outlineStyle !== 'none' && parseFloat(bf.outlineWidth) > 0);
        // a frame focus ring on the rail lives on a child (.slot:focus-visible .frame)
        const child = a.querySelector && a.querySelector('.frame'); const childRing = child && getComputedStyle(child).boxShadow.includes('rgb');
        return { name: a.tagName.toLowerCase() + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') + ' "' + (a.getAttribute('aria-label') || a.textContent || a.placeholder || '').trim().slice(0, 24) + '"', ring: ring || !!childRing };
      });
      if (!s) break; if (stops.length && stops[0].name === s.name) break;
      stops.push(s);
    }
    R.focus[path] = { stops: stops.length, noRing: stops.filter(s => !s.ring).map(s => s.name) };
    await dctx.close();
  }
  console.log('links/targets/focus done');

  // ---- art files referenced by data (gallery manifest + forms) ----
  {
    const ctx = await b.newContext();
    const man = await (await ctx.request.get(BASE + '/gallery/manifest.json')).json();
    const files = [...new Set(man.pieces.flatMap(p => [p.file, p.poster].filter(Boolean)))];
    const bad = [];
    for (const f of files) { const r = await ctx.request.head(BASE + '/gallery/' + f); if (r.status() !== 200) bad.push(r.status() + ' ' + f); }
    R.manifests.gallery = { files: files.length, bad };
    const page = await ctx.newPage(); await page.goto(BASE + '/form-index/');
    const imgs = await page.evaluate(() => FORMS.map(f => f.image));
    const badF = [];
    for (const f of imgs) { const r = await ctx.request.head(new URL(f, BASE + '/form-index/').href); if (r.status() !== 200) badF.push(r.status() + ' ' + f); }
    R.manifests.forms = { files: imgs.length, bad: badF, count: await page.evaluate(() => [FORMS.length, document.getElementById('form-count').textContent, document.querySelectorAll('.form-card').length]) };
    await ctx.close();
  }

  // ---- world persistence: pick on one page, arrive on the next ----
  for (const dev of ['phone-375', 'desktop']) for (const [i, w] of WORLDS.entries()) {
    const ctx = await b.newContext(DEVICES[dev]);
    const page = await ctx.newPage();
    const bag = { console: [], network: [] }; watch(page, bag);
    const w2 = WORLDS[(i + 1) % 5], w3 = WORLDS[(i + 2) % 5];
    const steps = [];
    const read = () => page.evaluate(() => ({ attr: document.documentElement.getAttribute('data-world') || 'night', pressed: (document.querySelector('.world-btn[aria-pressed="true"]') || {}).dataset?.world }));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.click(`.world-btn[data-world="${w}"]`); await page.waitForTimeout(700);
    await page.goto(BASE + '/gallery/', { waitUntil: 'networkidle' }); let r1 = await read(); steps.push(['rail→gallery', w, r1]);
    await page.click(`.world-btn[data-world="${w2}"]`); await page.waitForTimeout(300);
    await page.goto(BASE + '/form-index/', { waitUntil: 'networkidle' }); let r2 = await read(); steps.push(['gallery→form-index', w2, r2]);
    await page.click(`.world-btn[data-world="${w3}"]`); await page.waitForTimeout(700);
    await page.goto(BASE + '/', { waitUntil: 'networkidle' }); let r3 = await read(); steps.push(['form-index→rail', w3, r3]);
    await page.goBack({ waitUntil: 'networkidle' }); let r4 = await read(); steps.push(['back to form-index', w3, r4]);
    const ok = steps.every(s => s[2].attr === s[1] && s[2].pressed === s[1]);
    R.persistence.push({ device: dev, start: w, ok, steps, console: bag.console });
    await ctx.close();
  }
  console.log('persistence done');

  // ---- walking through the doors ----
  for (const dev of ['phone-375', 'desktop']) for (const [label, nexts, dest] of [['Form Index', 0, '/form-index/'], ["The Fox's Gallery", 1, '/gallery/']]) {
    const ctx = await b.newContext(DEVICES[dev]);
    // note, on every page, whether a door left a note and whether the arrival light was laid over the page
    await ctx.addInitScript(() => {
      try { window.__doorNote = sessionStorage.getItem('mm-door'); } catch (e) {}
      window.__arrival = false;
      new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.tagName === 'DIV' && n.style && n.style.zIndex === '2147483647') window.__arrival = n.style.background || true; }).observe(document, { childList: true, subtree: true });
    });
    const page = await ctx.newPage();
    const bag = { console: [], network: [] }; watch(page, bag);
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    for (let k = 0; k < nexts; k++) { await page.click('#next'); await page.waitForTimeout(900); }
    const cap = await page.textContent('#cn');
    const arrival = page.waitForNavigation({ waitUntil: 'commit' });
    const go = page.locator('#ca .go');
    if (dev === 'desktop') await go.click(); else await go.tap();
    await arrival;
    await page.waitForLoadState('domcontentloaded');
    const overlay = await page.evaluate(() => ({ note: window.__doorNote, light: window.__arrival }));
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1300);
    const landed = new URL(page.url()).pathname;
    const overlayGone = await page.evaluate(() => ![...document.documentElement.children].find(e => e.tagName === 'DIV' && e.style.zIndex === '2147483647'));
    await page.goBack({ waitUntil: 'load' }); await page.waitForTimeout(1000);
    const back = await page.evaluate(() => ({ path: location.pathname, flood: document.getElementById('flood').className, floodBg: document.getElementById('flood').style.background, open: document.querySelectorAll('.slot.open').length }));
    R.doors.push({ device: dev, door: label, caption: cap, landed, expected: dest, arrivalOverlay: overlay, overlayGone, back, console: bag.console });
    await ctx.close();
  }
  console.log('doors done');
  // ---- every gallery room on a small phone ----
  R.rooms = [];
  for (const room of ['pixel', 'poem', 'atelier', 'blender']) {
    const ctx = await b.newContext(DEVICES['phone-375']);
    const page = await ctx.newPage(); const bag = { console: [], network: [] }; watch(page, bag);
    await page.goto(BASE + '/gallery/#' + room, { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
    for (let k = 0; k < 3; k++) { if (await page.$eval('#next', x => x.disabled)) break; await page.tap('#next'); await page.waitForTimeout(500); }
    const m = await page.evaluate(() => ({ iw: innerWidth, sw: document.documentElement.scrollWidth, lit: document.querySelectorAll('.piece.lit').length, where: document.getElementById('wc').textContent }));
    const off = await page.evaluate(overflowProbe);
    R.rooms.push({ room, ...m, offenders: off.slice(0, 5), console: bag.console, network: bag.network });
    await ctx.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
  await b.close();
})();
