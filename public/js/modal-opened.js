import modal from "./modal.js";

const modalOpened = {
  init() {
    setTimeout(() => {
      const infoTriggerEls = document.querySelectorAll(
        ".js-info-modal-opened__trigger"
      );
      for (let i = 0; i < infoTriggerEls.length; i++) {
          this.openInfoModal(infoTriggerEls[i]);
      }
    }, 2000);
  },

  openInfoModal(target) {
    const triggerEl = target.closest("a");
    const header = triggerEl.querySelector(".js-info-modal__header").innerHTML;
    const body = triggerEl.querySelector(".js-info-modal__body").innerHTML;
    const content = `
      <h3>${header}</h3>
      <p>${body}</p>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal", { showCloseBtn: true });
  },
};

export default modalOpened;
