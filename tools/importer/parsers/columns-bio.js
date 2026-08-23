/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-bio. Base: columns.
 * Source: KP c31-leadership-bio — an executive bio header on a grey band with the
 * person's name (h1), job title, an optional social link, and a headshot image.
 * Target EDS "columns" block: first row is the block name (added by createBlock),
 * second row has two cells — [ copy (name + title + social), headshot image ].
 */
export default function parse(element, { document }) {
  const bio = element.querySelector('.c31-leadership-bio') || element;

  const nameEl = bio.querySelector('.c31-leadership-bio__full-name, h1');
  const titleEl = bio.querySelector('.c31-leadership-bio__job-title');
  const social = bio.querySelector('.c31-leadership-bio__social-links a[href], .c31-leadership-bio__info a[href]');
  const img = bio.querySelector('.c31-leadership-bio__image img, .c31-leadership-bio__image-container img, img');

  const copyCell = [];
  if (nameEl && nameEl.textContent.trim()) {
    const h = document.createElement('h1');
    h.textContent = nameEl.textContent.trim();
    copyCell.push(h);
  }
  if (titleEl && titleEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = titleEl.textContent.trim();
    copyCell.push(p);
  }
  if (social && social.getAttribute('href')) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', social.getAttribute('href'));
    a.textContent = (social.textContent.trim() || 'Follow on LinkedIn');
    p.append(a);
    copyCell.push(p);
  }

  let imageCell = '';
  if (img) {
    const clone = document.createElement('img');
    clone.setAttribute('src', img.getAttribute('src'));
    const alt = img.getAttribute('alt') || (nameEl ? nameEl.textContent.trim() : '');
    if (alt) clone.setAttribute('alt', alt);
    imageCell = clone;
  }

  if (copyCell.length === 0 && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[copyCell.length ? copyCell : '', imageCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-bio', cells });
  element.replaceWith(block);
}
