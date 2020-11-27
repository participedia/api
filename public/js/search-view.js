import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";
import lazyLoadImages from "./lazy-load-images.js";
import searchFilterList from "./search-filter-list.js";
import csvGenerator from "./csv-generator.js";

document.addEventListener("DOMContentLoaded", () => {
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
  lazyLoadImages.init();
  searchFilterList.init();
  csvGenerator.init();
});
