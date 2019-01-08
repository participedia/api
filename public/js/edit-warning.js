import serialize from "./utils/serialize.js";

const editWarning = {
  init() {
    const formEl = document.querySelector(".js-edit-form");
    const initialFormData = serialize(formEl);

    window.addEventListener("beforeunload", (e) => {
      const currentFormData = serialize(formEl);
      // check if form data changed and if it was show default confirmation dialog
      if (initialFormData !== currentFormData) {
        e.returnValue = '';     // Gecko and Trident
        return '';              // Gecko and WebKit
      }
    });
  }
}

export default editWarning;
