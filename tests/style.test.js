// ABOUTME: Verifies that the Habits UI uses the intended visual assets and layout constraints.
// ABOUTME: Ensures styling changes like icon selection and card layout remain in place.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.ok(manifest.icons && manifest.icons.length > 0, 'Manifest must define at least one icon.');

const primaryIcon = manifest.icons[0];

assert.strictEqual(
  primaryIcon.src,
  'icons/kowloon-romance.svg',
  'Primary icon should reference the Kowloon-inspired artwork.'
);

const htmlPath = path.join(rootDir, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(
  !/habit-card:nth-child\(/.test(htmlContent),
  'Habit cards should not use staggered nth-child margins.'
);

assert(
  htmlContent.includes('href="icons/kowloon-romance.svg"'),
  'Document should link to the Kowloon-inspired favicon.'
);

console.log('All style expectations passed.');
