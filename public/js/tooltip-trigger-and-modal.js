import modal from "./modal.js";

const tooltipTriggerAndModal = {
  init() {
    const infoTriggerEls = document.querySelectorAll(".js-info-modal__trigger");
    for (let i = 0; i < infoTriggerEls.length; i++) {
      infoTriggerEls[i].addEventListener("click", event => {
        this.openInfoModal(event);
      });
    }
  },

  openInfoModal(event) {
    event.preventDefault();
    const triggerEl = event.target.closest("a");
    const header = triggerEl.querySelector(".js-info-modal__header").innerHTML;
    const body = triggerEl.querySelector(".js-info-modal__body").innerHTML;
    const content = `
      <h3>${header}</h3>
      <p>${body}</p>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  },
}

export default tooltipTriggerAndModal;
