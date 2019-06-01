import serialize from "./utils/serialize.js";
import loadingGifBase64 from "./loading-gif-base64.js";
import modal from "./modal.js";

const editForm = {
  init() {
    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");

    if (!submitButtonEls) return;

    for (let i = 0; i < submitButtonEls.length; i++) {
      submitButtonEls[i].addEventListener("click", event => {
        // set flag so we can check in the unload event if the user is actually trying to submit the form
        try {
          window.sessionStorage.setItem("submitButtonClick", "true");
        } catch (err) {
          console.warn(err);
        }
        this.sendFormData(event);
      });
    }

    const infoTriggerEls = document.querySelectorAll(".js-info-modal-trigger");
    for (let i = 0; i < infoTriggerEls.length; i++) {
      infoTriggerEls[i].addEventListener("click", event => {
        this.openInfoModal(event);
      });
    }

    // do full version click
    document.querySelector(".js-do-full-version")
      .addEventListener("click", e => {
        e.preventDefault();
        const articleEl = document.querySelector("[data-submit-type]");
        const type = articleEl.setAttribute("data-submit-type", "full");
        // update url param
        history.pushState({}, document.title, `${window.location.href}?full=1`);
        // scroll to top
        window.scrollTo(0, 0);
      });
  },

  openInfoModal(event) {
    event.preventDefault();
    const triggerEl = event.target.closest("a");
    const label = triggerEl.getAttribute("data-field-label");
    const infoText = triggerEl.getAttribute("data-info-text");
    const content = `
      <h3>${label}</h3>
      <p>${infoText}</p>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  },

  sendFormData(event) {
    event.preventDefault();
    const formEl = event.target.closest("form");

    if (!formEl) return;

    const formData = serialize(formEl);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', formEl.getAttribute("action"), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 2) {
        this.openPublishingFeedbackModal();
      }

      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;

      if (xhr.status === 413) {
        // todo i18n this error message
        this.handleErrors([
          "Sorry your files are too large. Try uploading one at at time or uploading smaller files (50mb total)."
        ]);
      } else {
        const response = JSON.parse(xhr.response);

        if (response.OK) {
          this.handleSuccess(response);
        } else {
          this.handleErrors(response.errors);
        }
      }
    }

    xhr.send(formData);
  },

  openPublishingFeedbackModal() {
    const content = `
      <div class="loading-modal-content">
        <h3>Publishing</h3>
        <img src=${loadingGifBase64} />
      </div>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  },

  handleSuccess(response) {
    if (response.user) {
      // redirect to user profile page
      location.href = `/user/${response.user.id}`;
    } else {
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
      `;
    }
  },

  handleErrors(errors) {
    const content = this.errorModalHtml(errors);
    modal.updateModal(content);
    modal.openModal("aria-modal", { showCloseBtn: true });
  },
}

export default editForm;
