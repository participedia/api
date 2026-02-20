const LOCALE_STORAGE_KEY = "locale";
const THING_DETAILS_TYPES = ["case", "method", "organization"];

const languageSelect = {
  selectEls: [],

  init(tracking) {
    this.tracking = tracking;
    this.selectEls = Array.from(document.querySelectorAll(".js-language-select"));
    if (!this.selectEls.length) return;

    this.selectEls.forEach(select => {
      select.addEventListener("change", e => {
        const languageCode = e.target.value;
        if (!languageCode) return;

        if (
          this.tracking &&
          typeof this.tracking.sendWithCallback === "function"
        ) {
          this.tracking.sendWithCallback(
            "language",
            "language_dropdown",
            languageCode,
            () => {
              this.handleLanguageChange(languageCode);
            }
          );
          return;
        }

        this.handleLanguageChange(languageCode);
      });
    });
  },

  handleLanguageChange(languageCode) {
    this.syncSelectors(languageCode);
    this.setLocaleAndReload(languageCode);
  },

  syncSelectors(languageCode) {
    this.selectEls.forEach(select => {
      if (select.value !== languageCode) {
        select.value = languageCode;
      }
    });

    document.querySelectorAll(".selected-language").forEach(el => {
      el.textContent = languageCode.toUpperCase();
    });
  },

  setLocaleAndReload(languageCode) {
    const redirectTo = this.getRedirectUrl(languageCode);
    const setLocaleParams = new URLSearchParams({
      locale: languageCode,
      redirectTo,
    });

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, languageCode);
    } catch (error) {
      // Ignore storage errors (privacy settings, etc.) and continue.
    }

    location.href = `/set-locale?${setLocaleParams.toString()}`;
  },

  getRedirectUrl(languageCode) {
    const currentUrl = new URL(window.location.href);
    this.updateThingDetailsLanguageSegment(currentUrl, languageCode);
    this.updateLangQueryParam(currentUrl, languageCode);
    return `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  },

  updateThingDetailsLanguageSegment(currentUrl, languageCode) {
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);

    if (pathSegments.length !== 3) return;

    const [type, , existingLanguageCode] = pathSegments;
    if (!THING_DETAILS_TYPES.includes(type)) return;
    if (!/^[a-z]{2}$/i.test(existingLanguageCode)) return;

    pathSegments[2] = languageCode;
    currentUrl.pathname = `/${pathSegments.join("/")}`;
  },

  updateLangQueryParam(currentUrl, languageCode) {
    if (!currentUrl.searchParams.has("lang")) return;
    currentUrl.searchParams.set("lang", languageCode);
  },
};

export default languageSelect;
