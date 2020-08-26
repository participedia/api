// ARIAmodal is included via a script tag in main.html
// because it doesn't use a module system and attaches to the window object instead

const searchFilterModal = {
  openModal(id, options = {}) {
    // open the modal
    // using setTimeout with 1 ms delay to simulate the _.defer function,
    // which forces the program to wait until the current call stack has cleared before calling open
    setTimeout(() => {
      ARIAmodal.openModal(options, id);
    }, 1);

    // if we are showing the close button,
    // make it visible and attach click handler
    const modalEl = document.getElementById(id);
    modalEl.addEventListener("click", e => {
      if (e.target.closest("[data-modal-close]")) {
        ARIAmodal.closeModal(options, id);
      }
    });
  },

  closeModal() {
    ARIAmodal.closeModal();
  },
};

export default searchFilterModal;
