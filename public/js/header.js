const header = {
  init() {
    this.bindCloseAnywhere();
  },

  bindCloseAnywhere() {
    const bgClickElement = document.querySelector('.js-sidebar-menu');
    bgClickElement.addEventListener('click', () => {
      location.href = '#';
    });
  },
};

export default header;
