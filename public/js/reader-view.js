import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import lazyLoadImages from "./lazy-load-images.js";
import tooltipTriggerAndModal from "./tooltip-trigger-and-modal.js";

document.addEventListener("DOMContentLoaded", () => {
  bookmarkButtons.init();
  tabsWithCards.init();
  lazyLoadImages.init();
  tooltipTriggerAndModal.init();
});
