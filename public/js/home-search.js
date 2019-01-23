const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    this.initCardLayout();

    this.initPagination();

    // todo add event listeners sort by functionality

  },

  initPagination() {
    const paginationNavEl = this.homeSearchEl.querySelector(".js-pagination-nav");
    paginationNavEl.addEventListener("click", event => {
      event.preventDefault();
      const link = event.target.closest("a");
      if (link) {
        const pageNum = link.getAttribute("data-page-num");
        const layoutType = window.localStorage.getItem("participedia:cardLayout");
        window.location = `/?page=${pageNum}&layout=${layoutType}`;
      }
    });
  },

  initCardLayout() {
    const toggleLayoutBtnsEl = this.homeSearchEl.querySelector(".js-card-layout-btns");

    // set layout view from local storage var
    const savedType = window.localStorage.getItem("participedia:cardLayout");
    if (savedType) {
      this.toggleLayout(savedType);
    }

    // event listeners for grid/list toggle buttons
    toggleLayoutBtnsEl.addEventListener("click", event => {
      const btnEl = event.target.closest("button");

      if (btnEl) {
        const type = btnEl.getAttribute("data-type");

        // save type to local storage so we can present as default view
        window.localStorage.setItem("participedia:cardLayout", type)

        this.toggleLayout(type);
      }
    });
  },

  toggleLayout(type) {
    this.homeSearchEl.setAttribute("data-layout", type);
  }
}

export default homeSearch;
