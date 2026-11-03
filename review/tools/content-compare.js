// Every word the old Form Index showed must still be on the new one: data identical, every line of page text
// present, and every line of each old modal present in that form's new close-up.
const fs = require('fs');
const A = JSON.parse(fs.readFileSync(process.argv[2])), B = JSON.parse(fs.readFileSync(process.argv[3]));
const norm = s => s.replace(/\s+/g, ' ').trim();
let bad = 0;
const dataSame = JSON.stringify(A.data) === JSON.stringify(B.data);
console.log('FORMS + GUIDESTONES data identical:', dataSame, '(', A.data.FORMS.length, 'forms,', A.data.GUIDESTONES.length, 'stones )'); if (!dataSame) bad++;
const btext = norm(B.text);
const lines = A.text.split('\n').map(norm).filter(Boolean);
const missing = lines.filter(l => !btext.includes(l));
console.log('page text lines checked:', lines.length, 'missing:', missing.length); missing.forEach(m => console.log('  MISSING:', JSON.stringify(m))); bad += missing.length;
console.log('modals old/new:', A.modals.length, B.modals.length); if (A.modals.length !== B.modals.length) bad++;
A.modals.forEach((m, i) => {
  const nb = norm(B.modals[i] || '');
  m.split('\n').map(norm).filter(l => l && l !== '×').forEach(l => { if (!nb.includes(l)) { bad++; console.log('  modal', i, 'MISSING:', JSON.stringify(l)); } });
});
const extra = B.text.split('\n').map(norm).filter(Boolean).filter(l => !norm(A.text).includes(l));
console.log('new lines on the page that were not there before (chrome only, expected):', JSON.stringify(extra));
console.log(bad ? 'FAIL ' + bad : 'PASS: every word is still there');
process.exit(bad ? 1 : 0);
