const languageSelect = {
  init() {
    const selectEl = document.querySelector(".js-footer-language-select");

    if (!selectEl) return;

    selectEl.addEventListener("change", e => this.handleSelectChange(e));
  },

  handleSelectChange(e) {
    // set locale cookie and reload page
    document.cookie = `locale=${e.target.value}`;
    location.href = location.href;
  }
}

export default languageSelect;
