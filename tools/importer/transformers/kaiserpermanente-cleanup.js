/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: kaiserpermanente site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html for
 * about.kaiserpermanente.org (classic AEM .par.responsivegrid / .aem-Grid shell).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent + tracking/cloudservice nodes and empty alert popup.
    // Removed before parsing so they never interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',            // OneTrust cookie banner (cleaned.html:631)
      'div.cloudservice.testandtarget',   // Adobe DTM test-and-target node (cleaned.html:627)
      'div.cloudservice.google-recaptcha', // reCAPTCHA config node (cleaned.html:629)
      '.c38-alert-popup',                 // empty alert popup wrapper (cleaned.html:340)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome: header/nav and footer are auto-populated in EDS.
    WebImporter.DOMUtils.remove(element, [
      '.header',   // header grid-column wrapper (cleaned.html:12)
      'header',    // inner <header> element (cleaned.html:13)
      '.footer',   // footer grid-column wrapper (cleaned.html:547)
      'footer',    // any inner <footer> element
      'link',      // stray clientlib <link> (cleaned.html:626)
      'noscript',
    ]);
  }
}
