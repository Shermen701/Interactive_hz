'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const linearRoot = path.join(root, 'linear-algebra');
const indexPath = path.join(linearRoot, 'index.html');
const expectedModules = new Set(['span', 'transform', 'composition', 'inverse', 'systems', 'eigen', 'projection', 'qr', 'regression', 'pca', 'svd']);
const index = fs.readFileSync(indexPath, 'utf8');
const localScripts = [...index.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]).filter(source => !/^(https?:)?\/\//.test(source));

for (const source of localScripts) {
  const target = path.resolve(linearRoot, source);
  if (!target.startsWith(`${linearRoot}${path.sep}`) || !fs.existsSync(target)) throw new Error(`Missing local script referenced by linear-algebra/index.html: ${source}`);
}

const moduleDirectory = path.join(linearRoot, 'modules');
const moduleFiles = fs.readdirSync(moduleDirectory).filter(file => file.endsWith('.js') && file !== 'registry.js' && file !== 'interactions.js');
const moduleIds = new Map();
for (const file of moduleFiles) {
  const source = fs.readFileSync(path.join(moduleDirectory, file), 'utf8');
  const match = source.match(/id\s*:\s*['"]([^'"]+)['"]/);
  if (!match) throw new Error(`Module ${file} does not expose a stable id.`);
  const id = match[1];
  if (moduleIds.has(id)) throw new Error(`Duplicate module id: ${id} (${moduleIds.get(id)} and ${file})`);
  moduleIds.set(id, file);
}
for (const id of expectedModules) if (!moduleIds.has(id)) throw new Error(`Expected module id is missing: ${id}`);
for (const id of moduleIds.keys()) if (!expectedModules.has(id)) throw new Error(`Unexpected unregistered module id: ${id}`);

const testDirectory = path.join(linearRoot, 'tests');
for (const testFile of fs.readdirSync(testDirectory).filter(file => file.endsWith('.test.js'))) {
  const source = fs.readFileSync(path.join(testDirectory, testFile), 'utf8');
  for (const match of source.matchAll(/require\(['"]\.\.\/modules\/([^'"]+)['"]\)/g)) {
    const target = path.join(moduleDirectory, `${match[1].replace(/\.js$/, '')}.js`);
    if (!fs.existsSync(target)) throw new Error(`${testFile} requires a missing module: ${match[1]}`);
  }
}

for (const directory of [path.join(linearRoot, 'core'), moduleDirectory]) {
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.js'))) execFileSync(process.execPath, ['--check', path.join(directory, file)], { stdio: 'inherit' });
}
execFileSync(process.execPath, ['--check', path.join(linearRoot, 'app.js')], { stdio: 'inherit' });
console.log(`Linear algebra integrity check passed (${moduleIds.size} modules, ${localScripts.length} local scripts).`);
