/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-content-with-media.js
  var import_content_with_media_exports = {};
  __export(import_content_with_media_exports, {
    default: () => import_content_with_media_default
  });

  // tools/importer/parsers/columns-media-copy.js
  function parse(element, { document: document2 }) {
    const media = element.querySelector(".c13-horizontal-media-with-copy__media-wrapper");
    const mediaScope = media || element;
    const mediaLink = mediaScope.querySelector("a[href]");
    let img = mediaScope.querySelector(".c13-horizontal-media-with-copy__bg-image img, img");
    if (!img) {
      const bg = mediaScope.querySelector('.c13-horizontal-media-with-copy__bg-image, [style*="background-image"]');
      if (bg) {
        const style = bg.getAttribute("style") || "";
        const m = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/i);
        if (m && m[2]) {
          img = document2.createElement("img");
          img.setAttribute("src", m[2]);
          const alt = bg.getAttribute("title") || bg.getAttribute("aria-label") || "";
          if (alt) img.setAttribute("alt", alt);
        }
      }
    }
    const content = element.querySelector(".c13-horizontal-media-with-copy__content");
    const scope = content || element;
    const heading = scope.querySelector(".c13-horizontal-media-with-copy__headline, h1, h2, h3");
    const text = scope.querySelector(".c13-horizontal-media-with-copy__text, p");
    const cta = scope.querySelector(".c13-horizontal-media-with-copy__link a, a.button");
    const copyCell = [];
    if (heading && heading.textContent.trim()) copyCell.push(heading);
    if (text && text.textContent.trim()) copyCell.push(text);
    if (cta && (cta.textContent.trim() || cta.getAttribute("href"))) copyCell.push(cta);
    let imageCell = "";
    if (img) {
      if (mediaLink) {
        const a = document2.createElement("a");
        a.setAttribute("href", mediaLink.getAttribute("href"));
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
    const cells = [[copyCell.length ? copyCell : "", imageCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media-copy", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quicklinks.js
  function parse2(element, { document: document2 }) {
    const cells = [];
    const tiles = element.querySelectorAll(".c06-content-tile__wrap, .c06a-content-tile__wrap");
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const img = tile.querySelector(".c06-content-tile__bg-image img, .c06a-content-tile__bg-image img, img");
      const headlineEl = tile.querySelector(".c06-content-tile__headline, .c06a-content-tile__headline");
      const headlineText = headlineEl ? headlineEl.textContent.trim() : "";
      const href = link ? link.getAttribute("href") : "";
      const heading = document2.createElement("h3");
      if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = headlineText;
        heading.append(a);
      } else {
        heading.textContent = headlineText;
      }
      if (!img && !headlineText) return;
      cells.push([img || "", heading]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-quicklinks", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news-list.js
  function parse3(element, { document: document2 }) {
    const isRelated = element.querySelectorAll(".filtered-card-grid__item").length === 0 && element.querySelectorAll(".related-cards__card").length > 0;
    const cells = [];
    if (isRelated) {
      const seen = /* @__PURE__ */ new Set();
      element.querySelectorAll("a.related-cards__card, .related-cards__card").forEach((item) => {
        const href = item.getAttribute("href") || (item.querySelector("a[href]") ? item.querySelector("a[href]").getAttribute("href") : null);
        if (href && seen.has(href)) return;
        if (href) seen.add(href);
        const img = item.querySelector("img.related-cards__img, img");
        const dateText = (item.querySelector(".related-cards__eyebrow") || {}).textContent || "";
        const titleText = (item.querySelector(".related-cards__title, .related-cards__headline") || {}).textContent || "";
        const copyText = (item.querySelector(".related-cards__text") || {}).textContent || "";
        if (!img && !titleText.trim() && !copyText.trim()) return;
        const textCell = [];
        if (dateText.trim()) {
          const dateP = document2.createElement("p");
          dateP.textContent = dateText.trim();
          textCell.push(dateP);
        }
        if (titleText.trim()) {
          const heading = document2.createElement("h3");
          if (href) {
            const a = document2.createElement("a");
            a.setAttribute("href", href);
            a.textContent = titleText.trim();
            heading.appendChild(a);
          } else {
            heading.textContent = titleText.trim();
          }
          textCell.push(heading);
        }
        if (copyText.trim()) {
          const copyP = document2.createElement("p");
          copyP.textContent = copyText.trim();
          textCell.push(copyP);
        }
        cells.push([img || "", textCell]);
      });
      if (cells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const relatedBlock = WebImporter.Blocks.createBlock(document2, { name: "cards-news-list", cells });
      element.replaceWith(relatedBlock);
      return;
    }
    const items = element.querySelectorAll(".filtered-card-grid__item");
    items.forEach((item) => {
      const link = item.querySelector("a.filtered-card-grid__item__wrapper, a[href]");
      const href = link ? link.getAttribute("href") : null;
      const img = item.querySelector(".filtered-card-grid__image img, img");
      const eyebrowEl = item.querySelector(".filtered-card-grid__eyebrow");
      const titleEl = item.querySelector(".filtered-card-grid__title");
      const copyEl = item.querySelector(".filtered-card-grid__copy");
      const dateText = eyebrowEl ? eyebrowEl.textContent.trim() : "";
      const titleText = titleEl ? titleEl.textContent.trim() : "";
      const copyText = copyEl ? copyEl.textContent.trim() : "";
      if (!img && !titleText && !copyText) return;
      const textCell = [];
      if (dateText) {
        const dateP = document2.createElement("p");
        dateP.textContent = dateText;
        textCell.push(dateP);
      }
      if (titleText) {
        const heading = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          heading.appendChild(a);
        } else {
          heading.textContent = titleText;
        }
        textCell.push(heading);
      } else if (href) {
        const heading = document2.createElement("h3");
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = href;
        heading.appendChild(a);
        textCell.push(heading);
      }
      if (copyText) {
        const copyP = document2.createElement("p");
        copyP.textContent = copyText;
        textCell.push(copyP);
      }
      cells.push([img || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kaiserpermanente-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust cookie banner (cleaned.html:631)
        "div.cloudservice.testandtarget",
        // Adobe DTM test-and-target node (cleaned.html:627)
        "div.cloudservice.google-recaptcha",
        // reCAPTCHA config node (cleaned.html:629)
        ".c38-alert-popup"
        // empty alert popup wrapper (cleaned.html:340)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".header",
        // header grid-column wrapper (cleaned.html:12)
        "header",
        // inner <header> element (cleaned.html:13)
        ".footer",
        // footer grid-column wrapper (cleaned.html:547)
        "footer",
        // any inner <footer> element
        "link",
        // stray clientlib <link> (cleaned.html:626)
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/kaiserpermanente-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-content-with-media.js
  var parsers = {
    "columns-media-copy": parse,
    "cards-quicklinks": parse2,
    "cards-news-list": parse3
  };
  var PAGE_TEMPLATE = {
    name: "content-with-media",
    description: "Interior content page: page hero + alternating media-copy bands and card groups.",
    urls: ["https://about.kaiserpermanente.org/who-we-are/our-history"],
    blocks: [
      { name: "columns-media-copy", instances: [".c13-horizontal-media-with-copy"] },
      { name: "cards-quicklinks", instances: [".c05-column-control:has(.c06-content-tile):not(:has(.c04-filtered-card-grid))"] },
      { name: "cards-news-list", instances: [".c05-column-control:has(.c04-filtered-card-grid)"] }
    ],
    sections: [
      { id: "section-1", name: "section-hero-title", selector: ".c14-page-hero", style: null, blocks: [], defaultContent: [".c14-page-hero"] },
      { id: "section-2", name: "section-history-band-1", selector: ".c13-horizontal-media-with-copy", style: null, blocks: ["columns-media-copy"], defaultContent: [] },
      { id: "section-3", name: "section-history-tiles", selector: ".c05-column-control:has(.c06-content-tile):not(:has(.c04-filtered-card-grid))", style: null, blocks: ["cards-quicklinks"], defaultContent: [] },
      { id: "section-6", name: "section-history-grid", selector: ".c05-column-control:has(.c04-filtered-card-grid)", style: null, blocks: ["cards-news-list"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_content_with_media_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_content_with_media_exports);
})();
