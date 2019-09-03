const toArray = nodelist => Array.prototype.slice.call(nodelist);

const editLinkSet = {
  init() {
    const addAnotherLinkSetEls = document.querySelectorAll(".js-add-link-set");
    addAnotherLinkSetEls.forEach(el => el.addEventListener("click", this.addLinkSet));

    // delete button event delegation
    const linkFormGroupEls = document.querySelectorAll(".js-edit-link-set-form-group");
    linkFormGroupEls.forEach(el => el.addEventListener("click", this.deleteLinkSet));
  },

  deleteLinkSet(e) {
    const buttonEl = e.target.closest("button");
    if (buttonEl) {
      e.preventDefault();
      const containerEl = buttonEl.closest(".js-edit-link-set-container");
      const numLinkSets = containerEl
        .parentNode
        .querySelectorAll(".js-edit-link-set-container")
        .length;
      // if there is only 1 linkset, just clear the contents of the field
      // otherwise, remove the link set container altogether
      if (numLinkSets === 1) {
        const inputs = toArray(containerEl.querySelectorAll("input"));
        inputs.forEach(el => el.value = "");
      } else {
        containerEl.parentNode.removeChild(containerEl);
      }
    }
  },

  addLinkSet(e) {
    e.preventDefault();
    const linkSetName = e.target.getAttribute("data-for");
    const templateClass = `.js-edit-link-set-inputs-template-${linkSetName}`;
    const template = document.querySelector(templateClass);
    const newlinkSetSetEl = document.createElement("span");
    const closestFormGroup = e.target.closest(".form-group");
    const newIndex = closestFormGroup.querySelectorAll(".edit-link-set").length;

    // set template html into new element
    newlinkSetSetEl.innerHTML = template.innerHTML;

    // update name attribute index from 0 to newIndex for each li
    newlinkSetSetEl.querySelectorAll("li").forEach(el => {
      const inputEl = el.querySelector("input");
      let name = inputEl.getAttribute("name");
      name = name.replace(/0/g, `${newIndex}`);
      inputEl.setAttribute("name", name);
      inputEl.value = "";
    });

    // insert new set into dom
    const containerEl = newlinkSetSetEl.querySelector(".js-edit-link-set-container");
    e.target.insertAdjacentElement("beforebegin", containerEl);
  }
};

export default editLinkSet;
