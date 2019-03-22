const viewSocialMedia = {
  init() {
    const bookmarkLinkEl = document.querySelector(".js-bookmark-link");

    if (!bookmarkLinkEl) return;

    this.data = {
      bookmarkType: bookmarkLinkEl.getAttribute("data-type"),
      thingid: bookmarkLinkEl.getAttribute("data-thing-id"),
    };

    // add link event listener
    bookmarkLinkEl.addEventListener("click", e => this.handleLinkClick(e));
  },

  toggleBookmark(addOrDelete, linkEl, isBookmarked) {
    const errorCodes = [500, 400, 401];
    const request = new XMLHttpRequest();
    let action = "POST";
    if (addOrDelete === "delete") {
      action = "DELETE";
    }
    request.open(action, `/bookmark/${addOrDelete}`, true);
    request.onreadystatechange = () => {
      if (request.readyState === 4 && errorCodes.includes(request.status)) {
        console.error("error: " + request.responseText)
      } else if (request.readyState === 4) {
        // success, toggle data attribute to update icon style
        linkEl.setAttribute("data-bookmarked", !isBookmarked);
      }
    };
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(JSON.stringify(this.data));
  },

  handleLinkClick(e) {
    e.preventDefault();

    const linkEl = e.target.closest("a");
    const isBookmarked = linkEl.getAttribute("data-bookmarked") === "true";

    if (isBookmarked) {
      this.toggleBookmark("delete", linkEl, isBookmarked);
    } else {
      this.toggleBookmark("add", linkEl, isBookmarked);
    }
  },
}

export default viewSocialMedia;
