import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment(footerPath);
  // fallback for local dev where content is served under /content
  if (!fragment && footerPath !== '/content/footer') {
    fragment = await loadFragment('/content/footer');
  }
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  footer.classList.add('footer-content');

  // classify sections: brand column + trailing legal/utility bar
  const sections = [...footer.children];
  if (sections[0]) sections[0].classList.add('footer-brand');
  const last = sections[sections.length - 1];
  if (last && !last.querySelector('h1, h2, h3, h4, h5, h6')) {
    last.classList.add('footer-legal');
  }

  block.append(footer);
}
