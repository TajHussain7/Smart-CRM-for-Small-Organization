import { readFile, writeFile, mkdir } from 'node:fs/promises';
const header = '// Generated from frontend/shared; run node frontend/shared/sync.mjs after edits.\n';
for (const project of ['../web/project/src/api-shared/', '../mobile/my-app/src/api-shared/']) {
  await mkdir(new URL(project, import.meta.url), { recursive: true });
  for (const name of ['http.ts','catalog.ts','records.ts']) {
    const expected = header + await readFile(new URL(name, import.meta.url),'utf8');
    const target = new URL(project+name,import.meta.url);
    if (process.argv.includes('--check')) {
      if (await readFile(target,'utf8') !== expected) throw new Error(`Out of sync: ${target}`);
    } else await writeFile(target,expected);
  }
}
