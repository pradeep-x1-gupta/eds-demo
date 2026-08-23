/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article. Base block: hero.
 * Source: https://about.kaiserpermanente.org/news/medical-school-milestone
 * Selector: .c27-article-page-hero
 * Generated: 2026-08-23
 *
 * KP article-page hero (c27-article-page-hero): a two-up header.
 * Left column: date eyebrow (.c27-article-page-hero__eyebrow), H1 headline
 * (.c27-article-page-hero__headline), intro paragraph (.c27-article-page-hero__text).
 * Right column: captioned hero image (.c27-article-page-hero__media-item),
 * caption (.c27-article-page-hero__caption).
 *
 * Emitted as the vanilla 1-column, 3-row hero block:
 *   Row 1: block name (handled by createBlock)
 *   Row 2: hero image (alt reconstructed from the media-item title attribute)
 *   Row 3: H1 heading + date eyebrow + intro text
 *
 * Media handling variations:
 *  - Import source (cleaned.html) has a real <img> inside .media-item but no alt.
 *  - Live DOM has NO <img>; the .media-item is a background-image div.
 * The parser reconstructs an <img> in either case and sets alt from the
 * media-item title (falling back to the caption).
 */
export default function parse(element, { document }) {
  const mediaItem = element.querySelector('.c27-article-page-hero__media-item, [class*="media-item"]');

  // alt/caption text: prefer the media-item title attribute, then aria-label.
  const mediaTitle = mediaItem
    ? (mediaItem.getAttribute('title') || mediaItem.getAttribute('aria-label') || '').trim()
    : '';

  // Resolve the hero image, handling both <img> and background-image variants.
  let image = element.querySelector('.c27-article-page-hero__media-item img, [class*="media-item"] img');
  if (!image && mediaItem) {
    const style = mediaItem.getAttribute('style') || '';
    const bgMatch = style.match(/url\((['"]?)(.*?)\1\)/i);
    if (bgMatch && bgMatch[2]) {
      image = document.createElement('img');
      image.setAttribute('src', bgMatch[2]);
    }
  }
  // Reconstruct the alt from the media-item title when the image lacks one.
  if (image && mediaTitle && !image.getAttribute('alt')) {
    image.setAttribute('alt', mediaTitle);
  }

  // Text column content.
  const eyebrow = element.querySelector('.c27-article-page-hero__eyebrow, .eyebrow');
  const heading = element.querySelector('.c27-article-page-hero__headline, h1, [class*="headline"]');
  const intro = element.querySelector('.c27-article-page-hero__text, [class*="__text"]');
  const caption = element.querySelector('.c27-article-page-hero__caption, [class*="__caption"]');

  // Empty-block guard: bail gracefully if nothing meaningful was found.
  if (!heading && !intro && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image (optional).
  if (image) {
    cells.push([image]);
  }

  // Row 3: heading + eyebrow date + intro text (single cell holds all).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (eyebrow && (eyebrow.textContent || '').trim()) contentCell.push(eyebrow);
  if (intro && (intro.textContent || '').trim()) contentCell.push(intro);
  if (caption && (caption.textContent || '').trim()) contentCell.push(caption);
  if (contentCell.length) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
