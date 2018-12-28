const editMediaLink = {
  init() {
    const addAnotherLinkSetEl = document.querySelectorAll(".js-add-media-link-set");
    addAnotherLinkSetEl.forEach(el => {
      el.addEventListener("click", this.addMediaLinkSet);
    });
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
    e.target.insertAdjacentElement("beforebegin", newMediaLinkSetEl.querySelector("ul"))
  }
};

export default editMediaLink;
