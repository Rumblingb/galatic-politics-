const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = path.join(__dirname, '..', 'data', 'politicians.ts');
const outDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = fs.readFileSync(src, 'utf8');
const exportMatch = content.match(/export\s+const\s+politicians[^=]*=/m);
if (!exportMatch) {
  console.error('Could not find politicians export in', src);
  process.exit(1);
}

const equalIndex = content.indexOf('=', exportMatch.index);
if (equalIndex === -1) {
  console.error('Could not find equals sign after politicians export');
  process.exit(1);
}
const arrStart = content.indexOf('[', equalIndex);
if (arrStart === -1) {
  console.error('Array start not found');
  process.exit(1);
}

let i = arrStart;
let depth = 0;
let inSingle = false;
let inDouble = false;
let inBacktick = false;
let inLine = false;
let inBlock = false;
let endIndex = -1;

for (; i < content.length; i++) {
  const ch = content[i];
  const next = content[i + 1];

  if (inLine) {
    if (ch === '\n') inLine = false;
    continue;
  }
  if (inBlock) {
    if (ch === '*' && next === '/') { inBlock = false; i++; }
    continue;
  }
  if (inSingle) {
    if (ch === '\\') { i++; continue; }
    if (ch === "'") { inSingle = false; }
    continue;
  }
  if (inDouble) {
    if (ch === '\\') { i++; continue; }
    if (ch === '"') { inDouble = false; }
    continue;
  }
  if (inBacktick) {
    if (ch === '\\') { i++; continue; }
    if (ch === '`') { inBacktick = false; }
    continue;
  }

  if (ch === '/' && next === '/') { inLine = true; i++; continue; }
  if (ch === '/' && next === '*') { inBlock = true; i++; continue; }
  if (ch === "'") { inSingle = true; continue; }
  if (ch === '"') { inDouble = true; continue; }
  if (ch === '`') { inBacktick = true; continue; }

  if (ch === '[') { depth++; }
  else if (ch === ']') { depth--; if (depth === 0) { endIndex = i; break; } }
}

if (endIndex === -1) {
  console.error('Array end not found');
  process.exit(1);
}

let arrText = content.slice(arrStart, endIndex + 1);
// replace require(...) with null so evaluation won't try to load assets
arrText = arrText.replace(/require\([^)]*\)/g, 'null');
// Replace any placeholder constant references created in the source with null for safe eval
arrText = arrText.replace(/\bPLACEHOLDER\b/g, 'null');

let politicians;
console.log('Extracted array snippet:', arrText.slice(0, 300));
try {
  politicians = vm.runInNewContext(arrText);
} catch (err) {
  console.error('Failed to evaluate politicians array:', err);
  process.exit(2);
}

const fields = ['id', 'name', 'promiseScore', 'integrityScore', 'marketOdds', 'volatility', 'momentum'];
const report = politicians.map((p) => {
  const out = {};
  fields.forEach((f) => {
    out[f] = p[f] === undefined ? null : p[f];
  });
  return out;
});

fs.writeFileSync(path.join(outDir, 'politician-stats.json'), JSON.stringify(report, null, 2));

const csvLines = [fields.join(',')];
for (const r of report) {
  const row = fields.map((f) => {
    if (r[f] === null || r[f] === undefined) return '';
    const s = String(r[f]).replace(/"/g, '""');
    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s}"` : s;
  }).join(',');
  csvLines.push(row);
}
fs.writeFileSync(path.join(outDir, 'politician-stats.csv'), csvLines.join('\n'));

console.log('Wrote', report.length, 'entries to reports/politician-stats.json and .csv');
