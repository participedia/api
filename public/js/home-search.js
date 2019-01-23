const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    this.toggleLayoutBtnsEl = this.homeSearchEl.querySelector(".js-card-layout-btns");

    this.initCardLayout();

    // todo add event listeners sort by functionality

  },

  initCardLayout() {
    // set layout view from local storage var
    const savedType = window.localStorage.getItem("participedia:cardLayout");
    if (savedType) {
      this.toggleLayout(savedType);
    }

    // event listeners for grid/list toggle buttons
    this.toggleLayoutBtnsEl.addEventListener("click", event => {
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
    const cardContainerEls = Array.prototype.slice.call(
      this.homeSearchEl.querySelectorAll(".js-cards-container")
    );
    const buttonEls = Array.prototype.slice.call(
      this.toggleLayoutBtnsEl.querySelectorAll("button")
    );

    //toggle data-layout attribute on all card containers/tabs
    cardContainerEls.forEach(el => el.setAttribute("data-layout", type));

    // toggle button active class
    buttonEls.forEach(el => {
      if (el.getAttribute("data-type") === type) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }
}

export default homeSearch;
