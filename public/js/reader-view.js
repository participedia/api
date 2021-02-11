import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import lazyLoadImages from "./lazy-load-images.js";
import infoIconToModal from "./info-icon-to-modal.js";

document.addEventListener("DOMContentLoaded", () => {
  bookmarkButtons.init();
  tabsWithCards.init();
  lazyLoadImages.init();
  infoIconToModal.init();
});
