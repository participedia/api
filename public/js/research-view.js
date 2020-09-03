function openAllAccordionsOnPage() {
  const accordionInputs = Array.prototype.slice.call(
    document.querySelectorAll(".js-accordion input")
  );
  accordionInputs.forEach(input => (input.checked = true));
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerHeight > 600) {
    // open all accordion on page load if it's not a mobile/small screen
    openAllAccordionsOnPage();
  }

  if (location.hash === "#data-dl") {
    document.querySelector(".js-data-dl").scrollIntoView({
      block: "start",
    });
  }
});
