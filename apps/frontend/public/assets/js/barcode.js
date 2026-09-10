/**
 * Code 39 barcode rendering.
 *
 * Code 39 is the simplest symbology that real scanners read, and it needs no
 * checksum, so a label produced here is genuinely scannable rather than
 * decorative. Each character is nine elements - five bars and four spaces -
 * of which exactly three are wide. That invariant is asserted below, which
 * catches any transcription slip in the table.
 */

'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShopNepal = Object.assign(root.ShopNepal || {}, api);
})(typeof self !== 'undefined' ? self : this, function () {

  // n = narrow, w = wide; elements alternate bar, space, bar, space, ...
  const CODE39 = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw', 'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw',
    'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn',
    'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn', 'K': 'wnnnnnnww', 'L': 'nnwnnnnww',
    'M': 'wnwnnnnwn', 'N': 'nnnnwnnww', 'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn',
    'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
    'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw',
    'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
    '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn',
    '$': 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn',
    '*': 'nwnnwnwnn',
  };

  // Self-check: every glyph is 9 elements with exactly 3 wide.
  Object.entries(CODE39).forEach(([char, pattern]) => {
    const wide = (pattern.match(/w/g) || []).length;
    if (pattern.length !== 9 || wide !== 3) {
      throw new Error(`Code 39 table is corrupt at "${char}": ${pattern}`);
    }
  });

  /** Code 39 is upper-case only; anything unencodable becomes a hyphen. */
  const sanitize = (text) =>
    String(text).toUpperCase().split('').map((ch) => (CODE39[ch] && ch !== '*' ? ch : '-')).join('');

  /**
   * Render `text` as an inline SVG barcode.
   *
   * narrow  - width of a narrow element in user units
   * height  - bar height
   * showText - print the human-readable value beneath
   */
  function toSVG(text, { narrow = 2, height = 60, showText = true } = {}) {
    const value = sanitize(text);
    const framed = `*${value}*`;

    const WIDE = 3; // wide elements are 3x narrow, inside Code 39's legal range
    const GAP = narrow; // inter-character gap is one narrow space

    let x = 0;
    const bars = [];

    framed.split('').forEach((char, index) => {
      const pattern = CODE39[char];
      pattern.split('').forEach((size, i) => {
        const width = (size === 'w' ? WIDE : 1) * narrow;
        if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${width}" height="${height}"/>`);
        x += width;
      });
      if (index < framed.length - 1) x += GAP;
    });

    const totalWidth = x;
    const textHeight = showText ? 18 : 0;

    return `<svg class="barcode" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode ${value}"
      viewBox="0 0 ${totalWidth} ${height + textHeight}" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="${totalWidth}" height="${height + textHeight}" fill="#fff"/>
      <g fill="#000">${bars.join('')}</g>
      ${showText
        ? `<text x="${totalWidth / 2}" y="${height + 14}" text-anchor="middle"
             font-family="monospace" font-size="14" fill="#000" letter-spacing="2">${value}</text>`
        : ''}
    </svg>`;
  }

  return { barcode: { toSVG, sanitize, CODE39 } };
});
