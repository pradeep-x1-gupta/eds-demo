/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://about.kaiserpermanente.org/ (.c05-column-control:nth-of-type(2))
 * Generated: 2026-08-23
 *
 * Source is a KP news mosaic built from a column-control with mixed sub-components:
 *   - .c06-content-tile / .c06a-content-tile : photo (or solid-color) tiles with a
 *     title overlay, whole tile wrapped in a link. Some tiles have no <img> (color bg).
 *   - .c08-feature : one large featured item with bg photo + headline + paragraph + CTA.
 *   - .c17-link-list : a dated news list, each item an anchor with eyebrow (date) + title.
 * Target EDS block "cards" is a 2-column table (image | text) with one row per card.
 * Items without an image get an empty first cell so every row keeps 2 columns.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Build a linked heading (title that is itself clickable) from text + href.
  const linkedHeading = (level, text, href) => {
    const h = document.createElement(level);
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      h.append(a);
    } else {
      h.textContent = text;
    }
    return h;
  };

  const pushCard = (imgCell, textNodes) => {
    const textNonEmpty = textNodes.filter(Boolean);
    // Skip rows that have neither an image nor any text content.
    if (!imgCell && textNonEmpty.length === 0) return;
    cells.push([imgCell || '', textNonEmpty.length ? textNonEmpty : '']);
  };

  // 1) Photo / color tiles (c06 and c06a variants).
  const tiles = element.querySelectorAll('.c06-content-tile__wrap, .c06a-content-tile__wrap');
  tiles.forEach((tile) => {
    const link = tile.querySelector('a[href]');
    const img = tile.querySelector('.c06-content-tile__bg-image img, .c06a-content-tile__bg-image img, img');
    const headlineEl = tile.querySelector('.c06-content-tile__headline, .c06a-content-tile__headline');
    const headline = headlineEl ? headlineEl.textContent.trim() : '';
    const href = link ? link.getAttribute('href') : '';
    pushCard(img || null, [linkedHeading('h3', headline, href)]);
  });

  // 2) Large featured item (c08-feature).
  const feature = element.querySelector('.c08-feature__wrap');
  if (feature) {
    const img = feature.querySelector('.c08-feature__background-wrap img, img');
    const heading = feature.querySelector('.c08-feature__headline');
    const text = feature.querySelector('.c08-feature__text');
    const cta = feature.querySelector('a.c08-feature__link.button, a.c08-feature__link:not(.c08-feature__link--absolute)');
    const textNodes = [];
    if (heading && heading.textContent.trim()) textNodes.push(heading);
    if (text && text.textContent.trim()) textNodes.push(text);
    if (cta) textNodes.push(cta);
    pushCard(img || null, textNodes);
  }

  // 3) Dated news list (c17-link-list) — no images, one card per link.
  const listLinks = element.querySelectorAll('.c17-link-list__link');
  listLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const eyebrow = link.querySelector('.c17-link-list__eyebrow');
    const titleEl = link.querySelector('.c17-link-list__title');
    const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim();
    const textNodes = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      textNodes.push(p);
    }
    textNodes.push(linkedHeading('h3', title, href));
    pushCard(null, textNodes);
  });

  // 4) Headline + plain-link lists (c17-link-list with a __linkListHeadline and
  //    generic anchors, e.g. regional bargaining lists). Not dated; render each
  //    list as one card: an h4 group headline followed by its links as h3s.
  const linkListContainers = element.querySelectorAll('.c17-link-list__container');
  linkListContainers.forEach((container) => {
    const headlineEl = container.querySelector('.c17-link-list__linkListHeadline');
    // anchors that are NOT the dated-list links already handled above
    const anchors = [...container.querySelectorAll('a[href]')]
      .filter((a) => !a.classList.contains('c17-link-list__link'));
    if (!headlineEl && anchors.length === 0) return;
    if (anchors.length === 0) return;
    const textNodes = [];
    if (headlineEl && headlineEl.textContent.trim()) {
      textNodes.push(linkedHeading('h4', headlineEl.textContent.trim(), ''));
    }
    anchors.forEach((a) => {
      const href = a.getAttribute('href');
      const label = a.textContent.trim();
      if (label) textNodes.push(linkedHeading('h3', label, href));
    });
    pushCard(null, textNodes);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
