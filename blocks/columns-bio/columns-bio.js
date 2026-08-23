/*
 * columns-bio — leadership bio header (KP c31-leadership-bio).
 * Authored as a 2-cell row: copy cell (name h1 + job title + optional social link)
 * and an image cell (headshot). Flags the image cell so CSS can lay it out.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  // The cell whose only meaningful content is a picture/img is the headshot.
  cells.forEach((cell) => {
    const hasPicture = cell.querySelector('picture, img');
    const textLen = cell.textContent.trim().length;
    if (hasPicture && textLen === 0) {
      cell.classList.add('columns-bio-img-col');
    }
  });
}
