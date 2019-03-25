import { xhrReq } from "./utils/utils.js";

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
    let action = "POST";
    if (addOrDelete === "delete") {
      action = "DELETE";
    }
    const successCB = () => {
      linkEl.setAttribute("data-bookmarked", !isBookmarked);
    }
    const data = JSON.stringify({ thingid, bookmarkType });
    const url = `/bookmark/${addOrDelete}`;
    xhrReq(action, url, data, successCB);
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
