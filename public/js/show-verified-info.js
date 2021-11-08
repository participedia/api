import modal from "./modal.js";

const showMessageOnClick = {
    init() {
      const containerEl = document.querySelector(".js-show-verified-info-container");
  
      if (!containerEl) return;
  
      containerEl.addEventListener("click", e => {
        const button = e.target.closest(".js-show-verified-info-trigger");
        if (button) {
          this.openPublishingFeedbackModal();
        }
      });
    },

    openPublishingFeedbackModal() {
      const content = `
        <div class="loading-modal-content">
          <h2>This entry has been reviewed by our Editorial Board and can no longer be edited. If you would like to suggest changes to this entry, please contact us.</h3>
        </div>
      `;
      modal.updateModal(content);
      modal.openModal("aria-modal");
    },
  };

  
  export default showMessageOnClick;
  