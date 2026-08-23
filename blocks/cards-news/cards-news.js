/*
 * cards-news — homepage news mosaic.
 * Source: KP homepage c05-column-control (c06 content tiles + c08 feature + c17 link list).
 * Rebuilds the flat authored rows into three column groups:
 *   - .cards-news-tiles   : colored photo tiles (rows with only a heading)
 *   - .cards-news-feature : large featured item (row containing an h2)
 *   - .cards-news-list    : dated news list (rows with a date paragraph + heading)
 * Classification is content-driven so the block degrades gracefully when reused.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

function contentCell(row) {
  const cells = [...row.children];
  return cells.find((c) => c.children.length || c.textContent.trim()) || cells[cells.length - 1];
}

function linkOf(heading) {
  const a = heading && heading.querySelector('a');
  let text = '';
  if (a) {
    text = a.textContent;
  } else if (heading) {
    text = heading.textContent;
  }
  return {
    href: a ? a.getAttribute('href') : null,
    text: text.trim(),
  };
}

export default function decorate(block) {
  const rows = [...block.children];

  const tiles = document.createElement('div');
  tiles.className = 'cards-news-tiles';
  const feature = document.createElement('div');
  feature.className = 'cards-news-feature';
  const list = document.createElement('div');
  list.className = 'cards-news-list';

  rows.forEach((row) => {
    const cell = contentCell(row);
    if (!cell) return;
    const h2 = cell.querySelector('h2');
    const h3 = cell.querySelector('h3');
    const paras = [...cell.querySelectorAll('p')];

    if (h2) {
      // Featured item: headline + description + CTA.
      feature.append(h2);
      paras.forEach((p) => {
        const a = p.querySelector('a');
        if (a && p.textContent.trim() === a.textContent.trim()) {
          const cta = document.createElement('a');
          cta.href = a.getAttribute('href');
          cta.className = 'cards-news-cta';
          cta.textContent = a.textContent.trim();
          feature.append(cta);
        } else {
          feature.append(p);
        }
      });
    } else if (paras.length && h3) {
      // Dated news list item.
      const { href, text } = linkOf(h3);
      const item = document.createElement('a');
      item.className = 'cards-news-item';
      moveInstrumentation(row, item);
      if (href) item.href = href;
      const date = document.createElement('span');
      date.className = 'cards-news-date';
      date.textContent = paras[0].textContent.trim();
      const title = document.createElement('span');
      title.className = 'cards-news-title';
      title.textContent = text;
      item.append(date, title);
      list.append(item);
    } else if (h3) {
      // Colored photo tile.
      const { href, text } = linkOf(h3);
      const tile = document.createElement('a');
      tile.className = 'cards-news-tile';
      moveInstrumentation(row, tile);
      if (href) tile.href = href;
      const title = document.createElement('span');
      title.className = 'cards-news-tile-title';
      title.textContent = text;
      tile.append(title);
      tiles.append(tile);
    }
  });

  // Any remaining rows that carry link-list headlines + links (KP c17-link-list),
  // e.g. regional bargaining lists — keep them as a link-list group so their
  // content is not dropped. A row qualifies when it has an h4/h5 heading and
  // one or more links but was not already consumed as a tile/feature/dated item.
  const links = document.createElement('div');
  links.className = 'cards-news-links';
  rows.forEach((row) => {
    const cell = contentCell(row);
    if (!cell) return;
    if (cell.querySelector('h2, h3')) return; // handled above
    const headline = cell.querySelector('h4, h5, h6');
    const anchors = [...cell.querySelectorAll('a[href]')];
    if (headline && anchors.length) {
      const groupHeading = document.createElement('p');
      groupHeading.className = 'cards-news-links-headline';
      groupHeading.textContent = headline.textContent.trim();
      links.append(groupHeading);
      const ul = document.createElement('ul');
      anchors.forEach((a) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        li.append(link);
        ul.append(li);
      });
      links.append(ul);
    }
  });

  block.textContent = '';
  if (tiles.children.length) block.append(tiles);
  if (feature.children.length) block.append(feature);
  if (list.children.length) block.append(list);
  if (links.children.length) block.append(links);
}
