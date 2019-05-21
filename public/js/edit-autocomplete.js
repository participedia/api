import autocomplete from "autocompleter";

const toArray = nodelist => Array.prototype.slice.call(nodelist);

const editAutocomplete = {
  init() {
    const autoCompleteFields = toArray(
      document.querySelectorAll(".js-edit-autocomplete")
    );
    autoCompleteFields.forEach(el => this.initAutocompleteField(el));

    this.bindRemoveClick();
  },

  bindRemoveClick() {
    const listEls = document.querySelectorAll(".js-edit-autocomplete-list");
    listEls.forEach(el => {
      el.addEventListener("click", e => this.handleRemoveClick(e));
    });
  },

  handleRemoveClick(e) {
    e.preventDefault();

    const buttonEl = e.target.closest("button");
    if (!buttonEl) return;

    const currentEl = buttonEl.closest("li");
    const name = currentEl.getAttribute("data-name");
    // reset hidden field value
    const hiddenEl = currentEl.querySelector("input");
    currentEl.style.display = "none";
    hiddenEl.value = null;
  },

  getOptions(el) {
    const name = el.getAttribute("data-name");
    const optionsListEls = document.querySelectorAll(
      `.js-edit-autocomplete-options-${name} li`
    );
    const options = toArray(optionsListEls).map(el => {
      return {
        value: el.getAttribute("data-key"),
        label: el.innerText
      };
    });
    return options;
  },

  addSelectedItem(autocompleteEl, name, item) {
    const listToAppendToEl = document.querySelector(
      `.js-edit-autocomplete-list[data-name=${name}]`
    );
    const template = document.getElementById(
      "js-edit-autocomplete-selected-item-template"
    );
    const newListContainer = document.createElement("ol");
    newListContainer.innerHTML = template.innerHTML;
    const newItemEl = newListContainer.querySelector("li");
    const hiddenEl = newItemEl.querySelector("input");

    // update name on li
    newItemEl.setAttribute("data-name", name);
    // update name and index on hidden input

    if (listToAppendToEl.getAttribute("data-multi")) {
      const index = listToAppendToEl.querySelectorAll("li").length;
      hiddenEl.name = `${name}[${index}]`;
    } else {
      hiddenEl.name = name;
    }
    // update selected label
    newItemEl.querySelector("span").innerText = item.label;
    // update value on hidden input
    hiddenEl.value = item.value;
    // clear autocomplete field
    autocompleteEl.value = "";
    //append template li to list
    listToAppendToEl.append(newItemEl);
  },

  initAutocompleteField(autocompleteEl) {
    const options = this.getOptions(autocompleteEl);
    const name = autocompleteEl.getAttribute("data-name");
    autocomplete({
      input: autocompleteEl,
      fetch: (text, update) => {
        const suggestions = options.filter(n =>
          n.label.toLowerCase().startsWith(text.toLowerCase())
        );
        update(suggestions);
      },
      onSelect: item => {
        this.addSelectedItem(autocompleteEl, name, item);
      }
    });
  }
};

export default editAutocomplete;
