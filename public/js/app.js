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
import viewSlideshow from "./view-slideshow.js";
import viewSocialMedia from "./view-socialmedia.js";
import accordion from "./accordion.js";
import map from "./map.js";
import tabs from "./tabs.js";
import homeSearch from "./home-search.js";

// polyfills
elementClosestPolyfill();

// common
header.init();
contactHelpFaqWidget.init();
map.init();
tabs.init();
homeSearch.init();

const viewType = document.querySelector("[data-view]").getAttribute("data-view");

if (viewType === "edit") {
  editMultiSelect.init();
  editRichText.init();
  editLocation.init();
  editLinkSet.init();
  editMedia.init();
  editWarning.init();
  editSubmissionDetails.init();
  editTextarea.init();
}

if (viewType === "view") {
  viewSlideshow.init();
  viewSocialMedia.init();
  accordion.init();
}
