const bookmarkButtons = {
  init() {
    const bookmarkButtons = Array.prototype.slice.call(
      document.querySelectorAll(".js-bookmark-button")
    );

    if (bookmarkButtons.length < 1) return;

    bookmarkButtons.forEach(bookmarkButtonEl => {
      bookmarkButtonEl.addEventListener("click", e => {
        e.preventDefault();
        this.handleLinkClick(e);
      });
    });
  },

  toggleBookmark(addOrDelete, linkEl, isBookmarked, thingid, bookmarkType) {
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
    request.send(JSON.stringify({ thingid, bookmarkType }));
  },

  handleLinkClick(e) {
    e.preventDefault();

    const linkEl = e.target.closest("a");
    const isBookmarked = linkEl.getAttribute("data-bookmarked") === "true";
    const bookmarkType = linkEl.getAttribute("data-type");
    const thingid = linkEl.getAttribute("data-thing-id");

    if (window.isAuthenticated()) {
      if (isBookmarked) {
        this.toggleBookmark("delete", linkEl, isBookmarked, thingid, bookmarkType);
      } else {
        this.toggleBookmark("add", linkEl, isBookmarked, thingid, bookmarkType);
      }
    } else {
      window.webAuth.authorize();
    }
  },
};

export default bookmarkButtons;
