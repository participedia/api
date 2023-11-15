import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";
import lazyLoadImages from "./lazy-load-images.js";
import searchFilterList from "./search-filter-list.js";
import map from "./map.js";
import searchMap from "./search-map.js";

document.addEventListener("DOMContentLoaded", () => {
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
  lazyLoadImages.init();
  searchFilterList.init();
  map.init();
  searchMap.init();
});
