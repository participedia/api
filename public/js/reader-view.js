import tabsWithCards from "./tabs-with-cards.js";
import bookmarkButtons from "./bookmark-buttons.js";
import lazyLoadImages from "./lazy-load-images.js";
import infoIconToModal from "./info-icon-to-modal.js";
import modal from "./modal.js";
import loadingGifBase64 from "./loading-gif-base64.js";
import tracking from "./utils/tracking.js";

var MAX_PUBLISH_ATTEMPTS = 10;
var publishAttempts = 0;

document.addEventListener("DOMContentLoaded", () => {
  bookmarkButtons.init();
  tabsWithCards.init();
  lazyLoadImages.init();
  infoIconToModal.init();

  const submitButtonEls = document.querySelectorAll("[type=submit]");
  for (let i = 0; i < submitButtonEls.length; i++) {
    submitButtonEls[i].addEventListener("click", event => {
      // set flag so we can check in the unload event if the user is actually trying to submit the form
      try {
        window.sessionStorage.setItem("submitButtonClick", "true");
      } catch (err) {
        console.warn(err);
      }
      sendFormData(event.target.dataset);
    });
  }

  function sendFormData(_args = {}) {
    let entryLocaleData = {
      title: {},
      description: {},
      body: {},
    };
    const captchaResponse = document.querySelector(".g-recaptcha-response");
    const captchaError = document.querySelector(".js-captcha-error");
    entryLocaleData["title"] = document.getElementById(".entry-title");
    entryLocaleData["description"] = document.getElementById(
      ".entry-description"
    );
    entryLocaleData["body"] = document.getElementById(".entry-body");
    let thingId = window.location.href.split("/").pop();
    let thingType = document.URL.split("/")[3];

    if (captchaResponse && captchaResponse.value.trim() === "") {
      handleErrors([captchaError.value]);
      return;
    }

    const xhr = new XMLHttpRequest();
    const actionUrl =
      "datatype" in _args && _args.datatype == "draft"
        ? `${document.URL}/preview?datatype=draft`
        : document.URL;
    xhr.open("POST", actionUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 0) {
        // if user is not logged in
        // this.openAuthWarning();
        window.sessionStorage.setItem("submitButtonClick", "true");
        window.location.href = "/logout";
      } else if (xhr.status === 413) {
        // if file uploads are too large
        handleErrors([
          "Sorry your files are too large. Try uploading one at at time or uploading smaller files (50mb total).",
        ]);
      } else if (xhr.status === 408 || xhr.status === 503) {
        // handle server unavailable/request timeout errors
        // rather than showing
        if (this.publishAttempts < this.MAX_PUBLISH_ATTEMPTS) {
          sendFormData();
          publishAttempts++;
        } else {
          handleErrors(null);
        }
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
          handleSuccess(response);
        } else {
          handleErrors(response.errors);
        }
      }
    };

    const requestPayload = {
      entryLocales: entryLocaleData,
      type: thingType,
      thingid: thingId,
      entryId: thingId,
    };
    // console.log(requestPayload);
    xhr.send(JSON.stringify(requestPayload));
    // open publishing feedback modal as soon as we send the request
    openPublishingFeedbackModal();
  }

  function openPublishingFeedbackModal() {
    const content = `
    <div class="loading-modal-content">
      <h3>Publishing</h3>
      <img src=${loadingGifBase64} />
    </div>
  `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  }

  function handleSuccess(response) {
    if (response.user) {
      // track user profile update and redirect to user profile
      tracking.sendWithCallback("user", "update_user_profile", "", () => {
        // redirect to user profile page
        location.href = `/user/${response.user.id}`;
      });
    } else if (response.article) {
      const eventAction = "save_draft_article";
      const eventLabel = response.article.type;
      // track publish action then redirect to reader page
      tracking.sendWithCallback("articles", eventAction, eventLabel, () => {
        // redirect to article reader page
        location.reload();
      });
    }
  }

  function errorModalHtml(errors) {
    const captchaIssue = document.querySelector(".js-captcha-issue");
    if (!Array.isArray(errors)) {
      return `<h3>Sorry, something went wrong. Please try again.</h3>`;
    } else {
      const errorsHtml = errors
        .map(error => {
          if (error.errors) {
            return error.errors.map(err => `<li>${err}</li>`).join("");
          } else {
            return error;
          }
        })
        .join("");
      return `
      <h3>${captchaIssue.value}</h3>
      <ul>
        ${errorsHtml}
      </ul>
    `;
    }
  }

  function handleErrors(errors) {
    const content = errorModalHtml(errors);
    modal.updateModal(content);
    modal.openModal("aria-modal", { showCloseBtn: true });
  }
});
