import serialize from "./utils/serialize.js";

const editWarning = {
  init() {
    const formEl = document.querySelector(".js-edit-form");

    if (!formEl) return;

    const initialFormData = serialize(formEl);

    window.addEventListener("beforeunload", e => {
      // when the form is submitted we set a flag, if it's a submit click, we don't want to show the warning
      const isSubmitClick =
        sessionStorage.getItem("submitButtonClick") === "true";

      if (!isSubmitClick) {
        return null;
      } else {
        // it was a submit click, so we can reset the flag before the request continues
        try {
          window.sessionStorage.setItem("submitButtonClick", "false");
        } catch (err) {
          console.warn(err);
        }
      }
    });
  },
};

export default editWarning;
