const homeSearch = {
  init() {
    this.homeSearchEl = document.querySelector(".js-home-search");

    if (!this.homeSearchEl) return;

    this.initToggleLayoutBtns();

    // todo add event listeners sort by functionality

  },

  initToggleLayoutBtns() {
    // event listeners for grid/list toggle buttons
    const toggleLayoutBtnsEl = this.homeSearchEl.querySelector(".js-card-layout-btns");
    toggleLayoutBtnsEl.addEventListener("click", event => {
      const btnEl = event.target.closest("button");

      if (btnEl) {
        const type = btnEl.getAttribute("data-type");
        const cardContainerEls = Array.prototype.slice.call(
          this.homeSearchEl.querySelectorAll(".js-cards-container")
        );
        const buttonEls = Array.prototype.slice.call(
          toggleLayoutBtnsEl.querySelectorAll("button")
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
    });
  }
}

export default homeSearch;
