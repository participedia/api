const LANGUAGE_CODE_MAP = {
  zh: "zh-CN",
};

const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-widget-script";
const GOOGLE_TRANSLATE_SCRIPT_SRC =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
const WIDGET_POLL_DELAY = 200;
const WIDGET_POLL_MAX_ATTEMPTS = 100;
const LOCALE_STORAGE_KEY = "locale";
const THING_DETAILS_TYPES = ["case", "method", "organization"];

const languageSelect = {
  selectEls: [],
  pendingLanguageCode: null,
  widgetReady: false,
  widgetInitPromise: null,
  widgetInitResolver: null,
  widgetInitRejecter: null,
  widgetPollAttempts: 0,
  widgetPollTimer: null,

  init(tracking) {
    this.tracking = tracking;
    this.selectEls = Array.from(document.querySelectorAll(".js-language-select"));
    if (!this.selectEls.length) return;
    this.ensureWidgetInitialized().catch(() => {});

    this.selectEls.forEach(select => {
      select.addEventListener("change", e => {
        const languageCode = e.target.value;
        if (!languageCode) return;

        if (this.tracking && typeof this.tracking.sendWithCallback === "function") {
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

  mapLanguageCode(languageCode) {
    return LANGUAGE_CODE_MAP[languageCode] || languageCode;
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

  translatePage(languageCode) {
    this.pendingLanguageCode = this.mapLanguageCode(languageCode);

    this.ensureWidgetInitialized()
      .then(() => {
        if (this.pendingLanguageCode) {
          this.applyLanguageToWidget(this.pendingLanguageCode);
        }
      })
      .catch(() => {
        console.error("Google Translate widget failed to load.");
      });
  },

  applyLanguageToWidget(languageCode) {
    const widgetSelectEls = Array.from(document.querySelectorAll(".goog-te-combo"));
    if (!widgetSelectEls.length) {
      return false;
    }

    let applied = false;
    widgetSelectEls.forEach(selectEl => {
      const resolvedCode = this.resolveWidgetLanguageCode(selectEl, languageCode);
      if (resolvedCode === null) return;

      if (selectEl.value !== resolvedCode) {
        selectEl.value = resolvedCode;
      }

      selectEl.dispatchEvent(new Event("change"));
      applied = true;
    });

    return applied;
  },

  resolveWidgetLanguageCode(selectEl, languageCode) {
    const options = Array.from(selectEl.options).map(option => option.value);
    if (options.includes(languageCode)) {
      return languageCode;
    }

    if (languageCode === "en" && options.includes("")) {
      return "";
    }

    return null;
  },

  ensureWidgetInitialized() {
    if (this.widgetReady) {
      return Promise.resolve();
    }

    if (this.widgetInitPromise) return this.widgetInitPromise;

    this.widgetInitPromise = new Promise((resolve, reject) => {
      this.widgetInitResolver = resolve;
      this.widgetInitRejecter = reject;
    });

    const existingWidget = document.querySelector(".goog-te-combo");
    if (existingWidget) {
      this.handleWidgetReady();
      return this.widgetInitPromise;
    }

    window.googleTranslateElementInit = () => {
      try {
        this.mountTranslateElement();
      } catch (error) {
        this.handleWidgetInitFailure(error);
      }
    };

    if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement
    ) {
      window.googleTranslateElementInit();
      return this.widgetInitPromise;
    }

    this.injectGoogleTranslateScript();
    this.startWidgetPolling();

    return this.widgetInitPromise;
  },

  getWidgetContainer() {
    return document.querySelector(".js-google-translate-element");
  },

  mountTranslateElement() {
    const widgetContainer = this.getWidgetContainer();
    if (!widgetContainer) {
      this.handleWidgetInitFailure(new Error("Missing .js-google-translate-element container."));
      return;
    }

    if (!widgetContainer.id) {
      widgetContainer.id = "google_translate_element";
    }

    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      widgetContainer.id
    );

    this.startWidgetPolling();
  },

  injectGoogleTranslateScript() {
    if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.type = "text/javascript";
    script.src = GOOGLE_TRANSLATE_SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      script.remove();
      this.handleWidgetInitFailure(
        new Error("Could not load translate.google.com widget script.")
      );
    };

    document.body.appendChild(script);
  },

  startWidgetPolling() {
    if (this.widgetPollTimer) return;

    this.widgetPollAttempts = 0;
    this.widgetPollTimer = window.setInterval(() => {
      this.widgetPollAttempts += 1;

      const widgetExists = document.querySelector(".goog-te-combo");
      if (widgetExists) {
        this.handleWidgetReady();
        return;
      }

      if (this.widgetPollAttempts >= WIDGET_POLL_MAX_ATTEMPTS) {
        this.handleWidgetInitFailure(
          new Error("Google Translate widget did not initialize in time.")
        );
      }
    }, WIDGET_POLL_DELAY);
  },

  handleWidgetReady() {
    this.widgetReady = true;
    this.stopWidgetPolling();

    if (this.pendingLanguageCode) {
      this.applyLanguageToWidget(this.pendingLanguageCode);
    }

    this.resolveWidgetInitPromise();
  },

  handleWidgetInitFailure(error) {
    this.stopWidgetPolling();
    this.widgetReady = false;
    this.rejectWidgetInitPromise(error);
  },

  stopWidgetPolling() {
    if (this.widgetPollTimer) {
      window.clearInterval(this.widgetPollTimer);
      this.widgetPollTimer = null;
    }

    this.widgetPollAttempts = 0;
  },

  resolveWidgetInitPromise() {
    if (!this.widgetInitResolver) return;
    this.widgetInitResolver();
    this.widgetInitResolver = null;
    this.widgetInitRejecter = null;
  },

  rejectWidgetInitPromise(error) {
    if (this.widgetInitRejecter) {
      this.widgetInitRejecter(error);
    }
    this.widgetInitResolver = null;
    this.widgetInitRejecter = null;
    this.widgetInitPromise = null;
  },
};

export default languageSelect;
