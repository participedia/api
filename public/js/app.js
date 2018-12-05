import header from './header.js';
import elementClosestPolyfill from './polyfills/element.closest.polyfill.js';
import editMultiSelect from './edit-multi-select.js';

// polyfills
elementClosestPolyfill();

// common
header.init();

// case edit form
editMultiSelect.init();
