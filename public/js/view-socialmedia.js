const viewSocialMedia = {
  init() {
    const bookmarkLinkEl = document.querySelector(".js-bookmark-link");

    if (!bookmarkLinkEl) return;

    this.data = {
      type: bookmarkLinkEl.getAttribute("data-type"),
      thingId: bookmarkLinkEl.getAttribute("data-thing-id"),
      userId: bookmarkLinkEl.getAttribute("data-user-id"),
    };

    // add link event listener
    bookmarkLinkEl.addEventListener("click", e => this.handleLinkClick(e));
  },

  toggleBookmark(action) {
    const request = new XMLHttpRequest();
    request.open("POST", `/bookmark/${action}`, true);
    request.onreadystatechange = () => {
      if (request.readyState != 4 || request.status != 200) {
        console.log("error: " + request.responseText);
      } else {
        console.log("success: " + request.responseText);
      }
    };
    request.send({ body: this.data });
  },

  handleLinkClick(e) {
    e.preventDefault();

    const linkEl = e.target.closest("a");
    const isBookmarked = linkEl.getAttribute("data-bookmarked") === "true";

    if (isBookmarked) {
      this.toggleBookmark("delete");
    } else {
      this.toggleBookmark("add");
    }

    // toggle state in data-attr
    linkEl.setAttribute("data-bookmarked", !isBookmarked);
  },
}

export default viewSocialMedia;
