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

assert(
  htmlContent.includes('data-sync-trigger'),
  'Document should expose a sync control for sharing data across devices.'
);

assert(
  htmlContent.includes('?data=') || htmlContent.includes('URLSearchParams'),
  'Document should import shared data from sync links.'
);

const appleIconMatch = htmlContent.match(/rel="apple-touch-icon"[^>]*href="([^"]+)"/);
assert(appleIconMatch && appleIconMatch[1], 'Document should reference the Apple touch icon.');
const appleIconHref = appleIconMatch[1];
assert(
  appleIconHref.startsWith('data:image/png;base64,'),
  'Apple touch icon should be an embedded PNG data URL.'
);
const appleIconBytes = Buffer.from(appleIconHref.replace('data:image/png;base64,', ''), 'base64');
assert(appleIconBytes.length > 1024, 'Apple touch icon data should not be empty.');

const iconPath = path.join(rootDir, 'icons', 'kowloon-romance.svg');
const iconContent = fs.readFileSync(iconPath, 'utf8');

const textTagMatch = iconContent.match(/<text[^>]*>/);
assert(textTagMatch, 'Icon should render its primary kanji as a text element.');
const textTag = textTagMatch[0];

assert(
  /dominant-baseline="middle"/.test(textTag),
  'Icon text should be vertically centered with dominant-baseline="middle".'
);

const yMatch = textTag.match(/y="([^"]+)"/);
assert(yMatch, 'Icon text should declare a vertical position.');
assert.strictEqual(yMatch[1], '256', 'Icon text should be vertically centered in the viewBox.');

const transformMatch = textTag.match(/transform="([^"]+)"/);
assert(transformMatch, 'Icon text should explicitly translate for visual centering.');
const transformValue = transformMatch[1];
assert(
  /translate\(0\s+16\)/.test(transformValue),
  'Icon text should translate downward by 16 units for optical centering.'
);

console.log('All style expectations passed.');
