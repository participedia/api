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

    // TODO: before we make the request, make sure required fields are not empty

    const xhr = new XMLHttpRequest();
    xhr.open('POST', formEl.getAttribute("action"), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;

      const response = JSON.parse(xhr.response);
      console.log(response)

      if (response.OK) {
        // show success ui
        this.renderSuccess();
      } else {
        // show error ui
        this.renderErrors(response.errors);
      }
    }

    xhr.send(formData);
  },

  renderSuccess() {
    alert("success");
  },

  renderErrors() {
    alert("error");
  },
}

export default editForm;
