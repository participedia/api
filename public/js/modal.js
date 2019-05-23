// ARIAmodal is included via a script tag in main.html
// because it doesn't use a module system and attaches to the window object instead

const modal = {
  updateModal(content) {
    document.querySelector("[data-modal-content]").innerHTML = content;
  },

  openModal(id, options = {}) {
    // open the modal
    ARIAmodal.openModal({}, id);

    // if we are showing the close button,
    // make it visible and attach click handler
    const modalEl = document.getElementById(id);
    if (options.showCloseBtn) {
      modalEl.querySelector("[data-modal-footer]").style.display = "block";
      modalEl.addEventListener("click", e => {
        if (e.target.closest("[data-modal-close]")) {
          ARIAmodal.closeModal({}, id);
        }
      });
    } else {
      modalEl.querySelector("[data-modal-footer]").style.display = "none";
    }
  }
};

export default modal;
