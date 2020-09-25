import autocomplete from "autocompleter";
import modal from "./modal.js";

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

    const currentLiEl = buttonEl.closest("li");
    const parentListEl = currentLiEl.parentNode;
    const numItems = parentListEl.querySelectorAll("li").length;

    // if we have more than 1 item, remove it from the list
    // if there is only 1 item left, clear the value and hide it
    if (numItems > 1) {
      parentListEl.removeChild(currentLiEl);
    } else {
      currentLiEl.querySelector("input").value = null;
      currentLiEl.style.display = "none";
    }
  },

  getOptions(el) {
    const name = el.getAttribute("data-name");
    const optionsListEls = document.querySelectorAll(
      `.js-edit-autocomplete-options-${name} li`
    );
    const options = toArray(optionsListEls).map(el => {
      return {
        value: el.getAttribute("data-key"),
        label: el.innerText,
      };
    });
    return options;
  },

  addSelectedItem(name, item, maxItems) {
    const listToAppendToEl = document.querySelector(
      `.js-edit-autocomplete-list[data-name=${name}]`
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
      if (maxItems > 0) {
        let currentSelectItemCount = this.getTotalSelectedItems(listToAppendToEl);
        if (currentSelectItemCount >= maxItems) {
          // TODO: Show modal for error
          console.log('Error. currentSelectItemCount is in the limit');

          // insert error text & open modal
          const errorText = `You can not add more than ${maxItems} items to this field.`;
          modal.updateModal(errorText);
          modal.openModal("aria-modal");
          return;
        }
      }

      // if it's a multi field autocomplete,
      // or if it's the first item getting added, insert a new item
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
    const limit = autocompleteEl.getAttribute("data-limit");
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
        this.addSelectedItem(name, item, limit);
        // clear autocomplete field
        autocompleteEl.value = "";
      },
    });
  },

  getTotalSelectedItems(listEl) {
    const list = listEl.querySelectorAll("li");
    const count = list.length;
    let total = 0;
    for (var i = 0; i < count; i++) {
      if (list[i].querySelector("input").getAttribute("value")) {
        total++;
      }
    }
    return total;
  }
};

export default editAutocomplete;
