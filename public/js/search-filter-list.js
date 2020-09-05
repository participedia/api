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
    searchFilterAutocomplete.init();
		this.searchFiltersFormEl = document.querySelector(".js-search-filter-list");
    this.selectedCountryListEl = document.querySelector(".js-search-filter-autocomplete-list[data-name=country]");
    this.totalFilters = 0;
    const submitBtnEl = document.querySelector(".js-search-filter-modal-show-result-btn");
    const clearFilterBtnEl = document.querySelector(".js-search-filter-modal-clear-btn");

		if (!this.searchFiltersFormEl) return;

		const type = getValueForParam("selectedCategory");
    this.SEARCH_FILTER_KEYS = [];
    searchFiltersList[type].forEach(item => {
      item.fieldNameKeys.forEach(key => this.SEARCH_FILTER_KEYS.push(key));
    });

		this.checkboxEls = toArray(
      this.searchFiltersFormEl.querySelectorAll(".js-keys-list-item input[type=checkbox]")
    );

    submitBtnEl.addEventListener("click", e => this.handleFormSubmit(e));
    clearFilterBtnEl.addEventListener("click", e => this.handleClearAllFilter(e));

    this.updateUIFromUrlParams();
	},

  // handleRemoveSelectedFilter(e) {
  //   e.preventDefault();
  //   // Get DOM of clicked item
  //   const filterEl = document.querySelector(
  //     `.item-${e.target.dataset.sectionKey}`
  //   );

  //   // Remove DOM
  //   filterEl.remove();

  //   // Get the remaining selected filters
  //   removeUrlParams(this.SEARCH_FILTER_KEYS);
  //   const selectedFilters = this.getSelectedFilterState();

  //   // add new filters as params
  //   Object.keys(selectedFilters).forEach(key => {
  //     updateUrlParams(key, selectedFilters[key]);
  //   });

  //   // load new url
  //   location.href = location.href;
  // },

  getState() {
    let selectedFilters = {};
    this.checkboxEls.forEach(el => {
      if (el.checked) {
        let fieldName = el.getAttribute("data-field-name");
        let filterName = el.getAttribute("name");
        selectedFilters = this.collectSelectedFilter(selectedFilters, fieldName, filterName);
      }
    });

    // Manually collect all country fields from autocomplete
    const countryInputEls = toArray(this.selectedCountryListEl.querySelectorAll("input"));
    countryInputEls.forEach(el => {
      let fieldName = "country";
      let filterName = el.getAttribute("value");
      selectedFilters = this.collectSelectedFilter(selectedFilters, fieldName, filterName);
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

  // getSelectedFilterState() {
  //   this.selectedFilterBtnEl = toArray(
  //     this.selectedFilterEl.querySelectorAll(".js-remove-selected-filter-btn")
  //   );

  //   const selectedFilters = {};
  //   this.selectedFilterBtnEl.forEach(el => {
  //     const fieldName = el.getAttribute("data-field-name");
  //     const filterName = el.getAttribute("data-section-key");
  //     if (Array.isArray(selectedFilters[fieldName])) {
  //       selectedFilters[fieldName].push(filterName);
  //     } else {
  //       selectedFilters[fieldName] = [filterName];
  //     }
  //   });
  //   return selectedFilters;
  // },

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
    // this.updateChipButtonsState();
  },

  updateBadge() {
    const badgeParentEl = document.querySelector(".js-tab-buttons-button-filter");
    const badgeEl = document.querySelector(".js-total-filter-badge");

    if (this.totalFilters < 1) {
      badgeParentEl.style["justify-content"] = "center";
    } else {
      badgeEl.textContent = this.totalFilters;
      badgeEl.style["display"] = "block";
    }
  },

  // updateChipButtonsState() {
  //   this.chipButtonEls.forEach(el => {
  //     const hasCheckedItems =
  //       el
  //         .closest(".js-search-filters-chip-list-item")
  //         .querySelectorAll("input:checked").length > 0;
  //     if (hasCheckedItems) {
  //       el.classList.add("search-filters-chip-selected");
  //     } else {
  //       el.classList.remove("search-filters-chip-selected");
  //     }
  //   });
  // },

  handleClearAllFilter(e) {
    e.preventDefault();
    const allCheckboxes = toArray(
      this.searchFiltersFormEl.querySelectorAll("input:checked")
    );

    allCheckboxes.forEach(el => (el.checked = false));
    // this.updateChipButtonsState();
    removeUrlParams(this.SEARCH_FILTER_KEYS);
    // load new url without filter
    location.href = location.href;
  },

  // handleClearAllForSection(e) {
  //   e.preventDefault();
  //   const category = e.target.getAttribute("data-field-name");
  //   const allCheckboxesForSection = toArray(
  //     this.searchFiltersFormEl
  //       .querySelector(`.js-keys-list[data-field-name=${category}`)
  //       .querySelectorAll("input")
  //   );
  //   allCheckboxesForSection.forEach(el => (el.checked = false));
  //   removeUrlParams(this.SEARCH_FILTER_KEYS);
  // },

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

  // handleChipButtonClick(e) {
  //   e.preventDefault();

  //   const allPopOvers = toArray(
  //     document.querySelectorAll(".js-filter-list-pop-over")
  //   );
  //   const currentPopOverEl = e.target
  //     .closest("li")
  //     .querySelector(".js-filter-list-pop-over");
  //   const currentButton = e.target;

  //   // close all other open pop overs before opening the current clicked one
  //   allPopOvers.forEach(el => {
  //     if (el !== currentPopOverEl) {
  //       el.classList.remove("show-filter-list-popover");
  //     }
  //   });

  //   // remove open class from chip button before opening a new one
  //   this.chipButtonEls.forEach(el =>
  //     el.classList.remove("search-filters-chip-open")
  //   );

  //   this.updateChipButtonsState();

  //   const xPosOfCurrentButton =
  //     currentButton.getBoundingClientRect().x +
  //     currentButton.getBoundingClientRect().width;
  //   const shouldRenderOnRight = window.innerWidth - xPosOfCurrentButton < 300;
  //   const isMobile = window.innerWidth < 801;

  //   // toggle current popover if you click the same chip button again
  //   if (currentPopOverEl.classList.contains("show-filter-list-popover")) {
  //     // hide popover
  //     currentButton.classList.remove("search-filters-chip-open");
  //     currentPopOverEl.classList.remove("show-filter-list-popover");
  //     currentPopOverEl.style.marginLeft = 0;
  //     this.updateChipButtonsState();
  //     document.activeElement.blur();
  //   } else {
  //     // show popover
  //     currentButton.classList.add("search-filters-chip-open");
  //     currentPopOverEl.classList.add("show-filter-list-popover");
  //     if (shouldRenderOnRight && !isMobile) {
  //       const popOverOffset =
  //         currentPopOverEl.clientWidth - currentButton.clientWidth;
  //       currentPopOverEl.style.marginLeft = `-${popOverOffset}px`;
  //     }
  //   }
  // }
};

export default searchFilterList;