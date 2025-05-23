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
    this.searchFiltersFormEl = document.querySelector(".js-search-filter-list");
    if (!this.searchFiltersFormEl) return;

    const submitBtnEl = document.querySelector(".js-search-filter-modal-show-result-btn");
    const clearFilterBtnEl = document.querySelector(".js-search-filter-modal-clear-btn");
    this.totalFilters = 0;

    searchFilterAutocomplete.init();
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

    if (type == "all" || !type) {
      Object.keys(searchFiltersList).forEach(key => {
        searchFiltersList[key].forEach(item => {
          item.fieldNameKeys.forEach(key => this.SEARCH_FILTER_KEYS.push(key));
        });
      });
    } else if (type != "maps"){
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
    const searchParams = new URLSearchParams(window.location.search);

    // Populate our plain-object
    for (const [key, value] of searchParams.entries()) {
      paramsFromUrl[key] = value;    // value is "" if param was present without “=…”
    }

    // Now safely .split() every value
    Object.keys(paramsFromUrl).forEach(key => {
      const values = paramsFromUrl[key].split(",");  // never undefined
      values.forEach(value => {
        const input = document.getElementById(`${key}[${value}]`);
        if (input) {
          input.checked = true;
         
          // If selected filter is inside of dropdown, 
          // then open the dropdown
          if (input.getAttribute("data-section-key") == "full") {
            let fieldName = input.getAttribute("data-field-name");
            let showAllInputEl = document.getElementById(`${fieldName}-accordion`);
            showAllInputEl.checked = true;
          }

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

    // // Get query parameters if exists
    // if (window.location.search) {
    //   window.location.search
    //     .split("?")[1]
    //     .split("&")
    //     .map(p => p.split("="))
    //     .forEach(param => (paramsFromUrl[param[0]] = param[1]));
    // }

    // Object.keys(paramsFromUrl).forEach(key => {
    //   const values = paramsFromUrl[key].split(",");
    //   values.forEach(value => {
    //     const input = document.getElementById(`${key}[${value}]`);
    //     if (input) {
    //       input.checked = true;
         
    //       // If selected filter is inside of dropdown, 
    //       // then open the dropdown
    //       if (input.getAttribute("data-section-key") == "full") {
    //         let fieldName = input.getAttribute("data-field-name");
    //         let showAllInputEl = document.getElementById(`${fieldName}-accordion`);
    //         showAllInputEl.checked = true;
    //       }

    //       this.totalFilters++;
    //     }

    //     // Manually count country
    //     if (key == "country") {
    //       searchFilterAutocomplete.addSelectedItem("country", {label: decodeURI(value), value: decodeURI(value)});
    //       this.totalFilters++;
    //     }
    //   });
    // });

    // this.updateBadge();
  },

  updateBadge() {
    const badgeEls = document.querySelectorAll(".js-total-filter-badge");
    const badgeParentEls = Array.prototype.slice.call(
      document.querySelectorAll(".js-tab-buttons-button-filter")
    );
    
    for (let i = 0; i < badgeParentEls.length; i++) {
      let badgeEl = badgeEls[i];
      let badgeParentEl = badgeParentEls[i];

      if (this.totalFilters) {
        badgeEl.textContent = this.totalFilters;
        badgeEl.style["display"] = "block";
      } else {
        badgeParentEl.style["justify-content"] = "center";
      }
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
    location.href = this.getSearchUrl();
  },

  getSearchUrl() {
    const filters = this.SEARCH_FILTER_KEYS.concat('openFilters')
    // remove old filters
    removeUrlParams(filters);
    const selectedFilters = this.getState();
    // add new filters as params
    Object.keys(selectedFilters).forEach(key => {
      updateUrlParams(key, selectedFilters[key]);
    });

    return location.href;
  }
};

export default searchFilterList;