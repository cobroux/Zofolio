// Garde i18n : `ng build` n'échoue pas sur une cible EN manquante. Échoue si les ids diffèrent ou si une cible EN est vide.
import { readFileSync } from 'node:fs';

const units = (f) => [...readFileSync(new URL(`../src/locale/${f}`, import.meta.url), 'utf8').matchAll(/<trans-unit id="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g)];
const fr = units('messages.xlf');
const en = units('messages.en.xlf');
const frIds = new Set(fr.map((m) => m[1]));
const enIds = new Set(en.map((m) => m[1]));
const errors = [
  ...[...frIds].filter((i) => !enIds.has(i)).map((i) => `absent de messages.en.xlf : ${i}`),
  ...[...enIds].filter((i) => !frIds.has(i)).map((i) => `absent de messages.xlf : ${i}`),
  ...en.filter((m) => !/<target[^>]*>[\s\S]*?\S[\s\S]*?<\/target>/.test(m[2])).map((m) => `cible EN vide ou manquante : ${m[1]}`),
];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`i18n OK : ${fr.length} unités FR/EN.`);
