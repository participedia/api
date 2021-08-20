import tooltip from "./tooltip.js";
import modal from "./modal.js";

const LOCAL_STORAGE_KEY = "participedia:language-helper-tooltip-viewed";

const languageSelectTooltipForNewEntries = {
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
        ".js-language-select-tooltip-template"
      );
      this.tooltipInstance = tooltip.init({
        selector: document.querySelector(".js-language-selector"),
        content: tooltipHTMLTemplate.innerHTML,
        showOnCreate: true,
        allowHTML: true,
        theme: "red",
        offset: [0, 15],
      });
      this.initGotItLink();
      this.initTellMeMoreLink();

      // hide tooltip if the language selector is hidden on smaller screens
      const hideTooltipIfLanguageSelectorVisible = () => {
        const languageSelectorEl = document.querySelector(".js-language-selector");
        const isVisible = getComputedStyle(languageSelectorEl).display === "block";
        if (!isVisible) {
          this.tooltipInstance.hide();
        }
      }
      hideTooltipIfLanguageSelectorVisible();
      window.onresize = hideTooltipIfLanguageSelectorVisible;
    }
  },

  initGotItLink() {
    // Got it Link in tooltip
    // closes/hides tooltip and saves key to local storage
    // to indicate the user has seen this tooltip and dismissed it.
    const tooltipGotItLink = document.querySelector(
      ".js-language-select-tooltip__got-it-link"
    );

    if(!tooltipGotItLink) return;

    tooltipGotItLink.addEventListener("click", e => {
      e.preventDefault();
      // hide tooltip
      this.tooltipInstance.hide();
      // set local storage data to set that tooltip has been seen
      localStorage.setItem(LOCAL_STORAGE_KEY, true);
    });
  },

initTellMeMoreLink() {
    // Tell me more link in tooltip
    const tooltipTellMeMoreLink = document.querySelector(
      ".js-language-select-tooltip__more-link"
    );
    const contentTemplateEl = document.querySelector(
      ".js-language-select-modal-content"
    );
    const content = `
      <h3>${contentTemplateEl.getAttribute("data-header")}</h3>
      <p>${contentTemplateEl.innerHTML}</p>
    `;
    tooltipTellMeMoreLink.addEventListener("click", e => {
      e.preventDefault();
      modal.updateModal(content);
      modal.openModal("aria-modal", { showCloseBtn: true });
    });
  },
};

export default languageSelectTooltipForNewEntries;
