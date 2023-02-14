import modal from "./modal.js";

const showMessageOnClick = {
  init() {
    const containerEl = document.querySelector(
      ".js-show-verified-info-container"
    );
    const isAdmin = document.querySelector(".js-is-admin")
      ? JSON.parse(document.querySelector(".js-is-admin").value)
      : false;
    const reviewedMessage = document.querySelector(".js-verified-message");

    if (!containerEl) return;

    containerEl.addEventListener("click", e => {
      const button = e.target.closest(".js-show-verified-info-trigger");

      if (button) {
        if (isAdmin) {
          window.open(window.location.href + "/edit", "_self");
        } else {
          this.openPublishingFeedbackModal(reviewedMessage.value);
        }
      }
    });
  },

  openPublishingFeedbackModal(message) {
    const content = `
      <p>${message}</p>
      `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  },
};

export default showMessageOnClick;
