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

/**
 * Moves the given attributes from one element to another.
 * @param {Element} from The element to move attributes from
 * @param {Element} to The element to move attributes to
 * @param {string[]} [attributes] The attribute names to move; when omitted, all are moved.
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
