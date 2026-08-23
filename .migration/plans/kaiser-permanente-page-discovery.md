# Kaiser Permanente Site — Page & Layout Discovery Plan

## Goal
Discover **all pages (URLs)** and **all layouts (page templates/types)** for **https://about.kaiserpermanente.org/**, producing a complete catalog of the site's structure across the **entire domain** — the foundation for a full migration to AEM Edge Delivery Services.

## Scope (confirmed)
- **Breadth:** Entire site — every page across the full domain.
- **Goal:** Full catalog for migration — complete URL inventory **plus** layout templates.
- **Discovery/cataloging only** — no content import, block instrumentation, or design migration in this plan.

## Approach
1. **URL discovery** — enumerate every page (sitemap-first at `/sitemap.xml`; crawl fallback).
2. **Template cataloging** — analyze representative pages, group structurally similar pages into layout templates, catalog block variants, and produce the site catalog.

## Checklist
- [ ] Set up the catalog project structure
- [ ] Run URL discovery (sitemap-first, crawl fallback) and collect the complete URL list
- [ ] Report total URL count with a breakdown by path/section
- [ ] Analyze representative pages across each distinct URL pattern
- [ ] Group all URLs into layout templates (discover templates)
- [ ] Name each template (name + description + matching URLs)
- [ ] Catalog block variants across the templates
- [ ] Produce the site catalog and summarize: total pages, number of layouts, what each layout represents

## Deliverables
- Complete URL inventory for the entire site
- `catalog/template-catalog.json` — layout templates with names, descriptions, matching URLs
- `catalog/block-catalog.json` — block variants across the site
- `catalog/summary.json` and `tools/importer/page-templates.json` — migration scoping foundation
- Summary of distinct page types the site uses

## Execution Status
Scope is confirmed and the cataloging workflow is staged (task list created, catalog setup task in progress). **The remaining steps — catalog setup, URL discovery, page analysis, template discovery/naming, and block cataloging — all require write/execution operations that Plan mode blocks (read-only tools only).**

⚠️ **Note:** A prior session already ran this exact discovery to completion (876 pages, 22 layouts, 103 block variants). If the intent is to **re-run** discovery fresh, be aware it will overwrite the existing catalog; if the intent is simply to **review** those results, no execution is needed.

➡️ **Action needed: switch to Execute mode using the plan/mode toggle in the UI.** Once switched, I'll run the checklist end-to-end automatically, starting with catalog setup and full-site URL discovery, and report the URL count and section breakdown before deep template analysis.
