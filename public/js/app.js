import FontFaceObserver from "fontfaceobserver";

import header from './header.js';
import elementClosestPolyfill from './polyfills/element.closest.polyfill.js';
import editMultiSelect from './edit-multi-select.js';
import editRichText from './edit-rich-text.js';
import editLocation from './edit-location.js';
import editMedia from './edit-media.js';
import editLinkSet from './edit-link-set.js';
import editWarning from './edit-warning.js';
import contactHelpFaqWidget from "./contact-help-faq-widget.js";
import editSubmissionDetails from "./edit-submission-details.js";
import editTextarea from './edit-textarea.js';
import editForm from './edit-form.js';
import viewSlideshow from "./view-slideshow.js";
import viewSocialMedia from "./view-socialmedia.js";
import homeSearch from "./home-search.js";
import userView from "./user-view.js";
import dropdownButton from "./dropdown-button.js";

function loadFonts() {
  const faktFont = new FontFaceObserver('Fakt');
  faktFont.load().then(() => {
    document.documentElement.style.visibility = "visible";
  }, () => {
    // even if loading fails, show html and it will use the fallback font
    document.documentElement.style.visibility = "visible";
  });
}

function isEditPage() {
  return window.location.pathname.lastIndexOf('/edit') > 0;
}

function isUserPage() {
  return window.location.pathname.lastIndexOf('/user') >= 0;
}

// polyfills
elementClosestPolyfill();

// common
loadFonts();
header.init();
contactHelpFaqWidget.init();
dropdownButton.init();

if (window.location.pathname === "/") {
  // home/search page
  homeSearch.init();
}

if (isUserPage() & !isEditPage()) {
  // user view page
  userView.init();
}

const viewType = document.querySelector("[data-view]").getAttribute("data-view");

if (isEditPage()) {
  editMultiSelect.init();
  editRichText.init();
  editLocation.init();
  editLinkSet.init();
  editMedia.init();
  editWarning.init();
  editSubmissionDetails.init();
  editTextarea.init();
  editForm.init();
}

if (viewType === "view") {
  viewSlideshow.init();
  viewSocialMedia.init();
}
