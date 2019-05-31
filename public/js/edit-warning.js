import serialize from "./utils/serialize.js";

const editWarning = {
  init() {
    const formEl = document.querySelector(".js-edit-form");

    if (!formEl) return;

    const initialFormData = serialize(formEl);

    window.addEventListener("beforeunload", (e) => {
      // when the form is submitted we set a flag, if it's a submit click, we don't want to show the warning
      const isSubmitClick = sessionStorage.getItem("participedia:submitButtonClick") === "true";
      const hasBeenSaved = sessionStorage.getItem("participedia:hasBeenSaved") === "true";

      if (!isSubmitClick && !hasBeenSaved) {
        const currentFormData = serialize(formEl);
        // check if form data changed and if it was show default confirmation dialog
        if (initialFormData !== currentFormData) {
          e.preventDefault();
          e.returnValue = "";     // Gecko and Trident
          return "";              // Gecko and WebKit
        }
      } else {
        // it was a submit click or it's already been saved,
        // so we can reset the flags before the request continues
        try {
          window.sessionStorage.setItem("participedia:submitButtonClick", "false");
          window.sessionStorage.setItem("participedia:hasBeenSaved", "false");
        } catch (err) {
          console.warn(err);
        }
      }
    });
  }
}

export default editWarning;
