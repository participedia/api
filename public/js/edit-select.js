import SlimSelect from "slim-select";

const toArray = nodelist => Array.prototype.slice.call(nodelist);

const editSelect = {
  init() {
    const selectEls = toArray(document.querySelectorAll(".js-edit-select"));
    selectEls.forEach(selectEl => {
      // numOptions is 1 less than all options to account for the placeholder option
      const numOptions = selectEl.querySelectorAll("option").length - 1;
      const options = {
        select: `#${selectEl.id}`,
        allowDeselectOption: true,
      };

      // don't show search input if there are 5 or fewer options
      if (numOptions <= 5) {
        options.showSearch = false;
      }

      new SlimSelect(options);
    });
  },
};

export default editSelect;
