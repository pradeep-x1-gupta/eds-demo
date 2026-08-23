/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media-copy. Base: columns.
 * Source: https://about.kaiserpermanente.org/ (.c13-horizontal-media-with-copy)
 * Generated: 2026-08-23
 *
 * Source is a KP c13-horizontal-media-with-copy band: a single large image and a
 * copy block (headline + paragraph + CTA) shown side by side. In the source the
 * media is visually reversed (medium-flex-dir-row-reverse) so the image sits on the
 * right, but the whole thing is one media-and-copy row. The entire media is wrapped
 * in a link to the same destination as the CTA.
 * Target EDS block "columns" is a multi-column table; here one row with 2 columns:
 * [ copy cell (heading + paragraph + CTA), image cell ].
 */
export default function parse(element, { document }) {
  const media = element.querySelector('.c13-horizontal-media-with-copy__media-wrapper');
  const mediaScope = media || element;
  const mediaLink = mediaScope.querySelector('a[href]');

  // The image may be a real <img> (as in the cached snippet) OR a CSS
  // background-image div (role="img") on the live page. Handle both: prefer a
  // real <img>, otherwise reconstruct one from the bg-image div's style URL and
  // its title/aria-label so the alt text and picture are preserved on import.
  let img = mediaScope.querySelector('.c13-horizontal-media-with-copy__bg-image img, img');
  if (!img) {
    const bg = mediaScope.querySelector('.c13-horizontal-media-with-copy__bg-image, [style*="background-image"]');
    if (bg) {
      const style = bg.getAttribute('style') || '';
      const m = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/i);
      if (m && m[2]) {
        img = document.createElement('img');
        img.setAttribute('src', m[2]);
        const alt = bg.getAttribute('title') || bg.getAttribute('aria-label') || '';
        if (alt) img.setAttribute('alt', alt);
      }
    }
  }

  const content = element.querySelector('.c13-horizontal-media-with-copy__content');
  const scope = content || element;
  const heading = scope.querySelector('.c13-horizontal-media-with-copy__headline, h1, h2, h3');
  const text = scope.querySelector('.c13-horizontal-media-with-copy__text, p');
  const cta = scope.querySelector('.c13-horizontal-media-with-copy__link a, a.button');

  const copyCell = [];
  if (heading && heading.textContent.trim()) copyCell.push(heading);
  if (text && text.textContent.trim()) copyCell.push(text);
  if (cta && (cta.textContent.trim() || cta.getAttribute('href'))) copyCell.push(cta);

  // Build the image cell; if the media was wrapped in a link, preserve it.
  let imageCell = '';
  if (img) {
    if (mediaLink) {
      const a = document.createElement('a');
      a.setAttribute('href', mediaLink.getAttribute('href'));
      a.append(img);
      imageCell = a;
    } else {
      imageCell = img;
    }
  }

  if (copyCell.length === 0 && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[copyCell.length ? copyCell : '', imageCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media-copy', cells });
  element.replaceWith(block);
}
