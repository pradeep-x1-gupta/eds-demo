/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { moveInstrumentation } from './ue-utils.js';

/*
 * Universal Editor support for Document Authoring content.
 *
 * When an author edits a block in the Universal Editor, the block's authored
 * rows are re-patched into the DOM and the block re-decorates -- rebuilding its
 * rows into new list items. These observers re-map the `data-aue-*`
 * instrumentation from the removed authored rows onto the freshly created list
 * items so in-context editing keeps working after each edit.
 *
 * Blocks that rebuild rows 1:1 into <li> (cards and its variants) or <li> under
 * an <ol> (timeline) are handled by index mapping. `cards-news` is intentionally
 * NOT index-mapped: it reclassifies rows heuristically (feature / tile / dated
 * list), so a positional map would be wrong -- see the note in setupObservers.
 */

// Container blocks that rebuild each authored row into a single list item.
const LIST_REBUILD_BLOCKS = 'div.cards, div.cards-quicklinks, div.cards-news-list, div.timeline';

const setupObservers = () => {
  const mutatingBlocks = document.querySelectorAll(LIST_REBUILD_BLOCKS);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'childList' || mutation.target.tagName !== 'DIV') return;

      const added = [...mutation.addedNodes];
      const removedDivs = [...mutation.removedNodes].filter((node) => node.tagName === 'DIV');

      // cards / cards-quicklinks / cards-news-list rebuild rows into a <ul>;
      // timeline rebuilds rows into an <ol>. Either way the authored rows map
      // 1:1 by index onto the new list's children.
      const list = added.find((node) => node.tagName === 'UL' || node.tagName === 'OL');
      if (list && removedDivs.length) {
        removedDivs.forEach((div, index) => {
          if (index < list.children.length) {
            moveInstrumentation(div, list.children[index]);
          }
        });
      }
    });
  });

  mutatingBlocks.forEach((block) => {
    observer.observe(block, { childList: true, subtree: true });
  });

  // NOTE: `cards-news` is deliberately excluded above. It classifies each row
  // into a feature / tile / dated-list item based on content, so there is no
  // stable positional mapping to re-instrument against. Editing it in-context
  // works at the field level, but structural re-mapping is not attempted here.
};

const setupUEEventHandlers = () => {
  // When a media (image) property is patched, strip the responsive <source>
  // and srcset so the newly selected image renders instead of the cached one.
  document.body.addEventListener('aue:content-patch', ({ detail: { patch, request } }) => {
    let element = document.querySelector(`[data-aue-resource="${request.target.resource}"]`);
    if (element && element.getAttribute('data-aue-prop') !== patch.name) {
      element = element.querySelector(`[data-aue-prop='${patch.name}']`);
    }
    if (element?.getAttribute('data-aue-type') !== 'media') return;

    const picture = element.tagName === 'IMG' ? element.closest('picture') : element;
    picture?.querySelectorAll('source').forEach((source) => source.remove());
    picture?.querySelector('img')?.removeAttribute('srcset');
  });
};

export default () => {
  setupObservers();
  setupUEEventHandlers();
};
