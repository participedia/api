import FontFaceObserver from "fontfaceobserver";
import hamburgerMenu from "./hamburger-menu.js";
import elementClosestPolyfill from "./polyfills/element.closest.polyfill.js";
import contactHelpFaqPopover from "./contact-help-faq-popover.js";
import languageSelect from "./language-select.js";
import header from "./header.js";
import tracking from "./utils/tracking.js";
import verifiedMessage from "./show-verified-info.js";
import lazyLoadImages from "./lazy-load-images.js";

function loadFonts() {
  const faktFont = new FontFaceObserver("Fakt", {
    weight: 600,
  });
  faktFont.load().then(
    () => {
      document.documentElement.style.visibility = "visible";
    },
    () => {
      // even if loading fails, show html and it will use the fallback font
      document.documentElement.style.visibility = "visible";
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  // polyfills
  elementClosestPolyfill();

  // common
  loadFonts();
  hamburgerMenu.init();
  contactHelpFaqPopover.init(tracking);
  header.init();
  languageSelect.init(tracking);
  verifiedMessage.init();
  lazyLoadImages.init();

  // Listen to tab events to enable outlines (accessibility improvement)
  document.body.addEventListener("keyup", function(e) {
    if (e.which === 9) {
      /* tab key */
      document.documentElement.classList.remove("no-focus-outline");
    }
  });
});
