export default function decorate(block) {
  // Article hero: a text column (date eyebrow + heading + intro) beside a
  // media column (image + caption).
  // Authored content model (KP article hero), defensive to omitted cells:
  //   Media cell: image (picture/img), optionally with a caption paragraph.
  //   Text cell:  heading plus paragraphs -- a date-like paragraph becomes the
  //               eyebrow (hoisted above the heading); the remaining paragraphs
  //               are intro copy; a trailing paragraph acts as the image caption
  //               when the media cell has none of its own.
  const rows = [...block.children];

  // Identify the media cell: the first cell containing a picture/img.
  let mediaCell = null;
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!mediaCell && cell.querySelector('picture, img')) mediaCell = cell;
  });

  const text = document.createElement('div');
  text.className = 'hero-article-text';
  const media = document.createElement('div');
  media.className = 'hero-article-media';

  // Move the image into the media column and capture any in-cell caption.
  let caption = null;
  if (mediaCell) {
    const pic = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
    if (pic) media.append(pic.closest('picture') || pic);
    mediaCell.querySelectorAll('p').forEach((p) => {
      if (!p.querySelector('picture, img') && p.textContent.trim()) caption = p;
    });
  }

  // Collect the text-side elements (everything outside the media cell), in order.
  const els = [];
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell === mediaCell) return;
      [...cell.children].forEach((el) => els.push(el));
    });
  });

  const heading = els.find((e) => /^H[1-6]$/.test(e.tagName));
  const paras = els.filter((e) => e.tagName === 'P' && e.textContent.trim());

  // A date-like paragraph (e.g. "May 15, 2024") is the eyebrow.
  const dateRe = /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}$/i;
  const eyebrow = paras.find((p) => dateRe.test(p.textContent.trim()));

  // Body paragraphs are the intro; the last one becomes the caption when the
  // media cell did not supply its own.
  const body = paras.filter((p) => p !== eyebrow);
  if (!caption && body.length > 1) caption = body.pop();

  if (eyebrow) {
    eyebrow.classList.add('hero-article-eyebrow');
    text.append(eyebrow);
  }
  if (heading) text.append(heading);
  body.forEach((p) => {
    p.classList.add('hero-article-intro');
    text.append(p);
  });

  if (caption) {
    caption.classList.add('hero-article-caption');
    media.append(caption);
  }

  block.textContent = '';
  block.append(text);
  if (media.querySelector('picture, img')) block.append(media);
  else block.classList.add('hero-article-no-media');
}
