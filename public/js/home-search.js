import map from "./map.js";

const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    // init map
    map.init();

    this.initCardLayout();

    this.initPagination();

    this.initMobileTabNav();

    this.initTabs();

    // todo add event listeners sort by functionality

  },

  initTabs() {
    const tabInputEls = Array.prototype.slice.call(
      this.homeSearchEl.querySelectorAll(".js-tab-container input[name='tabs']")
    );
    tabInputEls.forEach(el => {
      el.addEventListener("click", event => {
        this.updateUrlParams("tab", event.target.id)
      });
    });
  },

  initMobileTabNav() {
    const selectEl = this.homeSearchEl.querySelector(".js-article-select-container select");
    selectEl.addEventListener("change", event => {
      // change tab to selected type
      // console.log('event.target.value', event.target.value)
    });
  },

  updateUrlParams(key, value) {
    const params = window.location.search;

    if (!params) return;

    const paramsArr = params.split("?")[1].split("&").map(p => p.split("="));
    const paramsObj = {};
    paramsArr.forEach(param => paramsObj[param[0]] = param[1]);

    // add/update param
    paramsObj[key] = value;

    let newParamsString = "";
    Object.keys(paramsObj).forEach(key => {
      newParamsString += `${key}=${paramsObj[key]}&`;
    });
    // update url without reloading page
    history.pushState({}, "", `/?${newParamsString.slice(0, -1)}`);
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
          this.updateUrlParams("page", link.getAttribute("data-page-num"));
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

        this.updateUrlParams("layout", type);
        this.homeSearchEl.setAttribute("data-layout", type);
      }
    });
  },
}

export default homeSearch;
