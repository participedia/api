const editMediaLink = {
  init() {
    const addAnotherLinkSetEl = document.querySelectorAll(".js-add-media-link-set");
    addAnotherLinkSetEl.forEach(el => el.addEventListener("click", this.addMediaLinkSet));

    // delete button event delegation
    const linkFormGroupEls = document.querySelectorAll(".js-edit-media-link-form-group");
    linkFormGroupEls.forEach(el => el.addEventListener("click", this.deleteMediaLinkSet));
  },

  deleteMediaLinkSet(e) {
    const buttonEl = e.target.closest("button");
    if (buttonEl) {
      e.preventDefault();
      const containerEl = buttonEl.closest(".js-edit-media-link-set-container");
      containerEl.parentNode.removeChild(containerEl);
    }
  },

  addMediaLinkSet(e) {
    e.preventDefault();
    const linkSetName = e.target.getAttribute("data-for");
    const templateClass = `.js-edit-media-link-inputs-template-${linkSetName}`;
    const template = document.querySelector(templateClass);
    const newMediaLinkSetEl = document.createElement("span");
    const closestFormGroup = e.target.closest(".form-group");
    const newIndex = closestFormGroup.querySelectorAll(".edit-media-link-set").length;

    // set template html into new element
    newMediaLinkSetEl.innerHTML = template.innerHTML;

    // update name attribute index from 0 to newIndex for each li
    newMediaLinkSetEl.querySelectorAll("li").forEach(el => {
      const inputEl = el.querySelector("input");
      let name = inputEl.getAttribute("name");
      name = name.replace(/0/g, `${newIndex}`);
      inputEl.setAttribute("name", name);
    });

    // insert new set into dom
    const containerEl = newMediaLinkSetEl.querySelector(".js-edit-media-link-set-container");
    e.target.insertAdjacentElement("beforebegin", containerEl);
  }
};

export default editMediaLink;
