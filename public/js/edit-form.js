import formToObj from "./utils/formToObj.js";

const editForm = {
  init() {
    const formEl = document.querySelector(".js-edit-form");

    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = formToObj(formEl);
      // make sure form data is in the correct format/correct names
      console.log('data', data);
    });
  },
}

export default editForm;
