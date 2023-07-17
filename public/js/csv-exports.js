import modal from "./modal.js";

const csvExport = {
  init(args = {}) {
    const deleteExport = document.querySelectorAll(".delete-export");
    deleteExport.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let entryId = el.getAttribute("entry-id");
        this.deleteCSVExport(entryId);
      });
    });
  },
  deleteCSV(entryId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = "/exports/csv";
    xhr.open("DELETE", apiUrl, true);
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
  deleteCSVExport(entryId) {
    const content = `
        <h3>Confirm Delete CSV File</h3>
        <p>Are you sure you would like to delete this CSV File?
        <a href="#" class="button button-red js-delete-btn">Delete CSV File</a>
        `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-delete-btn").addEventListener("click", () => {
      try {
        modal.closeModal();
        const content = `
            <h3>Deleting CSV File</h3>
            <p>Please wait. We are deleting the CSV File now....</p>
            `;
        modal.updateModalReview(content);
        modal.openModal("review-entry-modal");
        this.deleteCSV(entryId);
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
  csvExport.init();
});
