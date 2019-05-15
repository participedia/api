import serialize from "./utils/serialize.js";

const editWarning = {
  init() {
    const formEl = document.querySelector(".js-edit-form");

    if (!formEl) return;

    const initialFormData = serialize(formEl);

    window.addEventListener("beforeunload", (e) => {
      // when the form is submitted we set a flag, if it's a submit click, we don't want to show the warning
      const isSubmitClick = sessionStorage.getItem("submitButtonClick") === "true";

      if (!isSubmitClick) {
        const currentFormData = serialize(formEl);
        // check if form data changed and if it was show default confirmation dialog
        if (initialFormData !== currentFormData) {
          e.preventDefault();
          e.returnValue = "";     // Gecko and Trident
          return "";              // Gecko and WebKit
        }
      } else {
        // it was a submit click, so we can reset the flag before the request continues
        sessionStorage.setItem("submitButtonClick", "false");
      }
    });
  }
}

export default editWarning;
