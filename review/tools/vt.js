// Which pages hand a cross-document View Transition to the next, and does anything log an error?
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  console.log('chromium', b.version());
  for (const [from, sel, label] of [['/form-index/', '.topbar .back', 'form-index → rail via ← All doors'], ['/gallery/', '.back', 'gallery → rail via ← All doors']]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript(() => {
      window.addEventListener('pagereveal', e => { window.__vt = e.viewTransition ? 'got a transition' : 'none'; if (e.viewTransition) e.viewTransition.ready.then(() => window.__vtEnd = 'RAN', () => window.__vtEnd = 'skipped'); });
    });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://127.0.0.1:8765' + from, { waitUntil: 'networkidle' });
    await Promise.all([p.waitForNavigation(), p.click(sel)]);
    await p.waitForTimeout(1200);
    console.log(label, '| rail received:', await p.evaluate(() => window.__vt + ' / ' + (window.__vtEnd || '-')), '| errors:', JSON.stringify(errs));
    await ctx.close();
  }
  // and the doors, the other way
  for (const [nexts, label] of [[0, 'rail → form-index by door'], [1, 'rail → gallery by door']]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript(() => { window.addEventListener('pagereveal', e => { window.__vt = e.viewTransition ? 'got a transition' : 'none'; if (e.viewTransition) e.viewTransition.ready.then(() => window.__vtEnd = 'RAN', () => window.__vtEnd = 'skipped'); }); });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
    for (let k = 0; k < nexts; k++) { await p.click('#next'); await p.waitForTimeout(900); }
    await Promise.all([p.waitForNavigation(), p.click('#ca .go')]);
    await p.waitForTimeout(1500);
    console.log(label, '| arrived page received:', await p.evaluate(() => window.__vt + ' / ' + (window.__vtEnd || '-')), '| errors:', JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
})();
