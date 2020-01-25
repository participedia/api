import editMultiSelect from "./edit-multi-select.js";
import editRichText from "./edit-rich-text.js";
import editLocation from "./edit-location.js";
import editMedia from "./edit-media.js";
import editLinkSet from "./edit-link-set.js";
import editWarning from "./edit-warning.js";
import editSubmissionDetails from "./edit-submission-details.js";
import editTextarea from "./edit-textarea.js";
import editForm from "./edit-form.js";
import editAutocomplete from "./edit-autocomplete.js";
import editSelect from "./edit-select.js";

document.addEventListener("DOMContentLoaded", () => {
  editMultiSelect.init();
  editRichText.init();
  editLocation.init();
  editLinkSet.init();
  editMedia.init();
  editWarning.init();
  editSubmissionDetails.init();
  editTextarea.init();
  editForm.init();
  editAutocomplete.init();
  editSelect.init();
});
