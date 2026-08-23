/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklinks. Base: cards.
 * Source: https://about.kaiserpermanente.org/ (.c05-column-control:nth-of-type(4))
 * Generated: 2026-08-23
 *
 * Source is a column-control of 3 clickable quick-link tiles. Each tile is a
 * .c06-content-tile__wrap or .c06a-content-tile__wrap containing an anchor that
 * wraps a background image (or solid color) plus a headline overlay.
 * Target EDS block "cards" is a 2-column table (image | text), one row per tile.
 * The title is emitted as a linked heading so the whole card remains clickable.
 */
export default function parse(element, { document }) {
  const cells = [];

  const tiles = element.querySelectorAll('.c06-content-tile__wrap, .c06a-content-tile__wrap');
  tiles.forEach((tile) => {
    const link = tile.querySelector('a[href]');
    const img = tile.querySelector('.c06-content-tile__bg-image img, .c06a-content-tile__bg-image img, img');
    const headlineEl = tile.querySelector('.c06-content-tile__headline, .c06a-content-tile__headline');
    const headlineText = headlineEl ? headlineEl.textContent.trim() : '';
    const href = link ? link.getAttribute('href') : '';

    const heading = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = headlineText;
      heading.append(a);
    } else {
      heading.textContent = headlineText;
    }

    // Skip a tile only if it has neither image nor any title text.
    if (!img && !headlineText) return;
    cells.push([img || '', heading]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
