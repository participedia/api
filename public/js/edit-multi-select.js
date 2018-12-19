import Modal from './vendor/a11y-dialog-component.esm.js';

const editMultiSelect = {
  init() {
    this.selectLists = document.querySelectorAll(".js-edit-multi-select-list");

    this.bindRemoveItemClicks();
    this.bindOnSelectChange();
    this.bindDragHandlers();

    this.modalId = "#modal-container";
    this.modal = new Modal(this.modalId);
  },

  bindDragHandlers() {
    let sourceLi;
    this.selectLists.forEach(el => {
      el.addEventListener("dragstart", (e) => {
        sourceLi = e.target;
        e.dataTransfer.dropEffect = "move";
      });

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.target.nodeName === "LI") {
          e.dataTransfer.dropEffect = "move";
        }
      });

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        const parentList = e.target.closest("ol");
        const allLiEls = parentList.querySelectorAll("li");
        const name = parentList.getAttribute("data-name");
        const droppedLi = e.target.closest("li");
        const newSourceLi = `<li draggable="true">${sourceLi.innerHTML}</li>`;

        const getIndexOfLi = (node) => {
          for (var i = 0; i < allLiEls.length; i++) {
            if (node === allLiEls[i]) break;
          }
          return i;
        };

        if (droppedLi) {
          const droppedLiIndex = getIndexOfLi(droppedLi);
          const sourceLiIndex = getIndexOfLi(sourceLi);

          if (droppedLiIndex < sourceLiIndex) {
            droppedLi.insertAdjacentHTML("beforebegin", newSourceLi);
          } else {
            droppedLi.insertAdjacentHTML("afterend", newSourceLi);
          }

          sourceLi.remove();

          // update the input field names to reflect new order
          parentList.querySelectorAll("input").forEach((el, i) => {
            el.name =`${name}[${i}]`;
          });
        }
      });
    });
  },

  isRanked(name) {
    const currentSelect = document.querySelector(`.js-edit-multi-select[name=${name}]`);
    return !!currentSelect.getAttribute("data-ranked");
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
    const selectEls = document.querySelectorAll(".js-edit-multi-select");
    selectEls.forEach((el) => {
      el.addEventListener("change", (e) => {
        this.onSelectChange(e);
      });
    });
  },

  onSelectChange(e) {
    const name = e.target.name;
    const selectedItem = e.target.selectedOptions[0];
    const currentList = document.querySelector(`.js-edit-multi-select-list[data-name=${e.target.name}]`);
    const currentSelect = document.querySelector(`.js-edit-multi-select[name=${name}]`);
    const maxItems = currentList.getAttribute("data-max");
    const numItems = currentList.querySelectorAll("li").length;
    const newItemHTML = this.listItemTemplate(name, selectedItem, numItems);

    const isInList = () => {
      // converts a NodeList into an Array so we can use the find method
      const arrayOfInputs = Array.prototype.slice.call(currentList.querySelectorAll("input"));
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
      // open warning modal
      const errorText = `You can not add more than ${maxItems} items to this field.`;
      document.querySelector(`${this.modalId} p`).innerText = errorText;
      this.modal.open();
    }

    // reset select to show placeholder/first option
    currentSelect.selectedIndex = 0;
  },

  listItemTemplate(name, selectedItem, index) {
    const key = selectedItem.value;
    const value = selectedItem.innerText.trim();
    const ranked = this.isRanked(name);
    const template = document.querySelector("#js-edit-multi-select-list-item");
    const newList = document.createElement("ol");
    newList.innerHTML = template.innerHTML;
    // set new data in template
    const newItem = newList.querySelector("li");
    const newItemInput = newItem.querySelector("input[type=hidden]");
    if (ranked) newItem.setAttribute("draggable", ranked);
    newItem.querySelector("span").innerText = value;
    newItemInput.value = key;
    newItemInput.name = `${name}[${index}]`;
    return newItem;
  },

  removeItem(e) {
    const listItem = e.target.closest("li");
    const listContainer = listItem.closest("ol");
    listContainer.removeChild(listItem);
  },
}

export default editMultiSelect;
