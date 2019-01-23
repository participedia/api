const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    this.initCardLayout();

    this.initPagination();

    // todo add event listeners sort by functionality

  },

  updateUrlParams(type) {
    const params = window.location.search;

    if (!params) return;

    const paramsArr = params.split("?")[1].split("&").map(p => p.split("="));
    const paramsObj = {};
    paramsArr.forEach(param => paramsObj[param[0]] = param[1]);

    if (paramsObj.page) {
      // update url without reloading page
      history.pushState({}, "", `/?page=${paramsObj.page}&layout=${type}`);
    }
  },

  initPagination() {
    const paginationNavEl = this.homeSearchEl.querySelector(".js-pagination-nav");
    paginationNavEl.addEventListener("click", event => {
      event.preventDefault();
      const link = event.target.closest("a");
      if (link) {
        const pageNum = link.getAttribute("data-page-num");
        const layoutType = this.homeSearchEl.getAttribute("data-layout");
        window.location = `/?page=${pageNum}&layout=${layoutType}`;
      }
    });
  },

  initCardLayout() {
    const toggleLayoutBtnsEl = this.homeSearchEl.querySelector(".js-card-layout-btns");

    // event listeners for grid/list toggle buttons
    toggleLayoutBtnsEl.addEventListener("click", event => {
      const btnEl = event.target.closest("button");

      if (btnEl) {
        const type = btnEl.getAttribute("data-type");

        this.updateUrlParams(type);
        this.homeSearchEl.setAttribute("data-layout", type);
      }
    });
  },
}

export default homeSearch;
