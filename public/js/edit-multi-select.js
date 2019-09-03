import SlimSelect from "slim-select";
import Sortable from "sortablejs";
import modal from "./modal.js";

const toArray = (nodeList) => Array.prototype.slice.call(nodeList);

const editMultiSelect = {
  init() {
    this.selectLists = toArray(document.querySelectorAll(".js-edit-multi-select-list"));

    if (this.selectLists.length < 1) return;

    this.initSelects();
    this.bindRemoveItemClicks();
    this.initSortableLists();
  },

  initSelects() {
    const selectEls = toArray(document.querySelectorAll(".js-edit-multi-select"));
    selectEls.forEach(selectEl => {
      const placeholderText = selectEl.querySelector("option[data-placeholder]").innerText;
      const slim = new SlimSelect({
        select: `#${selectEl.id}`,
        placeholder: placeholderText,
        allowDeselectOption: true,
      });

      slim.onChange = (info) => {
        this.onSelectChange({
          name: selectEl.getAttribute("name"),
          selectedKey: info.value,
          selectedText: info.text,
        });
      }

      slim.afterClose = (info) => {
        // always show the placeholder text
        slim.slim.container.querySelector(".placeholder").innerHTML = placeholderText;
      }
    });
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

  getNumItems(currentList) {
    const items = toArray(currentList.querySelectorAll("li"));
    // filter out items where input value is empty
    return items.filter(item => item.querySelector("input").value !== "").length;
  },

  onSelectChange({ name, selectedKey, selectedText }) {
    const currentList = document.querySelector(`.js-edit-multi-select-list[data-name=${name}]`);
    const currentSelect = document.querySelector(`.js-edit-multi-select[name=${name}]`);
    const maxItems = currentList.getAttribute("data-max");
    const numItems = this.getNumItems(currentList);
    const newItemHTML = this.listItemTemplate(name, selectedKey, selectedText, numItems);

    const isInList = () => {
      // converts a NodeList into an Array so we can use the find method
      const arrayOfInputs = toArray(currentList.querySelectorAll("input"));
      return arrayOfInputs.find(el => el.value === selectedKey);
    };

    const hasNotReachedMax = () => {
      if (!maxItems) return true;
      if (maxItems > numItems) return true;
    };

    if (
      hasNotReachedMax() && // if there is a max number, only allow adding items up to that limit
      selectedKey &&  // if it's the placeholder/top most item, don't append to ui
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

  listItemTemplate(name, selectedkey, selectedText, index) {
    const key = selectedkey;
    const value = selectedText.trim();
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
    e.preventDefault();
    const listItem = e.target.closest("li");
    const listContainer = listItem.closest("ol");
    const name = listContainer.getAttribute("data-name");
    const currentList = document.querySelector(`.js-edit-multi-select-list[data-name=${name}]`);
    const numItems = this.getNumItems(currentList);

    // if it's the last item, don't remove it, set the value to null/"" and hide it
    // so currently saved values will be deleted.
    if (numItems === 1) {
      listItem.querySelector("input").value = "";
      listItem.style.visibility = "hidden";
      listItem.style.height = "0";
      listItem.style.marginBottom = "0";
    } else {
      listContainer.removeChild(listItem);
      this.updateIndexes(e);
    }
  },
}

export default editMultiSelect;
