import { updateUrlParams } from "./utils/utils.js";

const tabs = {
  init() {
    this.tabInputEls = Array.prototype.slice.call(
      document.querySelectorAll(".js-tab-container input[name='tabs']")
    );

    if (this.tabInputEls.length === 0) return;

    // update url param to indicate current tab
    this.tabInputEls.forEach(el => {
      el.addEventListener("click", event => {
        updateUrlParams("tab", event.target.id);
      });
    });

    this.initMobileTabNav();
  },

  initMobileTabNav() {
    const selectEl = document.querySelector(".js-tab-select-container select");

    if (!selectEl) return;

    // select current tab
    const optionEls = Array.prototype.slice.call(selectEl.querySelectorAll("option"));
    const currentTab = this.tabInputEls.find(el => el.checked);
    optionEls.forEach(el => el.selected = el.value === currentTab.id);

    // event listener for select change
    selectEl.addEventListener("change", event => {
      // change tab to selected type
      const newTabId = event.target.value;
      // toggle checked attr on inputs
      this.tabInputEls.forEach(el => el.checked = el.id === newTabId);
      // update url
      updateUrlParams("tab", newTabId);
    });
  },
};

export default tabs;
