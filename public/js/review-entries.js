import serialize from "./utils/serialize.js";

const reviewEntries = {
    init(args = {}) {
        console.log("init works");
        const approveEntry = document.querySelectorAll(".entry-approve");
        const rejectEntry = document.querySelectorAll(".entry-reject");
        approveEntry.forEach(el => {
            console.log("clicked");
            el.addEventListener("click", this.entryApproval);
        });
        rejectEntry.forEach(el => {
            console.log("clicked");
            el.addEventListener("click", this.entryRejection);
        });
    },
    entryApproval(e) {
        console.log("masuk entry approval");
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
                console.log("OK");
                } else {
                    console.log("Not OK");
                }
            }
        };
        const requestPayload = {aaa: "ssss", bbbb: "cccc" };
        xhr.send(JSON.stringify(requestPayload));
    },
    entryRejection(e) {
        console.log("masuk entry rejection");
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
                console.log("OK");
                } else {
                    console.log("Not OK");
                }
            }
        };
        const requestPayload = {aaa: "ssss", bbbb: "cccc" };
        xhr.send(JSON.stringify(requestPayload));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    reviewEntries.init();
});