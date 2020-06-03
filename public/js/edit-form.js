import serialize from "./utils/serialize.js";
import loadingGifBase64 from "./loading-gif-base64.js";
import modal from "./modal.js";
import tooltipTriggerAndModal from "./tooltip-trigger-and-modal.js";
import tracking from "./utils/tracking.js";

const editForm = {
  init() {
    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");

    if (!submitButtonEls) return;

    // this is a counter to keep track of publishing attempts
    // if the server returns with a 408 or a 503 (timeout errors)
    // we want to automatically retry a max of MAX_PUBLISH_ATTEMPTS
    // this is a stopgap to improve ux until we fix the underlying server issues.
    this.MAX_PUBLISH_ATTEMPTS = 10;
    this.publishAttempts = 0;

    for (let i = 0; i < submitButtonEls.length; i++) {
      submitButtonEls[i].addEventListener("click", event => {
        event.preventDefault();
        // set flag so we can check in the unload event if the user is actually trying to submit the form
        try {
          window.sessionStorage.setItem("submitButtonClick", "true");
        } catch (err) {
          console.warn(err);
        }

        this.sendFormData();
      });
    }

    // if this page was loaded with the refreshAndClose param, we can close it programmatically
    // this is part of the flow to refresh auth state
    if (window.location.search.indexOf("refreshAndClose") > 0) {
      window.close();
    }

    // do full version click
    const fullVersionButtonEl = document.querySelector(".js-do-full-version");
    if (fullVersionButtonEl) {
      fullVersionButtonEl.addEventListener("click", e => {
        e.preventDefault();
        const articleEl = document.querySelector("[data-submit-type]");
        // change submit type attribute
        articleEl.setAttribute("data-submit-type", "full");
        // update url param
        history.pushState({}, document.title, `${window.location.href}?full=1`);
        // scroll to top
        window.scrollTo(0, 0);
      });
    }

    tooltipTriggerAndModal.init();

    this.formEl = document.querySelector(".js-edit-form");
  },

  sendFormData() {
    const formData = serialize(this.formEl);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", this.formEl.getAttribute("action"), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;

      if (xhr.status === 0) {
        // if user is not logged in
        this.openAuthWarning();
      } else if (xhr.status === 413) {
        // if file uploads are too large
        this.handleErrors([
          "Sorry your files are too large. Try uploading one at at time or uploading smaller files (50mb total).",
        ]);
      } else if (xhr.status === 408 || xhr.status === 503) {
        // handle server unavailable/request timeout errors
        // rather than showing
        if (this.publishAttempts < this.MAX_PUBLISH_ATTEMPTS) {
          this.sendFormData();
          this.publishAttempts++;
        } else {
          this.handleErrors(null);
        }
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
          this.handleSuccess(response);
        } else {
          this.handleErrors(response.errors);
        }
      }
    };

    xhr.send(formData);
    // open publishing feedback modal as soon as we send the request
    this.openPublishingFeedbackModal();
  },

  openAuthWarning() {
    const content = `
      <h3>It looks like you're not logged in...</h3>
      <p>Click the button below to refresh your session in a new tab, then you'll be redirected back here to save your changes.</p>
      <a href="/login?refreshAndClose=true" target="_blank" class="button button-red js-refresh-btn">Refresh Session</a>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-refresh-btn").addEventListener("click", () => {
      try {
        window.sessionStorage.setItem("submitButtonClick", "false");
      } catch (err) {
        console.warn(err);
      }
      modal.closeModal();
    });
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
      // track user profile update and redirect to user profile
      tracking.sendWithCallback("user", "update_user_profile", "", () => {
        // redirect to user profile page
        location.href = `/user/${response.user.id}`;
      });
    } else if (response.article) {
      const isNew = this.formEl.getAttribute("action").indexOf("new") > 0;
      const eventAction = isNew ? "create_new_article" : "update_article";
      const eventLabel = response.article.type;

      // track publish action then redirect to reader page
      tracking.sendWithCallback("articles", eventAction, eventLabel, () => {
        // redirect to article reader page
        location.href = `/${response.article.type}/${response.article.id}`;
      });
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
};

export default editForm;
