import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * Moves the given attributes from one element to another.
 * @param {Element} from The element to move attributes from
 * @param {Element} to The element to move attributes to
 * @param {string[]} [attributes] The list of attribute names to move; when
 *   omitted, every attribute on `from` is moved.
 */
export function moveAttributes(from, to, attributes) {
  const attrs = attributes || [...from.attributes].map(({ nodeName }) => nodeName);
  attrs.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Moves Universal Editor instrumentation attributes from one element to another.
 * Blocks that rebuild their DOM (replacing authored rows with new elements) must
 * carry these `data-aue-*` / `data-richtext-*` attributes across, or in-context
 * editing breaks on the rebuilt element.
 * @param {Element} from The element to move instrumentation from
 * @param {Element} to The element to move instrumentation to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies section-metadata blocks as section classes / styles.
 * The vendored scripts/aem.js decorateSections() does not process
 * `section-metadata` blocks, so a `style` value (e.g. grey, dark) authored via
 * section metadata never reaches the section as a class. This restores the
 * standard EDS behavior: read each `.section-metadata` block's key/value rows,
 * apply `style` values as classes on the parent section, and expose other keys
 * as `data-*` attributes, then remove the metadata block.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > .section > div > .section-metadata').forEach((meta) => {
    const section = meta.closest('.section');
    [...meta.children].forEach((row) => {
      const cols = [...row.children];
      if (cols.length >= 2) {
        const key = cols[0].textContent.trim().toLowerCase();
        const value = cols[1].textContent.trim();
        if (key === 'style') {
          value.split(',').forEach((s) => {
            const cls = s.trim().toLowerCase().replace(/\s+/g, '-');
            if (cls) section.classList.add(cls);
          });
        } else if (key) {
          section.dataset[key.replace(/[^a-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))] = value;
        }
      }
    });
    // remove the metadata block (and its now-empty wrapper if applicable)
    const wrapper = meta.parentElement;
    meta.remove();
    if (wrapper && wrapper.children.length === 0) wrapper.remove();
  });
}

/**
 * Tags the leading breadcrumb trail so it can be styled as a horizontal
 * breadcrumb rather than a default numbered list. The trail is imported as the
 * first list in the page whose first item links to the site root ("Home").
 * @param {Element} main The main element
 */
function decorateBreadcrumb(main) {
  const list = main.querySelector(':scope > div ol, :scope > div ul');
  if (!list) return;
  const firstLink = list.querySelector('li:first-child a');
  if (!firstLink) return;
  const href = firstLink.getAttribute('href') || '';
  if (href !== '/' && !/^https?:\/\/[^/]+\/?$/.test(href)) return;
  if (firstLink.textContent.trim().toLowerCase() !== 'home') return;
  list.classList.add('breadcrumb');
  const wrapper = list.closest('.default-content-wrapper') || list.parentElement;
  if (wrapper) wrapper.classList.add('breadcrumb-wrapper');
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBreadcrumb(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// Load Universal Editor support only when the page is opened in the DA editor
// host (e.g. *.ue.da.live / *.stage-ue.da.live). Keeps UE code out of the
// production delivery path entirely.
if (/\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`)
    .then(({ default: ue }) => ue())
    // eslint-disable-next-line no-console
    .catch((error) => console.error('Universal Editor support failed to load', error));
}

loadPage();
