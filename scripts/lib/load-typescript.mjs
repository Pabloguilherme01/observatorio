import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';

/** Evaluate pure data/contract modules with Node 24's type erasure; no generated fixtures. */
export async function loadTypescript(file) {
  const urls = new Map();
  const urlFor = filename => {
    const absolute = path.resolve(filename);
    if (urls.has(absolute)) return urls.get(absolute);
    let source = stripTypeScriptTypes(fs.readFileSync(absolute, 'utf8'));
    source = source.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, specifier) => {
      const target = path.resolve(path.dirname(absolute), specifier).replace(/\.js$/, '.ts');
      return `from ${quote}${urlFor(target)}${quote}`;
    });
    const url = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
    urls.set(absolute, url);
    return url;
  };
  return import(urlFor(file));
}
