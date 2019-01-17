const accordion = {
  init() {
    const accordionEls = document.querySelectorAll("[data-accordion]");
    accordionEls.forEach(el => {
      el.querySelector("button").addEventListener("click", e => {
        // toggle state on button click
        const accordionEl = e.target.closest("[data-accordion]");
        const state = accordionEl.getAttribute("data-accordion");
        if (state === "open") {
          accordionEl.setAttribute("data-accordion", "closed")
        } else {
          accordionEl.setAttribute("data-accordion", "open")
        }
      });
    });
  }
}

export default accordion;
