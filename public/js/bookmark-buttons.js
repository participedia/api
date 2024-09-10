import { xhrReq } from "./utils/utils.js";
import copy from 'copy-to-clipboard';

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

    // copy click action
    const copyButtons = Array.prototype.slice.call(
      document.querySelectorAll(".js-copy-button")
    );

    if (copyButtons.length < 1) return;

    copyButtons.forEach(copyButtonEl => {
      copyButtonEl.addEventListener("click", e => {
        e.preventDefault();
        this.handleCopyClick(e);
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


  handleCopyClick(e) {
    e.preventDefault();
    const linkEl = e.target.closest("a");
    const copyType = linkEl.getAttribute("data-type");
    const thingid = linkEl.getAttribute("data-thing-id");
    const host = window.location.host;
    const path = `https://${host}/${copyType}/${thingid}`;
    copy(path);
    Toastify({
      text: "Link copied to clipboard!",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#2f3e46",
      },
    }).showToast();

  },
};

export default bookmarkButtons;
