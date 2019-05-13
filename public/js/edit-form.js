import serialize from "./utils/serialize.js";
import Modal from "a11y-dialog-component";

const editForm = {
  init() {
    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");

    if (!submitButtonEls) return;

    for (let i = 0; i < submitButtonEls.length; i++) {
      submitButtonEls[i].addEventListener("click", event => {
        this.sendFormData(event);
      });
    }

    const infoTriggerEls = document.querySelectorAll(".js-info-modal-trigger");
    for (let i = 0; i < infoTriggerEls.length; i++) {
      infoTriggerEls[i].addEventListener("click", event => {
        this.openInfoModal(event);
      });
    }
  },

  openInfoModal(event) {
    event.preventDefault();
    const triggerEl = event.target.closest("a");
    const label = triggerEl.getAttribute("data-field-label");
    const infoText = triggerEl.getAttribute("data-info-text");
    const modalId = "#modal-container";
    const modal = new Modal(modalId, {
      closingSelector: ".js-modal-close",
    });
    const modalContentEl = document.querySelector(`${modalId} .c-dialog__content`);
    modalContentEl.innerHTML = `
      <h3>${label}</h3>
      <p>${infoText}</p>
    `;
    modal.open();

    // attach event listener for new close button inserted in modal
    const closeBtn = modalContentEl.querySelector(".js-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", modal.close);
    }
  },

  sendFormData(event) {
    event.preventDefault();
    const formEl = event.target.closest("form");

    if (!formEl) return;

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
        this.handleSuccess(response);
      } else {
        this.handleErrors(response.errors);
      }
    }

    xhr.send(formData);
  },

  handleSuccess(response) {
    if (response.user) {
      // redirect to user profile page
      location.href = `/user/${response.user.id}`;
    } else if (response.article) {
      // redirect to article reader page
      location.href = `/${response.article.type}/${response.article.id}`;
    }
  },

  errorModalHtml(errors) {
    if (!Array.isArray(errors)) {
      return `<h3>Sorry, something went wrong. Please try again.</h3>`;
    } else {
      const errorsHtml = errors.map(error => `<li>${error}</li>`).join("");
      return `
        <h3>Please fix the following issues</h3>
        <ul>
          ${errorsHtml}
        </ul>
        <button class="button button-red js-modal-close">OK</button>
      `;
    }
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
    const closeBtn = modalContentEl.querySelector(".js-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", modal.close);
    }
  },
}

export default editForm;
