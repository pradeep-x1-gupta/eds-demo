/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsNewsParser from './parsers/cards-news.js';
import columnsMediaCopyParser from './parsers/columns-media-copy.js';
import cardsQuicklinksParser from './parsers/cards-quicklinks.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kaiserpermanente-cleanup.js';
import sectionsTransformer from './transformers/kaiserpermanente-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-news': cardsNewsParser,
  'columns-media-copy': columnsMediaCopyParser,
  'cards-quicklinks': cardsQuicklinksParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-hub',
  description: 'Homepage / hub: hero mosaic, featured callout, news list, quick-link cards.',
  urls: ['https://about.kaiserpermanente.org/'],
  blocks: [
    { name: 'cards-news', instances: ['.c05-column-control:has(.c08-feature)'] },
    { name: 'columns-media-copy', instances: ['.c13-horizontal-media-with-copy'], section: 'grey' },
    { name: 'cards-quicklinks', instances: ['.c05-column-control:not(:has(.c08-feature))'] },
  ],
  sections: [
    { id: 'section-2', name: 'section-news-mosaic', selector: '.c05-column-control:has(.c08-feature)', style: null, blocks: ['cards-news'], defaultContent: [] },
    { id: 'section-3', name: 'section-annual-report-callout', selector: '.c13-horizontal-media-with-copy', style: 'grey', blocks: ['columns-media-copy'], defaultContent: [] },
    { id: 'section-4', name: 'section-quicklinks', selector: '.c05-column-control:not(:has(.c08-feature))', style: null, blocks: ['cards-quicklinks'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (after parsing)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map homepage root to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
