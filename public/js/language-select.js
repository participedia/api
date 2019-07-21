const toArray = nodelist => Array.prototype.slice.call(nodelist);

const languageSelect = {
  init() {
    const selectEls = document.querySelectorAll(".js-language-select");

    if (!selectEls) return;

    toArray(selectEls).forEach(select => {
      select.addEventListener("change", e => this.handleSelectChange(e));
    });
  },

  handleSelectChange(e) {
    location.href = `/set-locale?locale=${e.target.value}` +
      `&redirectTo=${window.location.pathname}`;
  }
};

export default languageSelect;
