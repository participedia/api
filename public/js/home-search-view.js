import map from "./map.js";
import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import dropdownButton from "./dropdown-button.js";

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  tabsWithCards.init();
  bookmarkButtons.init();
  dropdownButton.init();
});
