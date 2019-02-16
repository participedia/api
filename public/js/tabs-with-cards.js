import { updateUrlParams } from "./utils/utils.js";

const tabsWithCards = {
  init() {
    this.tabInputEls = Array.prototype.slice.call(
      document.querySelectorAll(".js-tab-container input[name='tabs']")
    );
    this.viewEl = document.querySelector("[data-card-layout]");

    if (this.tabInputEls.length === 0) return;

    // tabs ui
    this.initDesktopTabNav();
    this.initMobileTabNav();

    if (!this.viewEl) return;
    // cards ui
    this.initCardLayout();
    this.initPagination();
    this.initSortBy();
  },

  initDesktopTabNav() {
    // update url param to indicate current tab
    this.tabInputEls.forEach(el => {
      el.addEventListener("click", event => {
        updateUrlParams("tab", event.target.id);
      });
    });
  },

  initMobileTabNav() {
    const selectEl = document.querySelector(".js-tab-select-container select");

    if (!selectEl) return;

    // select current tab
    const optionEls = Array.prototype.slice.call(selectEl.querySelectorAll("option"));
    const currentTab = this.tabInputEls.find(el => el.checked);
    optionEls.forEach(el => el.selected = el.value === currentTab.id);

    // event listener for select change
    selectEl.addEventListener("change", event => {
      // change tab to selected type
      const newTabId = event.target.value;
      // toggle checked attr on inputs
      this.tabInputEls.forEach(el => el.checked = el.id === newTabId);
      // update url
      updateUrlParams("tab", newTabId);
    });
  },

  initSortBy() {
    const sortByMenuEl = this.viewEl.querySelector(".js-sort-by-menu");
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
      this.viewEl.querySelectorAll(".js-pagination-nav")
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
    const toggleLayoutBtnsEl = this.viewEl.querySelector(".js-card-layout-btns");

    // event listeners for grid/list toggle buttons
    toggleLayoutBtnsEl.addEventListener("click", event => {
      const btnEl = event.target.closest("button");

      if (btnEl) {
        const type = btnEl.getAttribute("data-type");
        if (!type) return;
        updateUrlParams("layout", type);
        this.viewEl.setAttribute("data-card-layout", type);
      }
    });
  },
};

export default tabsWithCards;
