const toArray = nodelist => Array.prototype.slice.call(nodelist);
const things = ['method', 'case', 'organization'];
const GOOGLE_TRANSLATE_DEFAULT_LABEL = "Language";
const GOOGLE_TRANSLATE_ICON_SVG =
  "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"30px\" viewBox=\"0 -960 960 960\" width=\"30px\" fill=\"#FFFFFF\"><path d=\"M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480.5-880t155 31.5q72.5 31.5 127 86t86 127Q880-563 880-480.5T848.5-325q-31.5 73-86 127.5t-127 86Q563-80 480.5-80T325-111.5ZM480-162q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z\"/></svg>";

const languageSelect = {
  redirectUrl: null,
  isThingDetailsPageWithLanguageParam: false,
  googleTranslateObserver: null,
  googleTranslateLabelObserver: null,
  googleTranslateLabelIntervalId: null,
  googleTranslateHeaderOffsetObserver: null,
  googleTranslateHeaderOffsetRafId: null,
  lastGoogleTranslateTopOffset: null,
  init(tracking) {
    this.tracking = tracking;
    this.generateRedirectPath();
    this.initGoogleTranslateDefaultLabel();
    this.initGoogleTranslateSelectDeduper();
    this.initGoogleTranslateHeaderOffset();
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

  initGoogleTranslateDefaultLabel() {
    if (!document.querySelector("#google_translate_element")) return;

    if (this.setGoogleTranslateDefaultLabel()) return;

    if (window.MutationObserver && document.body) {
      this.googleTranslateLabelObserver = new MutationObserver(() => {
        if (!this.setGoogleTranslateDefaultLabel()) return;
        this.teardownGoogleTranslateDefaultLabelWatcher();
      });

      this.googleTranslateLabelObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    this.googleTranslateLabelIntervalId = window.setInterval(() => {
      if (!this.setGoogleTranslateDefaultLabel()) return;
      this.teardownGoogleTranslateDefaultLabelWatcher();
    }, 250);
  },

  setGoogleTranslateDefaultLabel() {
    const googleTranslateSelect = document.querySelector("select.goog-te-combo");
    if (!googleTranslateSelect || !googleTranslateSelect.options || !googleTranslateSelect.options.length) {
      return false;
    }

    const firstOption = googleTranslateSelect.options[0];
    firstOption.text = GOOGLE_TRANSLATE_DEFAULT_LABEL;
    googleTranslateSelect.style.color = "#fff";
    googleTranslateSelect.style.paddingLeft = "30px";

    if (!googleTranslateSelect.getAttribute("data-google-translate-iconized")) {
      const googleTranslateIconUri = `url("data:image/svg+xml,${encodeURIComponent(GOOGLE_TRANSLATE_ICON_SVG)}")`;
      const existingBackgroundImage = window.getComputedStyle(googleTranslateSelect).backgroundImage;
      const hasExistingBackgroundImage = existingBackgroundImage && existingBackgroundImage !== "none";

      googleTranslateSelect.style.backgroundImage = hasExistingBackgroundImage
        ? `${googleTranslateIconUri}, ${existingBackgroundImage}`
        : googleTranslateIconUri;
      googleTranslateSelect.style.backgroundRepeat = hasExistingBackgroundImage
        ? "no-repeat, no-repeat"
        : "no-repeat";
      googleTranslateSelect.style.backgroundPosition = hasExistingBackgroundImage
        ? "8px center, calc(100% - 8px) center"
        : "8px center";
      googleTranslateSelect.style.backgroundSize = hasExistingBackgroundImage
        ? "16px 16px, 18px 18px"
        : "16px 16px";
      googleTranslateSelect.setAttribute("data-google-translate-iconized", "true");
    }

    return firstOption.text === GOOGLE_TRANSLATE_DEFAULT_LABEL;
  },

  teardownGoogleTranslateDefaultLabelWatcher() {
    if (this.googleTranslateLabelObserver) {
      this.googleTranslateLabelObserver.disconnect();
      this.googleTranslateLabelObserver = null;
    }

    if (!this.googleTranslateLabelIntervalId) return;

    window.clearInterval(this.googleTranslateLabelIntervalId);
    this.googleTranslateLabelIntervalId = null;
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

  initGoogleTranslateHeaderOffset() {
    if (!document.querySelector("#google_translate_element")) return;

    this.queueSyncGoogleTranslateHeaderOffset();

    window.addEventListener("resize", () => {
      this.queueSyncGoogleTranslateHeaderOffset();
    });

    if (!window.MutationObserver || !document.body) return;

    this.googleTranslateHeaderOffsetObserver = new MutationObserver(() => {
      this.queueSyncGoogleTranslateHeaderOffset();
    });

    this.googleTranslateHeaderOffsetObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    this.googleTranslateHeaderOffsetObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  queueSyncGoogleTranslateHeaderOffset() {
    if (this.googleTranslateHeaderOffsetRafId) return;

    if (!window.requestAnimationFrame) {
      this.syncGoogleTranslateHeaderOffset();
      return;
    }

    this.googleTranslateHeaderOffsetRafId = window.requestAnimationFrame(() => {
      this.googleTranslateHeaderOffsetRafId = null;
      this.syncGoogleTranslateHeaderOffset();
    });
  },

  syncGoogleTranslateHeaderOffset() {
    const topOffset = this.getGoogleTranslateTopOffset();
    if (topOffset === this.lastGoogleTranslateTopOffset) return;

    this.lastGoogleTranslateTopOffset = topOffset;
    document.documentElement.style.setProperty(
      "--google-translate-offset",
      `${topOffset}px`
    );
  },

  getGoogleTranslateTopOffset() {
    if (!document.body) return 0;

    const bodyTop = parseFloat(window.getComputedStyle(document.body).top) || 0;
    const googleBannerEls = document.querySelectorAll(
      "iframe.goog-te-banner-frame, .goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd, iframe[class*='VIpgJd']"
    );

    let visibleBannerHeight = 0;
    toArray(googleBannerEls).forEach(bannerEl => {
      const styles = window.getComputedStyle(bannerEl);
      if (styles.display === "none" || styles.visibility === "hidden") return;

      const bannerHeight = Math.round(bannerEl.getBoundingClientRect().height);
      if (bannerHeight > visibleBannerHeight) {
        visibleBannerHeight = bannerHeight;
      }
    });

    return Math.max(0, Math.max(Math.round(bodyTop), visibleBannerHeight));
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
