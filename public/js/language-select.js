const toArray = nodelist => Array.prototype.slice.call(nodelist);
const things = ['method', 'case', 'organization'];

const languageSelect = {
  redirectUrl: null,
  isThingDetailsPageWithLanguageParam: false,
  googleTranslateObserver: null,
  googleTranslateHeaderOffsetObserver: null,
  googleTranslateHeaderOffsetRafId: null,
  lastGoogleTranslateTopOffset: null,
  init(tracking) {
    this.tracking = tracking;
    this.generateRedirectPath();
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
