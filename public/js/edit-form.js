import serialize from "./utils/serialize.js";
import Modal from "a11y-dialog-component";

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

      if (response.OK) {
        this.handleSuccess();
      } else {
        this.handleErrors(response.errors);
      }
    }

    xhr.send(formData);
  },

  handleSuccess() {
    // remove `/edit` from current url & redirect to reader view
    // eg: /case/1234/edit => /case/1234
    location.href = location.pathname.slice(0, location.pathname.length - 5);;
  },

  errorModalHtml(errors) {
    const errorsHtml = errors.map(error => `<li>${error}</li>`).join("");
    return `
      <h3>Please fix the following issues</h3>
      <ul>
        ${errorsHtml}
      </ul>
      <button class="button button-red js-modal-close">OK</button>
    `;
  },

  handleErrors(errors) {
    const modalId = "#modal-container";
    const modal = new Modal(modalId, {
      closingSelector: ".js-modal-close",
    });
    const modalContentEl = document.querySelector(`${modalId} .c-dialog__content`);
    modalContentEl.innerHTML = this.errorModalHtml(errors);
    modal.open();

    // attach event listener for new close button inserted in modal
    modalContentEl.querySelector(".js-modal-close").addEventListener("click", modal.close);
  },
}

export default editForm;
