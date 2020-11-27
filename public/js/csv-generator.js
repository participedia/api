const csvGenerator = {
	init() {
		const downloadCsvBtnEl = document.querySelector(".js-download-csv-btn");
		if (downloadCsvBtnEl) {
      downloadCsvBtnEl.addEventListener("click", e => {
      	window.open(window.location.href, '_blank');
      });
    }
	}
}

export default csvGenerator;