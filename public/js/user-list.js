import modal from "./modal.js";

const userList = {
  init(args = {}) {
    const blockUser = document.querySelectorAll(".js-delete-user");
    blockUser.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let userId = el.getAttribute("user-id");
        this.blockUser(userId);
      });
    });
  },
  blockUser(userId) {
    const content = `
        <h3>Confirm Delete User and Entry</h3>
        <p>Are you sure you would like to delete this user? <br /> Deleting a user will delete that user and permanently delete all of their entries from the database.</p>
        <a href="#" class="button button-red js-block-user-confirm">Delete User</a>
        `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-block-user-confirm").addEventListener("click", () => {
      try {
        modal.closeModal();
        const content = `
            <h3>Deleting User & Entries</h3>
            <p>Please wait. We are deleting the user and delete all user's entries now....</p>
            `;
        modal.updateModalReview(content);
        modal.openModal("review-entry-modal");
        // this.blockEntry(userId);
      } catch (err) {
        console.warn(err);
      }

      setTimeout(() => {
        modal.closeModal();
      }, 4000);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
    userList.init();
});
