import {
  getValueForParam,
  updateUrlParams,
  removeUrlParams,
} from "./utils/utils.js";
import modal from "./modal.js";
import tracking from "./utils/tracking.js";
import csvGenerator from "./csv-generator.js";

const tabsWithCards = {
  init() {
    this.tabInputEls = Array.prototype.slice.call(
      document.querySelectorAll(".js-tab-container input[name='tabs']")
    );
    this.localTabInputEls = Array.prototype.slice.call(
      document.querySelectorAll(".js-tab-container input[name='tabs'][data-local='local']")
    );
    this.viewEl = document.querySelector("[data-card-layout]");
    this.localForms = document.querySelectorAll("form[data-local=local]");

    if (this.tabInputEls.length === 0 && this.localTabInputEls.length === 0) return;

    // Initiate CSV generator
    this.initiateCsvGenerator();

    // tabs ui
    if(this.localTabInputEls.length > 0) {
      this.initLocalDesktopTabNav();
      this.initLocalMobileTabNav();
    } else {
      this.initDesktopTabNav();
      this.initMobileTabNav();
    }
    

    if (!this.viewEl) return;
    // cards ui
    this.initCardLayout();
    this.initPagination();

    // More Filters Button
    const moreFilterBtnEls = document.querySelectorAll(".js-tab-buttons-button-filter");

    moreFilterBtnEls.forEach(moreFilterBtnEl => {
      if (moreFilterBtnEl) {
        moreFilterBtnEl.addEventListener("click", event => {

          const category = getValueForParam("selectedCategory");
          if (["case", "organizations", "method"].indexOf(category) >= 0) {
            this.openSearchFilterModal();
          } else {
            updateUrlParams("selectedCategory", "case");
            updateUrlParams("openFilters", "1");
            window.location.href = window.location.href;
          }

          tracking.send("search", "filter_button_click");
        });
      }
    });

    const downloadCsvBtnEl = document.querySelector(".js-download-csv-btn");
    if (downloadCsvBtnEl) {
      downloadCsvBtnEl.addEventListener("click", e => {
        // Custom logic for CSV download button if category is all.
        if (!this.isCsvGenerator()) {
          // Update selectedCategory to case and reload the page.
          updateUrlParams("selectedCategory", "case");
          window.location.href = window.location.href;

          // Download CSV cases
          let url = `${window.location.href}&returns=csv`;
      	  window.open(url, '_blank');
        }
        tracking.send("search", "results_csv_button_click");
      });
    }

    const downloadCsvBtnElMobiles = document.querySelectorAll(".js-download-csv-btn-mobile");

    downloadCsvBtnElMobiles.forEach(downloadCsvBtnElMobile => {
      if (downloadCsvBtnElMobile) {
        downloadCsvBtnElMobile.addEventListener("click", event => {
        // Custom logic for CSV download button if category is all.
        if (this.isCsvGenerator()) {
          // Update selectedCategory to case and reload the page.
          updateUrlParams("selectedCategory", "case");
          let currentUrl= window.location.href;
          // Download CSV cases
          let url = `${currentUrl}&returns=csv`;
      	  window.open(url, '_blank'); 
        }
        tracking.send("search", "results_csv_button_click");
        });
      }
    });

    const openFilter = getValueForParam("openFilters");
    if (openFilter == "1") {
      this.openSearchFilterModal();
    }
  },

  initiateCsvGenerator() {
    if (this.isCsvGenerator()) {
      csvGenerator.init();
    }
  },

  isCsvGenerator() {
    const category = getValueForParam("selectedCategory");
    return ["case", "organizations", "method"].indexOf(category) >= 0;
  },

  openSearchFilterModal() {
    modal.openModal("search-filter-modal", {showCloseBtn: true});
  },

  navigateToTab(category) {
    const query = getValueForParam("query");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const view = urlParams.get('view');
    
    let url = `${window.location.origin +
      window.location.pathname}?selectedCategory=${category}`;

    if (query) {
      url = `${url}&query=${query}`;
    }

    if (view === 'maps'){
      url = url + '&view=maps';
    }

    window.location.href = url;
  },

  navigateToLocalTab(tabName) {
    // reference to all forms
    // $(localForms).hide();
    this.localForms.forEach(el => el.classList.add('hide'));
    document.querySelector(`form[data-lang='${tabName}']`).classList.remove('hide');

  },

  initLocalDesktopTabNav() {
    // update url param to indicate current tab
    this.localTabInputEls.forEach(el => {
      el.addEventListener("click", event => {
        this.navigateToLocalTab(event.target.id);
      });
    });
    this.localForms.forEach(el => el.classList.add('hide'));
    this.localTabInputEls[0].click();
  },

  initLocalMobileTabNav() {
    // TODO: Implement local mobile navigation
    const selectEl = document.querySelector(".js-tab-select-container select");

    if (!selectEl) return;

    // select current tab
    const optionEls = Array.prototype.slice.call(
      selectEl.querySelectorAll("option")
    );
    const currentTab = this.tabInputEls.find(el => el.checked);
    optionEls.forEach(el => (el.selected = el.value === currentTab.id));

    // event listener for select change
    selectEl.addEventListener("change", event => {
      // change tab to selected type
      const newTabId = event.target.value;
      // toggle checked attr on inputs
      this.tabInputEls.forEach(el => (el.checked = el.id === newTabId));
      // go to new tab
      this.navigateToTab(newTabId);
    });
  },

  initDesktopTabNav() {
    // update url param to indicate current tab
    this.tabInputEls.forEach(el => {
      el.addEventListener("click", event => {
        this.navigateToTab(event.target.id);
      });
    });
  },

  initMobileTabNav() {
    const selectEl = document.querySelector(".js-tab-select-container select");

    if (!selectEl) return;

    // select current tab
    const optionEls = Array.prototype.slice.call(
      selectEl.querySelectorAll("option")
    );

    const currentTab = this.tabInputEls.find(el => el.checked);
    if(currentTab){
      optionEls.forEach(el => (el.selected = el.value === currentTab.id));

      // event listener for select change
      selectEl.addEventListener("change", event => {
        // change tab to selected type
        const newTabId = event.target.value;
        // toggle checked attr on inputs
        this.tabInputEls.forEach(el => (el.checked = el.id === newTabId));
        // go to new tab
        this.navigateToTab(newTabId);
      });
    }
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
    const toggleLayoutBtnsEls = this.viewEl.querySelectorAll(
      ".js-card-layout-btn"
    );

    for (let index = 0; index < toggleLayoutBtnsEls.length; index++) {
      const btnEl = toggleLayoutBtnsEls[index];
      // event listeners for grid/list toggle buttons
      btnEl.addEventListener("click", event => {
        const type = btnEl.getAttribute("data-type");
        if (!type) return;
        updateUrlParams("layout", type);
        this.viewEl.setAttribute("data-card-layout", type);
      });
    }
  }
};

export default tabsWithCards;
