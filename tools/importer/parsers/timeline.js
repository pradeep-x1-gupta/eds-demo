/* eslint-disable */
/* global WebImporter */
/**
 * Parser for timeline. Base: timeline (project block).
 * Source: KP c36-timeline-container with c36b-timeline-milestone entries.
 * Each milestone = a year, an image, a title (h2), and a body description.
 * Target block "timeline": first row is the block name (added by createBlock),
 * then one row per milestone with cells [ year, image, text (title + body) ].
 */
export default function parse(element, { document }) {
  const container = element.matches('.c36-timeline-container')
    ? element
    : (element.querySelector('.c36-timeline-container') || element);

  const milestones = container.querySelectorAll('.c36b-timeline-milestone');
  const cells = [];

  milestones.forEach((m) => {
    const yearEl = m.querySelector('.c36b-timeline-milestone__year');
    const img = m.querySelector('.c36b-timeline-milestone__media-item img, .c36b-timeline-milestone__media-wrapper img, img');
    // Title is the heading inside __text (NOT the whole __text block, which also
    // contains the body copy). Only accept a real heading element.
    const titleEl = m.querySelector('.c36b-timeline-milestone__text h1, .c36b-timeline-milestone__text h2, .c36b-timeline-milestone__text h3, .c36b-timeline-milestone__text h4');
    const bodyEl = m.querySelector('.c36b-timeline-milestone__body-copy');

    const yearText = yearEl ? yearEl.textContent.trim() : '';
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    // Body: prefer the dedicated body-copy; strip any read-more toggle text.
    let bodyText = bodyEl ? bodyEl.textContent.trim() : '';
    bodyText = bodyText.replace(/\s*[+-]?\s*Read (more|less)\s*/gi, ' ').trim();

    if (!yearText && !titleText && !bodyText && !img) return;

    // Year cell
    const yearCell = document.createElement('p');
    yearCell.textContent = yearText;

    // Image cell (reconstruct a clean img so lazy-load attrs don't leak)
    let imageCell = '';
    if (img) {
      const clone = document.createElement('img');
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src) clone.setAttribute('src', src);
      const alt = img.getAttribute('alt') || titleText;
      if (alt) clone.setAttribute('alt', alt);
      imageCell = clone;
    }

    // Text cell: title (h3) + body paragraph
    const textNodes = [];
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      textNodes.push(h);
    }
    if (bodyText) {
      const p = document.createElement('p');
      p.textContent = bodyText;
      textNodes.push(p);
    }

    cells.push([yearCell, imageCell, textNodes.length ? textNodes : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'timeline', cells });
  element.replaceWith(block);
}
