import serialize from "./utils/serialize.js";

const reviewEntries = {
    init(args = {}) {
        console.log("init works");
        const approveEntry = document.querySelectorAll(".entry-approve");
        approveEntry.forEach(el => {
            console.log("clicked");
            el.addEventListener("click", this.entryApproval);
        }
        );
    },
    entryApproval() {
        console.log("masuk entry approval");
        const xhr = new XMLHttpRequest();
        const apiUrl = "/entries/approve-review";    
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
        const requestPayload = "ssss";
        xhr.send(JSON.stringify(requestPayload));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    reviewEntries.init();
});