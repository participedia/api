import tooltip from "./tooltip.js";
import modal from "./modal.js";

const LOCAL_STORAGE_KEY = "participedia:input-language-helper-tooltip-viewed";

const languageSelectTooltipForNewEntryInput = {
  init() {
    // only init language tooltip if
    // 1. user is on quick submit page
    // 2. user has not yet seen tooltip
    const hasSeenTooltip = localStorage.getItem(LOCAL_STORAGE_KEY);
    const isQuickSubmit =
      location.pathname.indexOf("/case/new") === 0 ||
      location.pathname.indexOf("/method/new") === 0 ||
      location.pathname.indexOf("/organization/new") === 0;

    if (!hasSeenTooltip && isQuickSubmit) {
      const tooltipHTMLTemplate = document.querySelector(
        ".js-input-language-select-tooltip-template"
      );
      this.tooltipInstance = tooltip.init({
        selector: document.querySelector(".js-tab-items"),
        content: tooltipHTMLTemplate.innerHTML,
        showOnCreate: true,
        allowHTML: true,
        theme: "red",
        offset: [0, 15],
      });
      this.initGotItLink();
    
    }
  },

  initGotItLink() {
    // Got it Link in tooltip
    // closes/hides tooltip and saves key to local storage
    // to indicate the user has seen this tooltip and dismissed it.
    const tooltipGotItLink = document.querySelector(
      ".js-input-language-select-tooltip__got-it-link"
    );
    tooltipGotItLink.addEventListener("click", e => {
      e.preventDefault();
      // hide tooltip
      this.tooltipInstance.hide();
      // set local storage data to set that tooltip has been seen
      localStorage.setItem(LOCAL_STORAGE_KEY, true);
    });
  }
};

export default languageSelectTooltipForNewEntryInput;
