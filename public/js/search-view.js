import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";
import searchFilters from "./search-filters.js";
import searchFilterList from "./search-filter-list.js";
import lazyLoadImages from "./lazy-load-images.js";

document.addEventListener("DOMContentLoaded", () => {
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
  searchFilters.init();
  lazyLoadImages.init();
  searchFilterList.init();
});
