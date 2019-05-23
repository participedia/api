// ARIAmodal is included via a script tag in main.html
// because it doesn't use a module system and attaches to the window object instead

const modal = {
  updateModal(content, footer) {
    document.querySelector("[data-modal-content]").innerHTML = content;
    document.querySelector("[data-modal-footer]").innerHTML = footer;
  },

  openModal(id) {
    ARIAmodal.openModal({}, id);
  }
};

export default modal;
