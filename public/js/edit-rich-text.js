import Quill from 'quill';

const editRichText = {
  init() {
    const editorEl = document.querySelector('.js-rich-text-editor-container');
    const quill = new Quill(editorEl, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image'],
          ['clean'],
        ]
      },
      theme: 'snow',
    });
    // editor el is set to display: none in the html.
    // setting to block after it's initialized so we don't
    // get a flash of unstyled content (FOUC)
    editorEl.style.display = 'block';
  }
};

export default editRichText;
