import autocomplete from "autocompleter";

const editSubmissionDetails = {
  init() {
    const firstSubmittedAutoCompleteEl = document.querySelector("#js-creator-name");
    const firstSubmittedHiddenEl = document.querySelector("input[name=creator]");
    const mostRecentChangeAutoCompleteEl = document.querySelector("#js-last-updated-by-name");
    const mostRecentChangeHiddenEl = document.querySelector("input[name=last_updated_by]");

    if (!firstSubmittedAutoCompleteEl) return; // if submission field not present, don't continue

    // get author data from ui
    const authors = this.getAuthorData();

    // first submitted
    this.initAutocompleteField(firstSubmittedAutoCompleteEl, firstSubmittedHiddenEl, authors);

    // most recent
    this.initAutocompleteField(mostRecentChangeAutoCompleteEl, mostRecentChangeHiddenEl, authors);

    this.bindEditBtn();
  },

  bindEditBtn() {
    const editBtn = document.querySelector(".js-edit-submission-details-btn");
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // show edit ui
      document.querySelector(".js-admin-edit-submission-details").style = "display: block";
      // hide static ui
      document.querySelector(".js-view-submission-details").style = "display: none";

      // hide edit button
      e.target.style = "display: none";
    });
  },

  getAuthorData() {
    const authorsLiEls = document.querySelectorAll(".js-author-list li");
    const authors = Array.prototype.slice.call(authorsLiEls).map(el => {
      return {
        value: el.getAttribute("data-user-id"),
        label: el.innerText,
      };
    });
    return authors;
  },

  initAutocompleteField(autocompleteEl, hiddenEl, authors) {
    autocomplete({
      input: autocompleteEl,
      fetch: function(text, update) {
        const suggestions = authors.filter(n => n.label.toLowerCase().startsWith(text.toLowerCase()))
        update(suggestions);
      },
      onSelect: function(item) {
        // set label on input
        autocompleteEl.value = item.label;
        // set value on hidden el
        hiddenEl.value = item.value;
      }
    });
  }
}

export default editSubmissionDetails;
