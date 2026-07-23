'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const testDirectory = path.resolve(__dirname, '..', 'linear-algebra', 'tests');
const testFiles = fs.readdirSync(testDirectory)
  .filter(file => file.endsWith('.test.js'))
  .sort()
  .map(file => path.join(testDirectory, file));

if (!testFiles.length) throw new Error('No linear algebra test files were found.');
const result = spawnSync(process.execPath, ['--test', ...testFiles], { stdio: 'inherit' });
process.exit(result.status === null ? 1 : result.status);
