// Validação automática da apresentação Kizuna (sem dependências extras).
// Uso: npm run validate  (rodar depois de npm run build para checar também o dist)
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const errors = [];
const ok = [];
const check = (cond, okMsg, errMsg) => (cond ? ok.push(okMsg) : errors.push(errMsg));

// 1. Roteiro (PresentationContext) × mapa técnico (narrativeMap)
const ctx = read('src/core/PresentationContext.tsx');
const sceneCounts = [...ctx.matchAll(/sceneCount:\s*(\d+)/g)].map((m) => Number(m[1]));
const labelsBlocks = [...ctx.matchAll(/sceneLabels:\s*\[([\s\S]*?)\]\s*\n\s*\}/g)].map((m) => (m[1].match(/'[^']*'|`[^`]*`/g) || []).length);
const mapJs = ts.transpileModule(read('src/core/narrativeMap.ts'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const map = await import('data:text/javascript;base64,' + Buffer.from(mapJs).toString('base64'));
check(sceneCounts.length === 12, 'roteiro com 12 telas', `roteiro com ${sceneCounts.length} telas (esperado 12)`);
check(sceneCounts.reduce((a, b) => a + b, 0) === 30, 'roteiro com 30 cenas', `roteiro com ${sceneCounts.reduce((a, b) => a + b, 0)} cenas (esperado 30)`);
const mapProblems = map.checkNarrativeMap(sceneCounts);
check(mapProblems.length === 0, 'mapa técnico consistente com o roteiro', 'mapa técnico: ' + mapProblems.join('; '));
check(
  labelsBlocks.length === 12 && labelsBlocks.every((n, i) => n === sceneCounts[i]),
  'rótulos de cena = número de cenas em todas as telas',
  `rótulos de cena divergentes: ${labelsBlocks.join(',')} × ${sceneCounts.join(',')}`
);
const stages = map.STAGE_MAP.flat();
check(
  stages.every((s) => s.stage >= 0 && s.stage <= 14),
  'todas as cenas apontam para cenários 3D existentes (0–14)',
  'cena aponta para cenário 3D inexistente'
);
check(map.toStage(map.SCREEN.TRUST, 1).stage === map.STAGE.VALIDATION_GATE, 'decisão humana ligada ao portão 3D', 'tela de confiança não usa o portão 3D');
check(
  map.STAGE_MAP[map.SCREEN.ENTRY].slice(0, 3).every((s) => s.stage === map.STAGE.RAILWAY),
  'rota de entrada ligada ao trem',
  'rota de entrada não usa o trem'
);

// 2. sources.json (roteiro da banca e evidências)
const sources = JSON.parse(read('src/data/sources.json'));
const keys = Object.keys(sources.sections).sort();
const expected = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
check(JSON.stringify(keys) === JSON.stringify(expected), 'sources.json com as telas 01–12', `sources.json com chaves ${keys.join(',')}`);
const legend = Object.keys(sources.classificationLegend);
const required = ['duration', 'speech', 'concept', 'evidence', 'premise', 'risk', 'response', 'probableQuestion', 'suggestedAnswer'];
for (const k of keys) {
  const sec = sources.sections[k];
  const missing = required.filter((f) => !sec.banca?.[f]);
  check(missing.length === 0, `tela ${k}: roteiro completo`, `tela ${k}: faltam ${missing.join(', ')}`);
  check(Array.isArray(sec.evidences) && sec.evidences.length > 0, `tela ${k}: tem evidências`, `tela ${k}: sem evidências`);
  for (const ev of sec.evidences || []) {
    check(legend.includes(ev.type), `tela ${k}: classificação válida (${ev.type})`, `tela ${k}: classificação desconhecida "${ev.type}"`);
  }
}

// 3. Referências obsoletas (fora do ERP de demonstração e dos backups)
const OBSOLETE = [/68%\s*→\s*75%/, /KZ-104/, /Entrada Japão/, /Preparar proposta comercial para cliente japonês/, /100\+ leads/i, /Comunicação Contextual/];
const walk = (dir) =>
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
const files = walk('src').filter((f) => /\.(tsx?|json)$/.test(f) && !/components[\\/]modules|initialErpData/.test(f));
for (const f of files) {
  const text = read(f);
  for (const re of OBSOLETE) check(!re.test(text), null, `${f}: referência obsoleta ${re}`);
}
ok.push(`${files.length} arquivos sem referências obsoletas`);
if (fs.existsSync(path.join(root, 'dist/index.html'))) {
  const dist = read('dist/index.html');
  for (const re of OBSOLETE) check(!re.test(dist), null, `dist/index.html: referência obsoleta ${re}`);
  ok.push('dist/index.html sem referências obsoletas');
}

for (const m of ok.filter(Boolean)) console.log('  ✓', m);
for (const e of errors) console.log('  ✗', e);
console.log(errors.length ? `\nFALHOU: ${errors.length} problema(s)` : `\nOK: ${ok.filter(Boolean).length} verificações`);
process.exit(errors.length ? 1 : 0);
