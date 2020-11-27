import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import lazyLoadImages from "./lazy-load-images.js";
import csvGenerator from "./csv-generator.js";

document.addEventListener("DOMContentLoaded", () => {
  tabsWithCards.init();
  bookmarkButtons.init();
  lazyLoadImages.init();
  csvGenerator.init();
});
