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

  // tools/importer/import-landing-hub.js
  var import_landing_hub_exports = {};
  __export(import_landing_hub_exports, {
    default: () => import_landing_hub_default
  });

  // tools/importer/parsers/cards-news.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const linkedHeading = (level, text, href) => {
      const h = document2.createElement(level);
      if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = text;
        h.append(a);
      } else {
        h.textContent = text;
      }
      return h;
    };
    const pushCard = (imgCell, textNodes) => {
      const textNonEmpty = textNodes.filter(Boolean);
      if (!imgCell && textNonEmpty.length === 0) return;
      cells.push([imgCell || "", textNonEmpty.length ? textNonEmpty : ""]);
    };
    const tiles = element.querySelectorAll(".c06-content-tile__wrap, .c06a-content-tile__wrap");
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const img = tile.querySelector(".c06-content-tile__bg-image img, .c06a-content-tile__bg-image img, img");
      const headlineEl = tile.querySelector(".c06-content-tile__headline, .c06a-content-tile__headline");
      const headline = headlineEl ? headlineEl.textContent.trim() : "";
      const href = link ? link.getAttribute("href") : "";
      pushCard(img || null, [linkedHeading("h3", headline, href)]);
    });
    const feature = element.querySelector(".c08-feature__wrap");
    if (feature) {
      const img = feature.querySelector(".c08-feature__background-wrap img, img");
      const heading = feature.querySelector(".c08-feature__headline");
      const text = feature.querySelector(".c08-feature__text");
      const cta = feature.querySelector("a.c08-feature__link.button, a.c08-feature__link:not(.c08-feature__link--absolute)");
      const textNodes = [];
      if (heading && heading.textContent.trim()) textNodes.push(heading);
      if (text && text.textContent.trim()) textNodes.push(text);
      if (cta) textNodes.push(cta);
      pushCard(img || null, textNodes);
    }
    const listLinks = element.querySelectorAll(".c17-link-list__link");
    listLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const eyebrow = link.querySelector(".c17-link-list__eyebrow");
      const titleEl = link.querySelector(".c17-link-list__title");
      const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim();
      const textNodes = [];
      if (eyebrow && eyebrow.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        textNodes.push(p);
      }
      textNodes.push(linkedHeading("h3", title, href));
      pushCard(null, textNodes);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media-copy.js
  function parse2(element, { document: document2 }) {
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
  function parse3(element, { document: document2 }) {
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

  // tools/importer/import-landing-hub.js
  var parsers = {
    "cards-news": parse,
    "columns-media-copy": parse2,
    "cards-quicklinks": parse3
  };
  var PAGE_TEMPLATE = {
    name: "landing-hub",
    description: "Homepage / hub: hero mosaic, featured callout, news list, quick-link cards.",
    urls: ["https://about.kaiserpermanente.org/"],
    blocks: [
      { name: "cards-news", instances: [".c05-column-control:has(.c08-feature)"] },
      { name: "columns-media-copy", instances: [".c13-horizontal-media-with-copy"], section: "grey" },
      { name: "cards-quicklinks", instances: [".c05-column-control:not(:has(.c08-feature))"] }
    ],
    sections: [
      { id: "section-2", name: "section-news-mosaic", selector: ".c05-column-control:has(.c08-feature)", style: null, blocks: ["cards-news"], defaultContent: [] },
      { id: "section-3", name: "section-annual-report-callout", selector: ".c13-horizontal-media-with-copy", style: "grey", blocks: ["columns-media-copy"], defaultContent: [] },
      { id: "section-4", name: "section-quicklinks", selector: ".c05-column-control:not(:has(.c08-feature))", style: null, blocks: ["cards-quicklinks"], defaultContent: [] }
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
  var import_landing_hub_default = {
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
  return __toCommonJS(import_landing_hub_exports);
})();
