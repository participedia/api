import SlimSelect from "slim-select";

const toArray = nodelist => Array.prototype.slice.call(nodelist);

const editSelect = {
  init() {
    const selectEls = toArray(document.querySelectorAll(".js-edit-select"));
    selectEls.forEach(selectEl => {
      new SlimSelect({
        select: `#${selectEl.id}`,
        allowDeselectOption: true,
      });
    });
  },
}

export default editSelect;
