const toArray = nodelist => Array.prototype.slice.call(nodelist);
const things = ['method', 'case', 'organization'];

const languageSelect = {
  redirectUrl: null,
  isThingDetailsPageWithLanguageParam: false,
  init() {
    this.generateRedirectPath();
    const selectEls = document.querySelectorAll(".js-language-select");

    if (!selectEls) return;

    toArray(selectEls).forEach(select => {
      select.addEventListener("change", e => this.handleSelectChange(e));
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
    if (urlPathMeta[1] && things.indexOf(urlPathMeta[1]) >= 0 && urlPathMeta[3]) {
      this.redirectUrl = `/${urlPathMeta[1]}/${urlPathMeta[2]}`;
      this.isThingDetailsPageWithLanguageParam = true;
    }
  }
};

export default languageSelect;
