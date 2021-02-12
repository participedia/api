import tippy from "tippy.js";

const tooltip = {
  init({
    selector,
    content,
    showOnCreate = false,
    allowHTML = false,
    theme = "light",
    offset = [0, 0],
  }) {
    if (!selector) return;

    return tippy(selector, {
      content: content,
      allowHTML: allowHTML,
      showOnCreate: showOnCreate,
      theme: theme,
      offset: offset,
      interactive: true,
      hideOnClick: false,
      trigger: "click",
      placement: 'auto',
    });
  },
};

export default tooltip;
