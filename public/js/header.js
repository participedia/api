import tracking from "./utils/tracking.js";
import {
  getValueForParam,
} from "./utils/utils.js";

const header = {
  init() {
    this.trackLoginButtonClick();
    this.initProfileDropdownMenu();
    this.initClearSearchInput();
  },

  trackLoginButtonClick() {
    const loginButtonEl = document.querySelector(".js-header-login-button");

    if (!loginButtonEl) return;

    loginButtonEl.addEventListener("click", event => {
      event.preventDefault();
      tracking.sendWithCallback("header", "login_button_click", "", () => {
        location.href = event.target.href;
      });
    });
  },

  initProfileDropdownMenu() {
    const containerEl = document.querySelector(
      ".js-profile-dropdown-button-container"
    );

    if (!containerEl) return;

    containerEl.addEventListener("click", e => {
      const button = e.target.closest(".js-profile-dropdown-button-trigger");
      if (button) {
        const isOpen = containerEl.getAttribute("state") === "open";
        const itemsContainerEl = containerEl.querySelector(
          ".js-profile-dropdown-button-items"
        );
        if (isOpen) {
          // close items
          itemsContainerEl.style.display = "none";
          containerEl.setAttribute("state", "closed");
        } else {
          // open items
          itemsContainerEl.style.display = "flex";
          containerEl.setAttribute("state", "open");
        }
      }
    });
  },

  initClearSearchInput() {
    const searchInputEl = document.querySelector(".js-query-search-input");
    const clearSearchButtonEl = document.querySelector(".js-search-query-clear-button");
    const searchFormEl = document.querySelector(".js-query-search-form"); 
    this.hideOrShowSearchCloseButton(searchInputEl.value, clearSearchButtonEl);
    this.viewEl = document.querySelector("[data-card-layout]");
    let layout = this.viewEl.getAttribute("data-card-layout");

    searchFormEl.addEventListener("submit", e => {
      tracking.sendWithCallback("header", "search_submit", searchInputEl.value, () => {
        layout = this.viewEl.getAttribute("data-card-layout");
        location.href = `/search?query=${searchInputEl.value}&layout=${layout}`;
      });
      e.preventDefault();
    });

    searchInputEl.addEventListener("input", e => {
      this.hideOrShowSearchCloseButton(e.target.value, clearSearchButtonEl);
    });

    clearSearchButtonEl.addEventListener("click", e => {
      searchInputEl.value = "";
      this.hideOrShowSearchCloseButton(searchInputEl.value, clearSearchButtonEl);
      history.pushState({}, "", '/search');
      location.href = '/search';
    });
  },

  hideOrShowSearchCloseButton(query, clearSearchButtonEl) {
    if (query.length > 0) {
      clearSearchButtonEl.classList.remove("hidden");
    } else {
      clearSearchButtonEl.classList.add("hidden");
    }
  }
};

export default header;
