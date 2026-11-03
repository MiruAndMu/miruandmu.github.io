// Snapshot every word the Form Index shows: page text, each card, each close-up/modal, plus the raw data.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' })).newPage();
  await p.goto('http://127.0.0.1:8765/form-index/', { waitUntil: 'networkidle' });
  const data = await p.evaluate(() => ({ FORMS, GUIDESTONES }));
  const text = await p.evaluate(() => document.body.innerText);
  const modals = [];
  const opener = process.argv[3] || '.form-card';
  const n = await p.locator(opener).count();
  for (let i = 0; i < n; i++) {
    await p.locator(opener).nth(i).click();
    await p.waitForTimeout(150);
    const dlg = process.argv[4] || '#modal';
    modals.push(await p.locator(dlg).innerText());
    await p.keyboard.press('Escape');
    await p.waitForTimeout(150);
  }
  require('fs').writeFileSync(process.argv[2], JSON.stringify({ data, text, modals }, null, 1));
  console.log('cards', n, 'modals', modals.length, 'text chars', text.length);
  await b.close();
})();
