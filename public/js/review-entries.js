import modal from "./modal.js";

const reviewEntries = {
  init(args = {}) {
    const approveEntry = document.querySelectorAll(".entry-approve");
    const rejectEntry = document.querySelectorAll(".entry-reject");
    approveEntry.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let entryId = el.getAttribute("entry-id");
        this.entryApproval(entryId);
      });
    });
    rejectEntry.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let entryId = el.getAttribute("entry-id");
        this.entryRejection(entryId);
      });
    });
  },
  entryApproval(entryId) {
    const content = `
        <h3>Approving User & Entries</h3>
        <p>Please wait. We are approving the user and all user's entries now....</p>
        `;
    modal.updateModalReview(content);
    modal.openModal("review-entry-modal");
    const xhr = new XMLHttpRequest();
    const apiUrl = "/entries/approve-entry";
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
    const requestPayload = { entryId: entryId };
    xhr.send(JSON.stringify(requestPayload));
  },
  blockEntry(entryId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = "/entries/reject-entry";
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
    const requestPayload = { entryId: entryId };
    xhr.send(JSON.stringify(requestPayload));
  },
  entryRejection(entryId) {
    const content = `
        <h3>Confirm Block User and Entry</h3>
        <p>Are you sure you would like to block this entry? <br /> Blocking an entry will block that user and permanently delete all of their entries from the database.</p>
        <a href="#" class="button button-red js-block-btn">Block Entry</a>
        `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-block-btn").addEventListener("click", () => {
      try {
        modal.closeModal();
        const content = `
            <h3>Blocking User & Entries</h3>
            <p>Please wait. We are blocking the user and delete all user's entries now....</p>
            `;
        modal.updateModalReview(content);
        modal.openModal("review-entry-modal");
        this.blockEntry(entryId);
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
  reviewEntries.init();
});
