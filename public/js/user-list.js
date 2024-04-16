import modal from "./modal.js";

const userList = {
  init(args = {}) {
    const blockUser = document.querySelectorAll(".js-delete-user");
    blockUser.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let userId = el.getAttribute("user-id");
        let userEmail = el.getAttribute("user-email");
        this.deleteUser(userId, userEmail);
      });
    });
    const blockSelectedUsers = document.querySelectorAll(".js-users-delete-all");
    blockSelectedUsers.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const userList = this.getSelectedUsers();
        if(Array.isArray(userList) && userList.length){
          this.deleteMultipleUser(userList)
        }
      });
    });
    this.listItemUser = document.querySelector(".js-users-block-all");
    this.checkboxEls = this.listItemUser.querySelectorAll(".js-keys-list-item-users input[type=checkbox]");

  },
  confirmDeleteUser(userId, userEmail) {
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
        Toastify({
            text: "User " + userEmail + " has been deleted.",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#2f3e46",
            },
          }).showToast();
          setTimeout(() => {
            location.reload();
          }, 2000);
          setTimeout(() => {
            modal.closeModal();
          }, 6000);
        } else {
          setTimeout(() => {
            modal.closeModal();
          }, 4000);
        }
      }
    };
    const requestPayload = { userId: userId, userEmail: userEmail};
    xhr.send(JSON.stringify(requestPayload));
  },
  deleteUser(userId, userEmail) {
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
        this.confirmDeleteUser(userId, userEmail);
      } catch (err) {
        console.warn(err);
      }

      setTimeout(() => {
        modal.closeModal();
      }, 4000);
    });
  },

  confirmMultipleDeleteUser(userList) {
    console.log("&&&&&&&&&&&&&&&& userList ", userList);
    const xhr = new XMLHttpRequest();
    const apiUrl = "/user/delete-users";
    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 0) {
        // if user is not logged in
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
        Toastify({
            text: "Users have been deleted.",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#2f3e46",
            },
          }).showToast();
          setTimeout(() => {
            // location.reload();
          }, 2000);
          setTimeout(() => {
            modal.closeModal();
          }, 6000);
        } else {
          setTimeout(() => {
            modal.closeModal();
          }, 4000);
        }
      }
    };
    const requestPayload = { authors: userList };
    xhr.send(JSON.stringify(requestPayload));
  },

  deleteMultipleUser(userList) {
    const content = `
        <h3>Confirm Delete Users</h3>
        <p>Are you sure you would like to delete these users? <br /> Deleting a user will delete that user and permanently delete all of their entries from the database.</p>
        <a href="#" class="button button-red js-block-user-confirm">Delete Users</a>
        `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-block-user-confirm").addEventListener("click", () => {
      try {
        modal.closeModal();
        const content = `
            <h3>Deleting Users & Entries</h3>
            <p>Please wait. We are deleting the user and delete all user's entries now....</p>
            `;
        modal.updateModalReview(content);
        modal.openModal("review-entry-modal");
        this.confirmMultipleDeleteUser(userList);
      } catch (err) {
        console.warn(err);
      }

      setTimeout(() => {
        modal.closeModal();
      }, 4000);
    });
  },

  getSelectedUsers() {
    let selectedUsers = [];
    this.checkboxEls.forEach(el => {
      if (el.checked) {
        let userId = el.getAttribute("user-id");
        let email = el.getAttribute("user-email");
        selectedUsers.push({userId: userId, email: email})
      }
    });

    return selectedUsers;
  },

};

document.addEventListener("DOMContentLoaded", () => {
    userList.init();
});
