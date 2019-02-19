import serialize from "./utils/serialize.js";

const editForm = {
  init() {
    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");
    for (let i = 0; i < submitButtonEls.length; i++) {
      submitButtonEls[i].addEventListener("click", event => {
        this.sendFormData(event);
      });
    }
  },

  sendFormData(event) {
    event.preventDefault();
    const formEl = event.target.closest("form");
    const formData = serialize(formEl);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', formEl.getAttribute("action"), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(formData);
  },
}

export default editForm;
