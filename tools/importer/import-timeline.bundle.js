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

  // tools/importer/import-timeline.js
  var import_timeline_exports = {};
  __export(import_timeline_exports, {
    default: () => import_timeline_default
  });

  // tools/importer/parsers/timeline.js
  function parse(element, { document: document2 }) {
    const container = element.matches(".c36-timeline-container") ? element : element.querySelector(".c36-timeline-container") || element;
    const milestones = container.querySelectorAll(".c36b-timeline-milestone");
    const cells = [];
    milestones.forEach((m) => {
      const yearEl = m.querySelector(".c36b-timeline-milestone__year");
      const img = m.querySelector(".c36b-timeline-milestone__media-item img, .c36b-timeline-milestone__media-wrapper img, img");
      const titleEl = m.querySelector(".c36b-timeline-milestone__text h1, .c36b-timeline-milestone__text h2, .c36b-timeline-milestone__text h3, .c36b-timeline-milestone__text h4");
      const bodyEl = m.querySelector(".c36b-timeline-milestone__body-copy");
      const yearText = yearEl ? yearEl.textContent.trim() : "";
      const titleText = titleEl ? titleEl.textContent.trim() : "";
      let bodyText = bodyEl ? bodyEl.textContent.trim() : "";
      bodyText = bodyText.replace(/\s*[+-]?\s*Read (more|less)\s*/gi, " ").trim();
      if (!yearText && !titleText && !bodyText && !img) return;
      const yearCell = document2.createElement("p");
      yearCell.textContent = yearText;
      let imageCell = "";
      if (img) {
        const clone = document2.createElement("img");
        const src = img.getAttribute("src") || img.getAttribute("data-src");
        if (src) clone.setAttribute("src", src);
        const alt = img.getAttribute("alt") || titleText;
        if (alt) clone.setAttribute("alt", alt);
        imageCell = clone;
      }
      const textNodes = [];
      if (titleText) {
        const h = document2.createElement("h3");
        h.textContent = titleText;
        textNodes.push(h);
      }
      if (bodyText) {
        const p = document2.createElement("p");
        p.textContent = bodyText;
        textNodes.push(p);
      }
      cells.push([yearCell, imageCell, textNodes.length ? textNodes : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "timeline", cells });
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

  // tools/importer/import-timeline.js
  var parsers = {
    timeline: parse
  };
  var PAGE_TEMPLATE = {
    name: "timeline",
    description: "Timeline page: breadcrumb, page hero title band, chronological timeline of milestones.",
    urls: ["https://about.kaiserpermanente.org/who-we-are/our-people/milestones-in-nursing-history"],
    blocks: [
      { name: "timeline", instances: [".c36-timeline-container"] }
    ],
    sections: [
      { id: "section-1", name: "section-hero-title", selector: ".c14-page-hero", style: null, blocks: [], defaultContent: [".c14-page-hero"] },
      { id: "section-2", name: "section-timeline", selector: ".c36-timeline-container", style: null, blocks: ["timeline"], defaultContent: [] }
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
  var import_timeline_default = {
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
  return __toCommonJS(import_timeline_exports);
})();
