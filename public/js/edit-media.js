const editMedia = {
  init() {
    const dropAreaEls = document.querySelectorAll(".js-edit-media-drag-drop-area");

    dropAreaEls.forEach(el => {
      el.addEventListener("drop", ev => this.handleDrop(ev));
      el.addEventListener("dragover", ev => this.handleDragOver(ev));
      el.addEventListener("dragenter", ev => this.toggleDropAreaClass(ev));
      el.addEventListener("dragleave", ev => this.toggleDropAreaClass(ev));

      // on input change event
      el.querySelector("input[name^='temporary-']")
        .addEventListener("change", (ev) => this.handleInputChange(ev));

      // event delegation for deleting files
      el.closest('.form-group').addEventListener("click", ev => this.deleteFile(ev));
    });
  },

  handleInputChange(ev) {
    this.renderUploadedFiles(ev.target);
  },

  toggleDropAreaClass(ev) {
    ev.target.classList.toggle('drop-area-drag-over');
  },

  handleDrop(ev) {
    ev.preventDefault();
    this.toggleDropAreaClass(ev);

    const files = ev.dataTransfer.files;
    const fileInputEl = ev.target.querySelector("input[name^='temporary-']");
    fileInputEl.files = files;
    this.renderUploadedFiles(fileInputEl);
  },

  setImageSrcAndFileValue(file, type, listEl, itemIndex) {
    const reader = new FileReader();
    const fileItemEl = listEl.querySelector(`[data-index="${itemIndex}"]`);

    reader.addEventListener("load", () => {
      // set img src if type === 'image'
      // set value of file input to file value
      if (type === 'image') {
        fileItemEl.querySelector("img").src = reader.result;
      }
      fileItemEl.querySelector("input[data-attr='url']").value = reader.result;
    }, false);

    reader.readAsDataURL(file);
  },

  renderUploadedFiles(fileInputEl) {
    const listEl = fileInputEl.closest(".form-group").querySelector(".js-edit-media-file-list");
    const type = listEl.closest("ol").getAttribute("data-type");
    const name = listEl.getAttribute("data-name");
    const template = document.querySelector(`.js-edit-media-file-inputs-template-${name}`);
    const files = fileInputEl.files;

    // for each uploaded file, show the set of inputs as defined in the script/template element
    for (let i = 0; i < files.length; i++) {
      const fileItemEl = document.createElement("div");
      const itemIndex = listEl.querySelectorAll(".js-edit-media-file-list-item").length;

      fileItemEl.innerHTML = template.innerHTML;

      // set file name value on url field
      const urlInputEl = fileItemEl.querySelector("input[data-attr='url']");
      urlInputEl.value = files[i].name;

      // on all inputs set name to reflect index of item
      fileItemEl.querySelectorAll("input").forEach(el => {
        // ie: files[0]url
        el.name = `${name}[${itemIndex}][${el.getAttribute('data-attr')}]`;
      });

      fileItemEl.querySelector("li").setAttribute("data-index", itemIndex);

      listEl.insertAdjacentElement("beforeend", fileItemEl.querySelector("li"));

      // the file data has tp be read async so these need to be
      // set after the elements are in the dom.
      // set img src if type === 'image'
      // set value of file input to file value
      this.setImageSrcAndFileValue(files[i], type, listEl, itemIndex);
    }
    // clear temp input value and use hidden fields as source of truth for files to be uploaded
    fileInputEl.value = "";
  },

  deleteFile(ev) {
    const buttonEl = ev.target.closest("button");
    const isRemoveClick = buttonEl &&
      buttonEl.classList.contains("js-edit-media-file-list-remove-item");
    if (isRemoveClick) {
      ev.preventDefault();
      const liEl = ev.target.closest("li");
      const listEl = liEl.closest("ol");
      liEl.parentNode.removeChild(liEl);
      this.updateNameAttrOnFileUploadInputs(listEl);
    }
  },

  updateNameAttrOnFileUploadInputs(listEl) {
    const liEls = listEl.querySelectorAll(".js-edit-media-file-list-item");
    const name = listEl.getAttribute('data-name');
    liEls.forEach((el, index) => {
      const inputEls = el.querySelectorAll("input");
      // on all inputs set name to reflect index of item
      inputEls.forEach(el => {
        // ie: files[0][url]
        el.name = `${name}[${index}][${el.getAttribute('data-attr')}]`;
      });
    });
  },

  handleDragOver(ev) {
    // prevent default, prevent file from being opened
    ev.preventDefault();
  },
};

export default editMedia;
