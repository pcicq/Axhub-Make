import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..', 'src');
const groups = ['elements', 'pages'];

for (const group of groups) {
  const groupDir = path.join(root, group);
  if (!fs.existsSync(groupDir)) continue;
  const items = fs.readdirSync(groupDir);
  for (const name of items) {
    const folder = path.join(groupDir, name);
    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) continue;
    const md = path.join(folder, 'spec.md');
    const out = path.join(folder, 'spec.html');
    if (fs.existsSync(md)) {
      const content = fs.readFileSync(md, 'utf8');
      const html = marked(content);
      const page = `<!doctype html>
<html><head><meta charset="utf-8"><title>Spec - ${name}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<div style="padding:24px;">${html}</div>
</body></html>`;
      fs.writeFileSync(out, page, 'utf8');
      console.log('Generated', out);
    }
  }
}
