// Turn an audit JSON into markdown tables.
const R = JSON.parse(require('fs').readFileSync(process.argv[2]));
const WORLDS = ['washi', 'night', 'day', 'dawn', 'autumn'];
const out = [];
const cell = c => {
  const bits = [];
  if (c.innerWidth !== c.width || c.scrollWidth > c.width) bits.push(`overflow ${c.scrollWidth}px`);
  else if (c.offenderCount) bits.push(`hidden overflow (${c.offenderCount})`);
  const env = s => /fonts\.g(oogleapis|static)\.com/.test(s);
  const errs = c.console.filter(s => !env(s)), net = c.network.filter(s => !env(s));
  if (errs.length) bits.push(`${errs.length} console`);
  if (net.length) bits.push(`${net.length} network`);
  if (c.broken.length) bits.push(`${c.broken.length} broken img`);
  const want = c.world;
  if (c.page !== '/soulprint/' && c.dataWorld !== want) bits.push(`world ${c.dataWorld}≠${want}`);
  if (c.page !== '/soulprint/' && c.pressed !== want) bits.push(`chip ${c.pressed}`);
  return bits.length ? '⚠ ' + bits.join(', ') : '✓';
};
out.push('| Page | Device | ' + WORLDS.join(' | ') + ' |');
out.push('|---|---|' + WORLDS.map(() => '---').join('|') + '|');
const pages = [...new Set(R.combos.map(c => c.page))], devs = [...new Set(R.combos.map(c => c.device))];
for (const p of pages) for (const d of devs) {
  out.push(`| \`${p}\` | ${d} | ` + WORLDS.map(w => cell(R.combos.find(c => c.page === p && c.device === d && c.world === w))).join(' | ') + ' |');
}
out.push('\nDETAILS');
for (const c of R.combos) { const s = cell(c); if (s !== '✓') out.push(`- ${c.page} ${c.device} ${c.world}: ${s}\n    offenders: ${c.offenders.join('; ')}\n    console: ${c.console.join(' || ')}\n    network: ${c.network.join(' || ')}\n    broken: ${c.broken.join(', ')}`); }
out.push('\nLINKS');
for (const [p, ls] of Object.entries(R.links)) { const bad = ls.filter(l => typeof l.status === 'number' ? l.status !== 200 : /MISSING|ERR/.test(l.status)); out.push(`- ${p}: ${ls.length} links, ${ls.filter(l => l.status === 'external').length} external, problems: ${bad.map(l => l.status + ' ' + l.href + ' "' + l.text + '"').join('; ') || 'none'}`); out.push('    ' + ls.filter(l => l.status !== 'external').map(l => `${l.href}→${l.status}`).join('  ')); out.push('    external w/o rel=noopener+target: ' + ls.filter(l => l.status === 'external' && l.target === '_blank' && !/noopener/.test(l.rel)).map(l => l.href).join(' ')); }
out.push('\nTAP TARGETS < 44px (phone-375)');
for (const [p, t] of Object.entries(R.targets)) out.push(`- ${p}: ${t.length ? t.join('; ') : 'none'}`);
out.push('\nFOCUS');
for (const [p, f] of Object.entries(R.focus)) out.push(`- ${p}: ${f.stops} tab stops, without a visible ring: ${f.noRing.join('; ') || 'none'}`);
out.push('\nART FILES ' + JSON.stringify(R.manifests));
out.push('\nPERSISTENCE');
for (const r of R.persistence) out.push(`- ${r.device} start ${r.start}: ${r.ok ? 'ok' : 'FAIL'} ${r.steps.map(s => s[0] + ':' + s[1] + '→' + s[2].attr + '/' + s[2].pressed).join(', ')} ${r.console.length ? 'console: ' + r.console.join(' || ') : ''}`);
out.push('\nDOORS');
for (const d of R.doors) out.push(`- ${d.device} "${d.door}" (caption "${d.caption}") → ${d.landed} (want ${d.expected}); arrival light ${d.arrivalOverlay}, faded ${d.overlayGone}; back → ${JSON.stringify(d.back)}; console: ${d.console.join(' || ') || 'none'}`);
out.push('\nGALLERY ROOMS (phone-375)'); for (const r of (R.rooms || [])) out.push(`- ${r.room}: ${r.sw}/${r.iw}px, lit=${r.lit}, "${r.where}", offenders ${r.offenders.join('; ') || 'none'}, console ${r.console.join(' || ') || 'none'}`);
console.log(out.join('\n'));
