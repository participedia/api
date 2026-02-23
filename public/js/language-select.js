const toArray = nodelist => Array.prototype.slice.call(nodelist);
const things = ['method', 'case', 'organization'];

const languageSelect = {
  redirectUrl: null,
  isThingDetailsPageWithLanguageParam: false,
  googleTranslateObserver: null,
  init(tracking) {
    this.tracking = tracking;
    this.generateRedirectPath();
    this.initGoogleTranslateSelectDeduper();
    const selectEls = document.querySelectorAll(".js-language-select");

    if (!selectEls) return;

    toArray(selectEls).forEach(select => {
      select.addEventListener("change", e => {
        this.tracking.sendWithCallback("language", "language_dropdown", e.target.value, () => {
          this.handleSelectChange(e);
        });
      });
    });
  },

  initGoogleTranslateSelectDeduper() {
    const googleTranslateContainerEls = document.querySelectorAll("#google_translate_element");
    if (!googleTranslateContainerEls.length) return;

    this.markDuplicateGoogleTranslateSelects();
    if (!window.MutationObserver) return;

    this.googleTranslateObserver = new MutationObserver(() => {
      this.markDuplicateGoogleTranslateSelects();
    });

    toArray(googleTranslateContainerEls).forEach(containerEl => {
      this.googleTranslateObserver.observe(containerEl, {
        childList: true,
        subtree: true
      });
    });
  },

  markDuplicateGoogleTranslateSelects() {
    const googleTranslateSelectEls = document.querySelectorAll("select.goog-te-combo");
    if (!googleTranslateSelectEls.length) return;

    toArray(googleTranslateSelectEls).forEach((select, index) => {
      if (index === 0) {
        select.removeAttribute("data-google-translate-duplicate");
        return;
      }

      select.setAttribute("data-google-translate-duplicate", "true");
    });
  },

  handleSelectChange(e) {
    let redirectUrl = this.isThingDetailsPageWithLanguageParam ? `${this.redirectUrl}/${e.target.value}` : this.redirectUrl;
    location.href =
      `/set-locale?locale=${e.target.value}` +
      `&redirectTo=${redirectUrl}`;
  },

  generateRedirectPath() {
    this.redirectUrl = window.location.pathname;
    let urlPathMeta = window.location.pathname.split('/');
    if (urlPathMeta[1] && things.indexOf(urlPathMeta[1]) >= 0 && urlPathMeta[3] && (urlPathMeta[3] !== 'edit')) {
      this.redirectUrl = `/${urlPathMeta[1]}/${urlPathMeta[2]}`;
      this.isThingDetailsPageWithLanguageParam = true;
    }
  }
};

export default languageSelect;
