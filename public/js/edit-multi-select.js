import SlimSelect from "slim-select";
import Sortable from "sortablejs";
import modal from "./modal.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

const editMultiSelect = {
  init() {
    this.selectLists = toArray(
      document.querySelectorAll(".js-edit-multi-select-list")
    );

    if (this.selectLists.length < 1) return;

    this.initSelects();
    this.bindRemoveItemClicks();
    this.initSortableLists();
  },

  initSelects() {
    document
      .querySelectorAll("select.js-edit-multi-select")
      .forEach(selectEl => {
        // grab your placeholder text
        const placeholderText = selectEl
          .querySelector("option[data-placeholder]")
          .textContent.trim();

        // instantiate SlimSelect v2
        const slim = new SlimSelect({
          select: selectEl,     // the real <select>
          settings: {
            closeOnSelect: true,                     // collapse after pick
            placeholderText: placeholderText,        // what shows when nothing selected
            allowDeselect: true,                     // let user clear
            showSearch: selectEl.options.length > 6, // hide search on small lists
          },
          events: {
            // fires _before_ the new option is in place
            beforeChange: newVal => {
              if (newVal.length) {
                // single-select: newVal[0] is the chosen Option object
                const { value, text } = newVal[0];
                this.onSelectChange({
                  name: selectEl.name,
                  selectedKey: value,
                  selectedText: text,
                });
              }
              slim.setSelected("");
            },
            // also fire on every close (in case they deselect or click away)
            afterClose: () => {
              slim.setSelected("");
            }
          }
        });
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
    const parentList = document.querySelector(
      `.js-edit-multi-select-list[data-name=${name}]`
    );

    // update the input field names to reflect new order
    toArray(parentList.querySelectorAll("input")).forEach((el, i) => {
      el.name = `${name}[${i}][key]`;
    });
  },

  bindRemoveItemClicks() {
    this.selectLists.forEach(el => {
      el.addEventListener("click", e => {
        const removeEl = e.target.closest("button");
        if (
          removeEl &&
          removeEl.classList.contains("js-edit-multi-select-remove-item")
        ) {
          this.removeItem(e);
        }
      });
    });
  },

  getNumItems(currentList) {
    const items = toArray(currentList.querySelectorAll("li"));
    // filter out items where input value is empty
    return items.filter(item => item.querySelector("input").value !== "")
      .length;
  },

  onSelectChange({ name, selectedKey, selectedText }) {
    const currentList = document.querySelector(
      `.js-edit-multi-select-list[data-name=${name}]`
    );

    const currentSelect = document.querySelector(
      `.js-edit-multi-select[name=${name}]`
    );
    const DEFAULT_MAX_ITEMS = 5;
    const maxItems = currentList.getAttribute("data-max") || DEFAULT_MAX_ITEMS;
    const numItems = this.getNumItems(currentList);
    const newItemHTML = this.listItemTemplate(
      name,
      selectedKey,
      selectedText,
      numItems
    );

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
      selectedKey && // if it's the placeholder/top most item, don't append to ui
      !isInList() // if it's already in the list, don't append to ui
    ) {
      currentList.append(newItemHTML);

if (name === 'specific_topics' || name === 'general_issues') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'topicSelection',
        'topicName': selectedText,
        'topicCategory': name,
        'caseId': document.querySelector('form')?.getAttribute('data-id') || 'new_case'
      });
    }
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

    // if we have an empty item for this key, remove it since we are now adding a new item
    // we only need the empty item when we are not adding/saving any other items
    const existingInputForIndex = document.querySelector(
      `[name="${name}[${index}][key]"]`
    );
    if (existingInputForIndex) {
      const existingItemLi = existingInputForIndex.closest("li");
      existingItemLi.parentNode.removeChild(existingItemLi);
    }

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
    const currentList = document.querySelector(
      `.js-edit-multi-select-list[data-name=${name}]`
    );
    const numItems = this.getNumItems(currentList);

    // if it's the last item, don't remove it, set the value to "" and hide it
    // so currently saved values will be deleted.
    if (numItems === 1) {
      listItem.querySelector("input").value = "";
      listItem.style.visibility = "hidden";
      listItem.style.height = "0";
      listItem.style.marginBottom = "0";
    } else {
const name = listContainer.getAttribute('data-name');
    if (name === 'specific_topics' || name === 'general_issues') {
      const removedText = listItem.querySelector('span').innerText;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'topicRemoval',
        'topicName': removedText,
        'topicCategory': name,
        'caseId': document.querySelector('form')?.getAttribute('data-id') || 'new_case'
      });
    }
      listContainer.removeChild(listItem);
      this.updateIndexes(e);
    }
  },
};

export default editMultiSelect;
