import { updateUrlParams, removeUrlParams } from "./utils/utils.js";
import searchFiltersList from "../../api/helpers/search-filters-list.js";

const CASE_SEARCH_FILTER_KEYS = [];
searchFiltersList.case.forEach(item => {
  item.fieldNameKeys.forEach(key => CASE_SEARCH_FILTER_KEYS.push(key));
});

const toArray = (nodeList) => Array.prototype.slice.call(nodeList);

const searchFilters = {
  init() {
    this.searchFiltersFormEl = document.querySelector(".js-search-filters");

    if (!this.searchFiltersFormEl) return;

    this.searchFiltersListEl = document.querySelector(".js-search-filters-chip-list");
    this.checkboxEls = toArray(this.searchFiltersFormEl.querySelectorAll("input[type=checkbox]"));

    this.chipButtonEls = toArray(
      this.searchFiltersListEl.querySelectorAll(".js-search-filters-chip")
    );

    this.chipButtonEls.forEach(el => {
      el.addEventListener("click", e => this.handleChipButtonClick(e));
    });

    this.searchFiltersFormEl.addEventListener("submit", e => {
      this.handleFormSubmit(e);
    });

    const clearAllLink = this.searchFiltersFormEl.querySelector(".js-clear-all-link");
    clearAllLink.addEventListener("click", e => this.handleClearAllClick(e));

    const clearSectionLinks = toArray(
      this.searchFiltersFormEl.querySelectorAll(".js-clear-section-link")
    );
    clearSectionLinks.forEach(el => {
      el.addEventListener("click", e => this.handleClearAllForSection(e));
    });

    this.updateUIFromUrlParams();
  },

  getState() {
    const selectedFilters = {};
    this.checkboxEls.forEach(el => {
      if (el.checked) {
        const fieldName = el.getAttribute("data-field-name");
        const filterName = el.getAttribute("name");
        if (Array.isArray(selectedFilters[fieldName])) {
          selectedFilters[fieldName].push(filterName);
        } else {
          selectedFilters[fieldName] = [filterName];
        }
      }
    });
    return selectedFilters;
  },

  updateUIFromUrlParams() {
    const paramsFromUrl = {};
    window.location.search
      .split("?")[1].split("&").map(p => p.split("="))
      .forEach(param => paramsFromUrl[param[0]] = param[1]);

    Object.keys(paramsFromUrl).forEach(key => {
      const values = paramsFromUrl[key].split(",");
      values.forEach(value => {
        const input = document.getElementById(`${key}[${value}]`);
        if (input) input.checked = true;
      });
    });
    this.updateChipButtonsState();
  },

  updateChipButtonsState() {
    this.chipButtonEls.forEach(el => {
      const hasCheckedItems = el.closest(".js-search-filters-chip-list-item")
        .querySelectorAll("input:checked").length > 0;
      if (hasCheckedItems) {
        el.classList.add("search-filters-chip-selected");
      } else {
        el.classList.remove("search-filters-chip-selected");
      }
    });
  },

  handleClearAllClick(e) {
    e.preventDefault();
    const allCheckboxes = toArray(
      this.searchFiltersFormEl.querySelectorAll("input:checked")
    );
    allCheckboxes.forEach(el => el.checked = false);
    this.updateChipButtonsState();
    removeUrlParams(CASE_SEARCH_FILTER_KEYS);
    location.href = location.href;
  },

  handleClearAllForSection(e) {
    e.preventDefault();
    const category = e.target.getAttribute("data-field-name");
    const allCheckboxesForSection = toArray(
      this.searchFiltersFormEl.querySelector(`.js-keys-list[data-field-name=${category}`).querySelectorAll("input")
    );
    allCheckboxesForSection.forEach(el => el.checked = false);
    removeUrlParams(CASE_SEARCH_FILTER_KEYS);
  },

  handleFormSubmit(e) {
    e.preventDefault();
    // remove old filters
    removeUrlParams(CASE_SEARCH_FILTER_KEYS);
    const selectedFilters = this.getState();
    // add new filters as params
    Object.keys(selectedFilters).forEach(key => {
      updateUrlParams(key, selectedFilters[key]);
    });
    // load new url
    location.href = location.href;
  },

  handleChipButtonClick(e) {
    e.preventDefault();

    const allPopOvers = toArray(document.querySelectorAll(".js-filter-list-pop-over"));
    const currentPopOverEl = e.target.closest("li").querySelector(".js-filter-list-pop-over");
    const currentButton = e.target;

    // close all other open pop overs before opening the current clicked one
    allPopOvers.forEach(el => {
      if (el !== currentPopOverEl) {
        el.classList.remove("show-filter-list-popover");
      }
    });

    // remove open class from chip button before opening a new one
    this.chipButtonEls.forEach(el => el.classList.remove("search-filters-chip-open"));

    this.updateChipButtonsState();

    const xPosOfCurrentButton =
      currentButton.getBoundingClientRect().x + currentButton.getBoundingClientRect().width;
    const shouldRenderOnRight = window.innerWidth - xPosOfCurrentButton < 300;

    // toggle current popover if you click the same chip button again
    if (currentPopOverEl.classList.contains("show-filter-list-popover")) {
      // hide popover
      currentButton.classList.remove("search-filters-chip-open")
      currentPopOverEl.classList.remove("show-filter-list-popover");
      currentPopOverEl.style.marginLeft = 0;
      this.updateChipButtonsState();
      document.activeElement.blur();
    } else {
      // show popover
      currentButton.classList.add("search-filters-chip-open")
      currentPopOverEl.classList.add("show-filter-list-popover");
      if (shouldRenderOnRight) {
        const popOverOffset = currentPopOverEl.clientWidth - currentButton.clientWidth;
        currentPopOverEl.style.marginLeft = `-${popOverOffset}px`;
      }
    }
  }
};

export default searchFilters;
