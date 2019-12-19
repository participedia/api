import "lazysizes";
import map from "./map.js";
import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";
import searchFilters from "./search-filters.js";

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
  searchFilters.init();

  document.addEventListener("lazybeforeunveil", (e) => {
    const bgUrl = e.target.getAttribute("data-bg");
    if (bgUrl) {
      e.target.style.backgroundImage = `url(${bgUrl})`;
    }
  });
});
