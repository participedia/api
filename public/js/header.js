import tracking from "./utils/tracking.js";

const header = {
  init() {
    this.trackLoginButtonClick();
    this.initProfileDropdownMenu();
    this.trackQuerySearchInput();
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

  trackQuerySearchInput() {
    const searchInputEl = document.querySelector(".js-query-search-input");
    const closeButtonEl = document.querySelector(".js-query-search-close-button");
    const searchFormEl = document.querySelector(".js-query-search-form");
    this.hideOrShowSearchCloseButton(searchInputEl.value, closeButtonEl);

    searchInputEl.addEventListener("input", e => {
      this.hideOrShowSearchCloseButton(e.target.value, closeButtonEl);
    });

    closeButtonEl.addEventListener("click", e => {
      searchInputEl.value = "";
      this.hideOrShowSearchCloseButton(searchInputEl.value, closeButtonEl);
      history.pushState({}, "", '/');
      location.href = '/';
    });
  },

  hideOrShowSearchCloseButton(query, closeButtonEl) {
    if (query.length > 0) {
      closeButtonEl.classList.remove("hidden");
    } else {
      closeButtonEl.classList.add("hidden");
    }
  }
};

export default header;
