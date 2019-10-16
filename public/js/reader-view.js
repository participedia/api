import bookmarkButtons from "./bookmark-buttons.js";
import modal from "./modal.js";

function openInfoModal(event) {
  event.preventDefault();
  const triggerEl = event.target.closest("a");
  const label = triggerEl.getAttribute("data-modal-header");
  const infoText = triggerEl.getAttribute("data-modal-text");
  const content = `
    <h3>${label}</h3>
    <p>${infoText}</p>
  `;
  modal.updateModal(content);
  modal.openModal("aria-modal");
}

document.addEventListener("DOMContentLoaded", () => {
  bookmarkButtons.init();

  const infoTriggerEls = document.querySelectorAll(".js-info-modal-trigger");
  for (let i = 0; i < infoTriggerEls.length; i++) {
    infoTriggerEls[i].addEventListener("click", event => {
      openInfoModal(event);
    });
  }
});
