import map from "./map.js";
import tabs from "./tabs.js";
import { updateUrlParams } from "./utils/utils.js";

const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    map.init();

    tabs.init();

    this.initCardLayout();

    this.initPagination();

    this.initSortBy();

  },

  initSortBy() {
    const sortByMenuEl = this.homeSearchEl.querySelector(".js-sort-by-menu");
    sortByMenuEl.addEventListener("click", event => {
      const link = event.target.closest("a");
      if (link) {
        event.preventDefault();
        const sortBy = link.getAttribute("data-sortby");
        updateUrlParams("sortby", sortBy);
        window.location.href = window.location.href;
      }
    });
  },

  initPagination() {
    const paginationNavEls = Array.prototype.slice.call(
      this.homeSearchEl.querySelectorAll(".js-pagination-nav")
    );

    paginationNavEls.forEach(el => {
      el.addEventListener("click", event => {
        event.preventDefault();
        const link = event.target.closest("a");
        if (link) {
          updateUrlParams("page", link.getAttribute("data-page-num"));
          window.location.href = window.location.href;
        }
      });
    });
  },

  initCardLayout() {
    const toggleLayoutBtnsEl = this.homeSearchEl.querySelector(".js-card-layout-btns");

    // event listeners for grid/list toggle buttons
    toggleLayoutBtnsEl.addEventListener("click", event => {
      const btnEl = event.target.closest("button");

      if (btnEl) {
        const type = btnEl.getAttribute("data-type");
        if (!type) return;
        updateUrlParams("layout", type);
        this.homeSearchEl.setAttribute("data-layout", type);
      }
    });
  },
}

export default homeSearch;
