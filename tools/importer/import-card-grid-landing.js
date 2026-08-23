/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsNewsListParser from './parsers/cards-news-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kaiserpermanente-cleanup.js';
import sectionsTransformer from './transformers/kaiserpermanente-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-news-list': cardsNewsListParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'card-grid-landing',
  description: 'Landing page: page hero title band, intro body, and a related-card-grid of cards.',
  urls: ['https://about.kaiserpermanente.org/expertise-and-impact/public-policy/our-impact'],
  blocks: [
    { name: 'cards-news-list', instances: ['.c28-related-card-grid'] },
  ],
  sections: [
    { id: 'section-1', name: 'section-hero-title', selector: '.c14-page-hero', style: null, blocks: [], defaultContent: ['.c14-page-hero'] },
    { id: 'section-2', name: 'section-intro-body', selector: '.c05-column-control', style: null, blocks: [], defaultContent: ['.c05-column-control'] },
    { id: 'section-3', name: 'section-related-grid', selector: '.c28-related-card-grid', style: null, blocks: ['cards-news-list'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
