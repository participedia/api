import Sortable from "sortablejs";
import modal from "./modal.js";

const toArray = (nodeList) => Array.prototype.slice.call(nodeList);

const editMultiSelect = {
  init() {
    this.selectLists = toArray(document.querySelectorAll(".js-edit-multi-select-list"));

    if (this.selectLists.length < 1) return;

    this.bindRemoveItemClicks();
    this.bindOnSelectChange();
    this.initSortableLists();
  },

  initSortableLists() {
    this.selectLists.forEach(el => {
      if (el.getAttribute("data-draggable")) {
        Sortable.create(el, {
          swapThreshold: 1,
          animation: 150,
          draggable: "li",
          onEnd: e => this.updateIndexes(e),
        });
      }
    });
  },

  updateIndexes(e) {
    e.preventDefault();
    const name = e.target.getAttribute("data-name");
    const parentList = document.querySelector(`.js-edit-multi-select-list[data-name=${name}]`);

    // update the input field names to reflect new order
    toArray(parentList.querySelectorAll("input")).forEach((el, i) => {
      el.name =`${name}[${i}]`;
    });
  },

  bindRemoveItemClicks() {
    this.selectLists.forEach(el => {
      el.addEventListener("click", (e) => {
        const removeEl = e.target.closest("button");
        if (removeEl && removeEl.classList.contains("js-edit-multi-select-remove-item")) {
          this.removeItem(e);
        }
      });
    });
  },

  bindOnSelectChange() {
    const selectEls = toArray(document.querySelectorAll(".js-edit-multi-select"));
    selectEls.forEach((el) => {
      el.addEventListener("change", (e) => {
        this.onSelectChange(e);
      });
    });
  },

  onSelectChange(e) {
    const name = e.target.name;
    const selectedItem = e.target.selectedOptions[0];
    const currentList = document.querySelector(`.js-edit-multi-select-list[data-name=${name}]`);
    const currentSelect = document.querySelector(`.js-edit-multi-select[name=${name}]`);
    const maxItems = currentList.getAttribute("data-max");
    const numItems = currentList.querySelectorAll("li").length;
    const newItemHTML = this.listItemTemplate(name, selectedItem, numItems);

    const isInList = () => {
      // converts a NodeList into an Array so we can use the find method
      const arrayOfInputs = toArray(currentList.querySelectorAll("input"));
      return arrayOfInputs.find(el => el.value === selectedItem.value);
    };

    const hasNotReachedMax = () => {
      if (!maxItems) return true;
      if (maxItems > numItems) return true;
    };

    if (
      hasNotReachedMax() && // if there is a max number, only allow adding items up to that limit
      selectedItem.value &&  // if it's the placeholder/top most item, don't append to ui
      !isInList() // if it's already in the list, don't append to ui
    ) {
      currentList.append(newItemHTML);
    } else if (!hasNotReachedMax()) {
      // insert error text & open modal
      const errorText = `You can not add more than ${maxItems} items to this field.`;
      modal.updateModal(errorText);
      modal.openModal("aria-modal");
    }

    // reset select to show placeholder/first option
    currentSelect.selectedIndex = 0;
  },

  listItemTemplate(name, selectedItem, index) {
    const key = selectedItem.value;
    const value = selectedItem.innerText.trim();
    const template = document.querySelector("#js-edit-multi-select-list-item");
    const newList = document.createElement("ol");
    newList.innerHTML = template.innerHTML;
    // set new data in template
    const newItem = newList.querySelector("li");
    const newItemInput = newItem.querySelector("input[type=hidden]");
    newItem.querySelector("span").innerText = value;
    newItemInput.value = key;
    newItemInput.name = `${name}[${index}][key]`;
    return newItem;
  },

  removeItem(e) {
    const listItem = e.target.closest("li");
    const listContainer = listItem.closest("ol");
    listContainer.removeChild(listItem);
    this.updateIndexes(e);
  },
}

export default editMultiSelect;
