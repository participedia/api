import {
  updateUrlParams,
  removeUrlParams,
  getValueForParam,
} from "./utils/utils.js";
import searchFilterAutocomplete from "./search-filter-autocomplete.js";
import searchFiltersList from "../../api/helpers/search-filters-list.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

const searchFilterList = {
	init() {
    const submitBtnEl = document.querySelector(".js-search-filter-modal-show-result-btn");
    const clearFilterBtnEl = document.querySelector(".js-search-filter-modal-clear-btn");

    searchFilterAutocomplete.init();
		this.searchFiltersFormEl = document.querySelector(".js-search-filter-list");
    this.totalFilters = 0;

		if (!this.searchFiltersFormEl) return;

    this.getFiltersList();

		this.checkboxEls = toArray(
      this.searchFiltersFormEl.querySelectorAll(".js-keys-list-item input[type=checkbox]")
    );

    submitBtnEl.addEventListener("click", e => this.handleFormSubmit(e));
    clearFilterBtnEl.addEventListener("click", e => this.handleClearAllFilter(e));

    this.updateUIFromUrlParams();
	},

  getFiltersList() {
    const type = getValueForParam("selectedCategory");
    this.SEARCH_FILTER_KEYS = [];

    if (type == "all") {
      Object.keys(searchFiltersList).forEach(key => {
        searchFiltersList[key].forEach(item => {
          item.fieldNameKeys.forEach(key => this.SEARCH_FILTER_KEYS.push(key));
        });
      });
    } else {
      searchFiltersList[type].forEach(item => {
        item.fieldNameKeys.forEach(key => this.SEARCH_FILTER_KEYS.push(key));
      });
    }
  },

  getState() {
    let selectedFilters = {};
    this.checkboxEls.forEach(el => {
      if (el.checked) {
        let fieldName = el.getAttribute("data-field-name");
        let filterName = el.getAttribute("name");
        selectedFilters = this.collectSelectedFilter(selectedFilters, fieldName, filterName);
      }
    });

    const selectedCountry = searchFilterAutocomplete.getSelectedItems("country");
    selectedCountry.forEach(data => {
      selectedFilters = this.collectSelectedFilter(selectedFilters, "country", data.value);
    });

    return selectedFilters;
  },

  collectSelectedFilter(selectedFilters, fieldName, filterName) {
    if (Array.isArray(selectedFilters[fieldName])) {
      selectedFilters[fieldName].push(filterName);
    } else {
      selectedFilters[fieldName] = [filterName];
    }

    return selectedFilters;
  },

  updateUIFromUrlParams() {
    const paramsFromUrl = {};
    window.location.search
      .split("?")[1]
      .split("&")
      .map(p => p.split("="))
      .forEach(param => (paramsFromUrl[param[0]] = param[1]));

    Object.keys(paramsFromUrl).forEach(key => {
      const values = paramsFromUrl[key].split(",");
      values.forEach(value => {
        const input = document.getElementById(`${key}[${value}]`);
        if (input) {
          input.checked = true;
          this.totalFilters++;
        }

        // Manually count country
        if (key == "country") {
          searchFilterAutocomplete.addSelectedItem("country", {label: decodeURI(value), value: decodeURI(value)});
          this.totalFilters++;
        }
      });
    });

    this.updateBadge();
  },

  updateBadge() {
    const badgeParentEl = document.querySelector(".js-tab-buttons-button-filter");
    const badgeEl = document.querySelector(".js-total-filter-badge");

    if (this.totalFilters) {
      badgeEl.textContent = this.totalFilters;
      badgeEl.style["display"] = "block";
    } else {
      badgeParentEl.style["justify-content"] = "center";
    }
  },

  handleClearAllFilter(e) {
    e.preventDefault();
    const allCheckboxes = toArray(
      this.searchFiltersFormEl.querySelectorAll("input:checked")
    );

    allCheckboxes.forEach(el => (el.checked = false));
    removeUrlParams(this.SEARCH_FILTER_KEYS);
    // load new url without filter
    location.href = location.href;
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const openFilter = getValueForParam("openFilters");
    const filters = openFilter == "1"
      ? this.SEARCH_FILTER_KEYS.concat("openFilters")
      : this.SEARCH_FILTER_KEYS;

    // remove old filters
    removeUrlParams(filters);
    const selectedFilters = this.getState();
    // add new filters as params
    Object.keys(selectedFilters).forEach(key => {
      updateUrlParams(key, selectedFilters[key]);
    });
    // load new url
    location.href = location.href;
  }
};

export default searchFilterList;