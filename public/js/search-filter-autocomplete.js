import autocomplete from "autocompleter";

const toArray = nodelist => Array.prototype.slice.call(nodelist);

const searchFilterAutocomplete = {
	init() {
		const autoCompleteFields = toArray(
      document.querySelectorAll(".js-search-filter-autocomplete")
    );
    autoCompleteFields.forEach(el => this.initAutocompleteField(el));

    this.bindRemoveClick();
	},

	bindRemoveClick() {
    const listEls = document.querySelectorAll(".js-search-filter-autocomplete-list");
    listEls.forEach(el => {
      el.addEventListener("click", e => this.handleRemoveClick(e));
    });
  },

  handleRemoveClick(e) {
    e.preventDefault();

    const buttonEl = e.target.closest("button");
    if (!buttonEl) return;

    const currentLiEl = buttonEl.closest("li");
    const parentListEl = currentLiEl.parentNode;
    const numItems = parentListEl.querySelectorAll("li").length;
    
   /*
    * There are strange behavior from aria.modal.min.js
    * The modal is closing if a button inside of the modal remove from the dom.
    * The below snippet will reproduce the issue.
    * The below snippet is from ./edit-autoplete.js

    // if we have more than 1 item, remove it from the list
    // if there is only 1 item left, clear the value and hide it
    if (numItems > 1) {
      parentListEl.removeChild(currentLiEl);
    } else {
      currentLiEl.querySelector("input").value = null;
      currentLiEl.style.display = "none";
    }
    */

    // Hide the selected item from autocomplete instead.
    // All hidden elements will be remove since
    // search filter will refresh the page with fresh filter values.
    currentLiEl.querySelector("input").value = null;
    currentLiEl.style.display = "none";
  },

  getOptions(el) {
    const name = el.getAttribute("data-name");
    const optionsListEls = document.querySelectorAll(
      `.js-search-filter-autocomplete-options-${name} li`
    );
    const options = toArray(optionsListEls).map(el => {
      return {
        value: el.getAttribute("data-key"),
        label: el.innerText,
      };
    });
    return options;
  },

  addSelectedItem(name, item) {
    const listToAppendToEl = document.querySelector(
      `.js-search-filter-autocomplete-list[data-name=${name}]`
    );
    const isMulti = listToAppendToEl.getAttribute("data-multi");
    const numItems = listToAppendToEl.querySelectorAll("li").length;
    if (!isMulti && numItems > 0) {
      // if it's a single item autocomplete, update the existing item and make visible
      const currentLiEl = listToAppendToEl.querySelectorAll("li")[0];
      // update label
      currentLiEl.querySelector("span").innerText = item.label;
      // update value on hidden input
      currentLiEl.querySelector("input").value = item.value;
      currentLiEl.style.display = "flex";
    } else {
      // if it's a multi field autocomplete,
      // or if it's the first item getting added, insert a new item
      const template = document.getElementById(
        "js-search-filter-autocomplete-selected-item-template"
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
      // update label
      newItemEl.querySelector("span").innerText = item.label;
      // update value on hidden input
      hiddenEl.value = item.value;
      //append template item to list
      listToAppendToEl.insertAdjacentElement("beforeend", newItemEl);
    }
  },

  initAutocompleteField(autocompleteEl) {
    const options = this.getOptions(autocompleteEl);
    const name = autocompleteEl.getAttribute("data-name");
    autocomplete({
      minLength: 1,
      input: autocompleteEl,
      fetch: (text, update) => {
        const match = text.toLowerCase();
        const matches = options.filter(
          n => n.label.toLowerCase().indexOf(match) !== -1
        );
        update(matches);
      },
      render: (item, value) => {
        const itemElement = document.createElement("div");
        const regex = new RegExp(value, "gi");
        const inner = item.label.replace(
          regex,
          match => `<strong>${match}</strong>`
        );
        itemElement.innerHTML = inner;
        return itemElement;
      },
      emptyMsg: "No matches found",
      onSelect: item => {
        this.addSelectedItem(name, item);
        // clear autocomplete field
        autocompleteEl.value = "";
      },
    });
  },

  getSelectedItems(name) {
    const listEl = document.querySelector(`.js-search-filter-autocomplete-list[data-name=${name}]`);
    const inputEls = toArray(listEl.querySelectorAll("input"));
    const selectedItems = [];
    inputEls.forEach(el => {
      let fieldName = el.getAttribute("data-field-name");
      let value = el.getAttribute("value");
      if (value) {
        selectedItems.push({fieldName: fieldName, value: value});
      }
    });
    return selectedItems;
  }
}

export default searchFilterAutocomplete;