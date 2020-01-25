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
    const successCB = request => {
      linkEl.setAttribute("data-bookmarked", !isBookmarked);
    };
    const errorCB = request => {
      if (request.status === 401) {
        // if unauthorized error, redirect to login
        location.href = `${location.origin}/login`;
      } else {
        alert("Sorry, something went wrong.");
      }
    };
    const data = JSON.stringify({ thingid, bookmarkType });
    const url = `/bookmark/${addOrDelete}`;
    xhrReq(action, url, data, successCB, errorCB);
  },

  handleLinkClick(e) {
    e.preventDefault();

    const linkEl = e.target.closest("a");
    const isBookmarked = linkEl.getAttribute("data-bookmarked") === "true";
    const bookmarkType = linkEl.getAttribute("data-type");
    const thingid = linkEl.getAttribute("data-thing-id");

    if (isBookmarked) {
      this.toggleBookmark(
        "delete",
        linkEl,
        isBookmarked,
        thingid,
        bookmarkType
      );
    } else {
      this.toggleBookmark("add", linkEl, isBookmarked, thingid, bookmarkType);
    }
  },
};

export default bookmarkButtons;
