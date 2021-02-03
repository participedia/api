const infoModal = {
  init(modal) {
    this.modal = modal;
    const infoModals = Array.prototype.slice.call(
      document.querySelectorAll(".js-info-modal-trigger")
    );

    infoModals.forEach(infoModalEl => {
      infoModalEl.addEventListener("click", e => {
        e.preventDefault();
        this.modal.updateModal(e.currentTarget.dataset.infoText);
        this.modal.openModal("aria-modal", { showCloseBtn: true });
      });
    });
  }
};

export default infoModal;