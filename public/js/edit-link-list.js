const editLinkList = {
  init() {
    const addLinkTriggerEls = document.querySelectorAll(".js-add-link-list-item");
    addLinkTriggerEls.forEach(el => {
      el.addEventListener("click", this.addLinkItem);
    });
  },

  addLinkItem(e) {
    e.preventDefault();
    const linkListName = e.target.getAttribute("data-for");
    const templateClass = `.js-edit-link-list-item-template-${linkListName}`;
    const template = document.querySelector(templateClass);

    const newListItemEl = document.createElement("li");
    const parentUlEl = document.querySelector(`.js-edit-link-list-${linkListName}`);
    const newIndex = parentUlEl.querySelectorAll("li").length;

    // set template html into new element
    newListItemEl.innerHTML = template.innerHTML;

    // update name attribute index from 0 to newIndex on the input
    const inputEl = newListItemEl.querySelector("input");
    let name = inputEl.getAttribute("name");
    name = name.replace(/0/g, `${newIndex}`);
    inputEl.setAttribute("name", name);

    // insert new li into dom
    parentUlEl.insertAdjacentElement("beforeend", newListItemEl);
  }
};

export default editLinkList;
