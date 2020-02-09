import map from "./map.js";
import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";
import searchFilters from "./search-filters.js";
import lazyLoadImages from "./lazy-load-images.js";

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
  searchFilters.init();
  lazyLoadImages.init();
});
