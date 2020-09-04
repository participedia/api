import {
  updateUrlParams,
  removeUrlParams,
  getValueForParam,
} from "./utils/utils.js";
import searchFiltersList from "../../api/helpers/search-filters-list.js";

const searchFilterList = {
	init() {
		this.searchFiltersFormEl = document.querySelector(".js-search-filter-list");

		if (!this.searchFiltersFormEl) return;

		const type = getValueForParam("selectedCategory");
    this.SEARCH_FILTER_KEYS = [];
    searchFiltersList[type].forEach(item => {
      item.fieldNameKeys.forEach(key => this.SEARCH_FILTER_KEYS.push(key));
    });

		this.checkboxEls = toArray(
      this.searchFiltersFormEl.querySelectorAll("input[type=checkbox]")
    );

    this.searchFiltersFormEl.addEventListener("submit", e => {
      this.handleFormSubmit(e);
    });

		const showAllBtn = Array.prototype.slice.call(
	    document.querySelectorAll(".js-filter-list-item-show-all-btn")
	  );

		showAllBtn.forEach(el => {
      el.addEventListener("click", e => this.handleShowAllButtonClick(e));
    });
	},

	handleShowAllButtonClick(e) {
    e.preventDefault();
    const listKey = e.target.getAttribute("data-list-key");
    const listItem = Array.prototype.slice.call(
    	document.querySelector(`.js-keys-list[data-field-name=${listKey}`).children
    );

    listItem.forEach(el => {
    	let item = el.classList.contains("hidden");
    	if (item) {
    		el.className = "show";
    	}
    });
  },

  handleFormSubmit(e) {
    e.preventDefault();
    // remove old filters
    removeUrlParams(this.SEARCH_FILTER_KEYS);
    const selectedFilters = this.getState();
    // add new filters as params
    Object.keys(selectedFilters).forEach(key => {
      updateUrlParams(key, selectedFilters[key]);
    });
    // load new url
    location.href = location.href;
  },
};

export default searchFilterList;