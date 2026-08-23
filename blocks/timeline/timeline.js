import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Timeline block.
 *
 * Content model: one row per milestone. Cells are matched defensively so
 * authors can omit or reorder them:
 *   - a cell whose text is a 3-4 digit year  -> the year badge
 *   - a cell containing an image/picture      -> the milestone media
 *   - remaining cells (heading + paragraphs)  -> the milestone copy
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'timeline-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    let yearText = '';
    let mediaCell = null;
    const bodyCells = [];

    cells.forEach((cell) => {
      const text = cell.textContent.trim();
      if (!mediaCell && cell.querySelector('picture, img')) {
        mediaCell = cell;
      } else if (!yearText && /^\d{3,4}$/.test(text)) {
        yearText = text;
      } else if (text || cell.querySelector('*')) {
        bodyCells.push(cell);
      }
    });

    const li = document.createElement('li');
    li.className = 'timeline-item';
    moveInstrumentation(row, li);

    // Year badge on the spine.
    const year = document.createElement('div');
    year.className = 'timeline-year';
    if (yearText) year.textContent = yearText;
    li.append(year);

    // Milestone card (media + copy).
    const card = document.createElement('div');
    card.className = 'timeline-card';

    if (mediaCell) {
      const media = document.createElement('div');
      media.className = 'timeline-media';
      while (mediaCell.firstChild) media.append(mediaCell.firstChild);
      card.append(media);
    }

    const body = document.createElement('div');
    body.className = 'timeline-body';
    bodyCells.forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });
    card.append(body);

    li.append(card);
    ol.append(li);
  });

  // Optimize any raw images the author added.
  ol.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ol);
}
