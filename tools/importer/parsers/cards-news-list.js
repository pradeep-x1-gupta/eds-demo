/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news-list. Base block: cards.
 * Source: https://about.kaiserpermanente.org/news (.c04-filtered-card-grid)
 * Generated: 2026-08-23
 *
 * KP c04-filtered-card-grid: a dense, uniform grid of dated news cards.
 * Each card = image + date eyebrow + linked title + short description, wrapped
 * in an <a> article link. The interactive filter controls (Type/Location/Topic)
 * are progressive-enhancement UI, not content, and are intentionally ignored.
 *
 * Output follows the Cards block library convention: 2 columns, one row per card
 * (image | text cell). The text cell holds a date eyebrow paragraph, a linked
 * title heading, and a description paragraph. Handles ALL cards found via the
 * card item selector (the live grid has hundreds; source.html is truncated).
 */
export default function parse(element, { document }) {
  // This variant covers two KP structures:
  //  1. .c04-filtered-card-grid  → .filtered-card-grid__item cards (news listing)
  //  2. .c28-related-card-grid   → a.related-cards__card cards (article "Related" slider)
  // Detect which is present and normalize both to the same 2-column cards table.
  const isRelated = element.querySelectorAll('.filtered-card-grid__item').length === 0
    && element.querySelectorAll('.related-cards__card').length > 0;

  const cells = [];

  if (isRelated) {
    // Related-cards slider. Deduplicate slick-cloned slides by href.
    const seen = new Set();
    element.querySelectorAll('a.related-cards__card, .related-cards__card').forEach((item) => {
      const href = item.getAttribute('href')
        || (item.querySelector('a[href]') ? item.querySelector('a[href]').getAttribute('href') : null);
      if (href && seen.has(href)) return; // skip cloned duplicate
      if (href) seen.add(href);

      const img = item.querySelector('img.related-cards__img, img');
      const dateText = (item.querySelector('.related-cards__eyebrow') || {}).textContent || '';
      const titleText = (item.querySelector('.related-cards__title, .related-cards__headline') || {}).textContent || '';
      const copyText = (item.querySelector('.related-cards__text') || {}).textContent || '';

      if (!img && !titleText.trim() && !copyText.trim()) return;

      const textCell = [];
      if (dateText.trim()) {
        const dateP = document.createElement('p');
        dateP.textContent = dateText.trim();
        textCell.push(dateP);
      }
      if (titleText.trim()) {
        const heading = document.createElement('h3');
        if (href) {
          const a = document.createElement('a');
          a.setAttribute('href', href);
          a.textContent = titleText.trim();
          heading.appendChild(a);
        } else {
          heading.textContent = titleText.trim();
        }
        textCell.push(heading);
      }
      if (copyText.trim()) {
        const copyP = document.createElement('p');
        copyP.textContent = copyText.trim();
        textCell.push(copyP);
      }
      cells.push([img || '', textCell]);
    });

    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const relatedBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-news-list', cells });
    element.replaceWith(relatedBlock);
    return;
  }

  // Every card item in the grid. Iterate ALL — do not assume a fixed count.
  const items = element.querySelectorAll('.filtered-card-grid__item');

  items.forEach((item) => {
    // The whole card is an <a> article link.
    const link = item.querySelector('a.filtered-card-grid__item__wrapper, a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Image (mandatory in the Cards convention, first cell).
    const img = item.querySelector('.filtered-card-grid__image img, img');

    // Text pieces.
    const eyebrowEl = item.querySelector('.filtered-card-grid__eyebrow');
    const titleEl = item.querySelector('.filtered-card-grid__title');
    const copyEl = item.querySelector('.filtered-card-grid__copy');

    const dateText = eyebrowEl ? eyebrowEl.textContent.trim() : '';
    // Title text only — exclude the decorative SVG play icon some cards embed.
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    const copyText = copyEl ? copyEl.textContent.trim() : '';

    // Skip empty/malformed items (no image and no title/copy).
    if (!img && !titleText && !copyText) return;

    // Build the text (second) cell.
    const textCell = [];

    if (dateText) {
      const dateP = document.createElement('p');
      dateP.textContent = dateText;
      textCell.push(dateP);
    }

    if (titleText) {
      const heading = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        heading.appendChild(a);
      } else {
        heading.textContent = titleText;
      }
      textCell.push(heading);
    } else if (href) {
      // No title text but we still have a link target — preserve the link.
      const heading = document.createElement('h3');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      heading.appendChild(a);
      textCell.push(heading);
    }

    if (copyText) {
      const copyP = document.createElement('p');
      copyP.textContent = copyText;
      textCell.push(copyP);
    }

    // 2-column row: [image, text]. Pad the image cell if the image is missing
    // so every row keeps the same column count.
    cells.push([img || '', textCell]);
  });

  // Empty-block guard: nothing to emit.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news-list', cells });
  element.replaceWith(block);
}
