import FontFaceObserver from "fontfaceobserver";
import header from "./header.js";
import elementClosestPolyfill from "./polyfills/element.closest.polyfill.js";
import contactHelpFaqWidget from "./contact-help-faq-widget.js";
import headerProfileDropdownMenu from "./header-profile-dropdown-menu.js";

function loadFonts() {
  const faktFont = new FontFaceObserver("Fakt");
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
  header.init();
  contactHelpFaqWidget.init();
  headerProfileDropdownMenu.init();
});
