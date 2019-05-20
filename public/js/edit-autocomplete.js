import autocomplete from "autocompleter";

const toArray = (nodelist) => Array.prototype.slice.call(nodelist);

const editAutocomplete = {
  init() {
    const autoCompleteFields = toArray(document.querySelectorAll(".js-edit-autocomplete"));
    autoCompleteFields.forEach(el => this.initAutocompleteField(el));

    this.bindRemoveClick();
  },

  bindRemoveClick() {
    const removeEls = document.querySelectorAll(".js-edit-autocomplete-remove-item");
    removeEls.forEach(el => {
      el.addEventListener("click", e => this.handleRemoveClick(e));
    });
  },

  handleRemoveClick(e) {
    e.preventDefault();
    const name = e.target.getAttribute("data-name");
    // reset hidden field value
    const hiddenEl = document.querySelector(`input[name=${name}]`);
    hiddenEl.value = null;
    // remove selected item
    const selectedItem = document.querySelector(`.js-edit-autocomplete-selected-item-${name}`);
    selectedItem.style.display = "none";
  },

  getOptions(el) {
    const name = el.getAttribute("data-name");
    const optionsListEls = document.querySelectorAll(`.js-edit-autocomplete-options-${name} li`);
    const options = toArray(optionsListEls).map(el => {
      return {
        value: el.getAttribute("data-key"),
        label: el.innerText,
      };
    });
    return options;
  },

  initAutocompleteField(autocompleteEl) {
    const options = this.getOptions(autocompleteEl);
    const name = autocompleteEl.getAttribute("data-name");
    const hiddenEl = document.querySelector(`input[name=${name}]`);
    autocomplete({
      input: autocompleteEl,
      fetch: (text, update) => {
        const suggestions = options.filter(n => n.label.toLowerCase().startsWith(text.toLowerCase()))
        update(suggestions);
      },
      onSelect: (item) => {
        // update selected label and display selected item
        const selectedItemEl = document.querySelector(`.js-edit-autocomplete-selected-item-${name}-template`);
        selectedItemEl.querySelector("span").innerText = item.label;
        selectedItemEl.style.display = "flex";
        // set value on hidden el
        hiddenEl.value = item.value;
        // clear autocomplete field
        autocompleteEl.value = "";
      }
    });
  }
}

export default editAutocomplete;
