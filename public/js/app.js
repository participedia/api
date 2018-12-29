import header from './header.js';
import elementClosestPolyfill from './polyfills/element.closest.polyfill.js';
import editMultiSelect from './edit-multi-select.js';
import editRichText from './edit-rich-text.js';

// polyfills
elementClosestPolyfill();

// common
header.init();

// case edit form
// only init edit form fields if on edit page
// todo: handle dynamic imports of edit field js so we don't import if not needed
if (window.location.pathname.indexOf('edit') > 0) {
  editMultiSelect.init();
  editRichText.init();
}
