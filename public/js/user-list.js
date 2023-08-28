import modal from "./modal.js";

const userList = {
  init(args = {}) {
    const blockUser = document.querySelectorAll(".js-block-user");
    blockUser.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let userId = el.getAttribute("user-id");
        // this.entryRejection(entryId);
      });
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
    userList.init();
});
