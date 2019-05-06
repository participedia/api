const languageSelect = {
  init() {
    const selectEl = document.querySelector(".js-footer-language-select");

    if (!selectEl) return;

    selectEl.addEventListener("change", e => this.handleSelectChange(e));
  },

  handleSelectChange(e) {
    // set locale cookie
    document.cookie = `locale=${e.target.value}`;

    // if location.href has a `#` at the end, remove it, b/c otherwise the page won't be reloaded
    let url = location.href;
    if (url.indexOf("#") === url.length - 1) {
      url = url.substring(0, url.length - 1);
    }

    // reload page
    location.href = url;
  }
}

export default languageSelect;
