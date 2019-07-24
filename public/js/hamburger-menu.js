const hamburgerMenu = {
  init() {
    this.bindCloseAnywhere();
    this.bindMenuClicks();

    // if the menu is already open on load, toggle body class
    if (location.hash === "#sidebar-menu") {
      document.querySelector("body").classList.add("sidebar-menu-is-open");
    } else {
      document.querySelector("body").classList.add("sidebar-menu-is-closed");
    }
  },

  bindMenuClicks() {
    document
      .querySelector(".js-menu-icon-container")
      .addEventListener("click", e => {
        const menuTriggerEl = e.target.closest("a");
        if (menuTriggerEl) {
          this.handleMenuClick(e);
        }
      });
  },

  bindCloseAnywhere() {
    const bgClickElement = document.querySelector(".js-sidebar-menu");
    bgClickElement.addEventListener("click", () => {
      location.href = "#";
    });
  },

  handleMenuClick(e) {
    const menuTriggerEl = e.target.closest("a");

    // when menu is open, disable scrolling on body via a class
    const bodyEl = document.querySelector("body");
    if (menuTriggerEl.hasAttribute("data-menu-is-open")) {
      bodyEl.classList.add("sidebar-menu-is-open");
      bodyEl.classList.remove("sidebar-menu-is-closed");
    } else {
      bodyEl.classList.remove("sidebar-menu-is-open");
      bodyEl.classList.add("sidebar-menu-is-closed");
    }
  }
};

export default hamburgerMenu;
