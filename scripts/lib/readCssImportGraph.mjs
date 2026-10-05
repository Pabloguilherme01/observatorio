import fs from 'node:fs';
import path from 'node:path';

const IMPORT_PATTERN = /@import\s+(?:url\(\s*)?["']([^"']+\.css)["']\s*\)?[^;]*;/g;

export function readCssImportGraph(entryFile, { root = process.cwd() } = {}) {
  const seen = new Set();
  const rootPath = path.resolve(root);

  const visit = relativeFile => {
    const absoluteFile = path.resolve(rootPath, relativeFile);
    const relativeToRoot = path.relative(rootPath, absoluteFile);

    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      throw new Error('CSS import fora da raiz do projeto: ' + relativeFile);
    }
    if (seen.has(absoluteFile)) return '';

    seen.add(absoluteFile);
    const content = fs.readFileSync(absoluteFile, 'utf8');
    let output = '';
    let cursor = 0;

    for (const match of content.matchAll(IMPORT_PATTERN)) {
      const importPath = match[1];
      const matchIndex = match.index ?? 0;
      output += content.slice(cursor, matchIndex);

      const nestedAbsolute = path.resolve(path.dirname(absoluteFile), importPath);
      const nestedRelative = path.relative(rootPath, nestedAbsolute);
      output += visit(nestedRelative);
      cursor = matchIndex + match[0].length;
    }

    output += content.slice(cursor);
    return output;
  };

  return visit(entryFile);
}
