const dropdownButton = {
  init() {
    const containerEl = document.querySelector(".js-dropdown-button-container");

    if (!containerEl) return;

    containerEl.addEventListener("click", e => {
      const button = e.target.closest(".js-dropdown-button-trigger");
      if (button) {
        const isOpen = containerEl.getAttribute("state") === "open";
        const itemsContainerEl = containerEl.querySelector(
          ".js-dropdown-button-items"
        );
        const svgEl = button.querySelector("svg");
        if (isOpen) {
          // close items
          itemsContainerEl.style.opacity = 0;
          itemsContainerEl.style.zIndex = -10;
          svgEl.style.transform = "rotate(0)";
          containerEl.setAttribute("state", "closed");
        } else {
          // open items
          itemsContainerEl.style.opacity = 1;
          itemsContainerEl.style.zIndex = 10;
          svgEl.style.transform = "rotate(180deg)";
          containerEl.setAttribute("state", "open");
        }
      }
    });
  },
};

export default dropdownButton;
