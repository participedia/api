import modal from "./modal.js";

const userList = {
  init(args = {}) {
    const blockUser = document.querySelectorAll(".js-delete-user");
    blockUser.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let userId = el.getAttribute("user-id");
        this.deleteUser(userId);
      });
    });
  },
  confirmDeleteUser(userId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = "/user/delete-user";
    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 0) {
        // if user is not logged in
        // this.openAuthWarning();
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
          location.reload();
          setTimeout(() => {
            modal.closeModal();
          }, 4000);
        } else {
          setTimeout(() => {
            modal.closeModal();
          }, 4000);
        }
      }
    };
    const requestPayload = { userId: userId };
    xhr.send(JSON.stringify(requestPayload));
  },
  deleteUser(userId) {
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
        this.confirmDeleteUser(userId);
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
