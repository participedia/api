import Quill from "quill";

const editRichText = {
  init() {
    const editorEls = document.querySelectorAll(".js-rich-text-editor-container");

    if (!editorEls.length) return; // don't init the quill editor if no editor el exists

    editorEls.forEach(editorEl => {
      const quill = new Quill(editorEl, {
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link"],
            ["clean"],
          ],
        },
        theme: "snow",
      });
      // editor el is set to display: none in the html.
      // setting to block after it's initialized so we don't
      // get a flash of unstyled content (FOUC)
      editorEl.style.display = "block";
    });
    
  },
};

export default editRichText;
