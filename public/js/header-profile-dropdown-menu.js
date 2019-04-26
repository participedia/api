const headerProfileDropdownMenu = {
  init() {
    const containerEl = document.querySelector(".js-profile-dropdown-button-container");

    if (!containerEl) return;

    containerEl.addEventListener("click", e => {
      const button = e.target.closest(".js-profile-dropdown-button-trigger");
      if (button) {
        const isOpen = containerEl.getAttribute("state") === "open";
        const itemsContainerEl = containerEl.querySelector(".js-profile-dropdown-button-items");
        if (isOpen) {
          // close items
          itemsContainerEl.style.display = "none";
          containerEl.setAttribute("state", "closed");
        } else {
          // open items
          itemsContainerEl.style.display = "flex";
          containerEl.setAttribute("state", "open");
        }
      }
    });
  },
};

export default headerProfileDropdownMenu;
