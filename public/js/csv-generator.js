const csvGenerator = {
	init() {
		const downloadCsvBtnEl = document.querySelector(".js-download-csv-btn");
		if (downloadCsvBtnEl) {
      downloadCsvBtnEl.addEventListener("click", e => {
      	let url = `${window.location.href}&returns=csv`;
      	window.open(url, '_blank');
      });
    }
	}
}

export default csvGenerator;