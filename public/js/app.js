import FontFaceObserver from "fontfaceobserver";
import hamburgerMenu from "./hamburger-menu.js";
import elementClosestPolyfill from "./polyfills/element.closest.polyfill.js";
import contactHelpFaqWidget from "./contact-help-faq-widget.js";
import headerProfileDropdownMenu from "./header-profile-dropdown-menu.js";
import languageSelect from "./language-select.js";

function loadFonts() {
  const faktFont = new FontFaceObserver("Fakt", {
    weight: 600,
  });
  faktFont.load().then(() => {
    document.documentElement.style.visibility = "visible";
  }, () => {
    // even if loading fails, show html and it will use the fallback font
    document.documentElement.style.visibility = "visible";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // polyfills
  elementClosestPolyfill();

  // common
  loadFonts();
  hamburgerMenu.init();
  contactHelpFaqWidget.init();
  headerProfileDropdownMenu.init();
  languageSelect.init();

  // Listen to tab events to enable outlines (accessibility improvement)
  document.body.addEventListener("keyup", function(e) {
    if (e.which === 9) { /* tab key */
      document.documentElement.classList.remove("no-focus-outline");
    }
  });
});
