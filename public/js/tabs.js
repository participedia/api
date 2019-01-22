// forked from https://github.com/github/tab-container-element/blob/master/index.js

function nodeListToArray(arr) {
  return Array.prototype.slice.call(arr);
}

const tabs = {
  init() {
    const tabContainerNodeList = document.querySelectorAll(".js-tab-container");
    const tabContainerEls = nodeListToArray(tabContainerNodeList);
    // bind event listeners for each tab container
    tabContainerEls.forEach(el => {
      el.addEventListener("keydown", e => this.handleKeyDown(e, el));
      el.addEventListener("click", e => this.handleClick(e, el));
    });
  },

  handleKeyDown(event, tabContainer) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;

    if (target.getAttribute("role") !== "tab" &&
        !target.closest("[role='tablist']")) {
      return;
    }

    const tabsNodeList = tabContainer.querySelectorAll('[role="tablist"] [role="tab"]');
    const tabs = nodeListToArray(tabsNodeList);

    const currentIndex = tabs.indexOf(
      tabs.find(tab => tab.matches('[aria-selected="true"]'))
    );

    if (event.code === "ArrowRight") {
      let index = currentIndex + 1;
      if (index >= tabs.length) index = 0;
      this.selectTab(index, tabContainer);
    } else if (event.code === "ArrowLeft") {
      let index = currentIndex - 1;
      if (index < 0) index = tabs.length - 1;
      this.selectTab(index, tabContainer);
    } else if (event.code === "Home") {
      this.selectTab(0, tabContainer);
      event.preventDefault();
    } else if (event.code === "End") {
      this.selectTab(tabs.length - 1, tabContainer);
      event.preventDefault();
    }
  },

  handleClick(event, tabContainer) {
    const target = event.target;
    if (!(event.target instanceof Element)) return;

    const tabButton = target.closest('[role="tab"]');
    const tabPanel = tabButton.closest('[role="tablist"]');
    if (!tabButton || !tabPanel) return;

    const tabsNodeList = tabPanel.querySelectorAll('[role="tab"]');
    const tabs = nodeListToArray(tabsNodeList);

    const index = tabs.indexOf(tabButton);

    this.selectTab(index, tabContainer);
  },

  selectTab(index, tabContainer) {
    const tabs = nodeListToArray(tabContainer.querySelectorAll('[role="tab"]'));
    const panels = nodeListToArray(tabContainer.querySelectorAll('[role="tabpanel"]'));

    tabs.forEach(tab => {
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
    });
    panels.forEach(panel => {
      panel.hidden = true;
      panel.setAttribute("tabindex", "0");
    });

    const tab = tabs[index];
    const panel = panels[index];

    tab.setAttribute("aria-selected", "true");
    tab.removeAttribute("tabindex");
    tab.focus();
    panel.hidden = false;
  },
};

export default tabs;
