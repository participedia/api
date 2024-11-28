import SlimSelect from "slim-select";

const toArray = nodelist => Array.prototype.slice.call(nodelist);

const editSelect = {
  init() {
    const selectEls = toArray(document.querySelectorAll(".js-edit-select"));
    selectEls.forEach(selectEl => {

      if(selectEl.id) {
        // numOptions is 1 less than all options to account for the placeholder option
        const numOptions = selectEl.querySelectorAll("option").length - 1;
        // don't show search input if there are 5 or fewer options
        const showSearch = (numOptions > 5) ? true : false;

        const options = {
          select: `#${selectEl.id}`,
          settings: {
            showSearch: showSearch,
            allowDeselect: true,
            placeholderText: '',
          },
        };

        new SlimSelect(options);
      }
    });
  },
};

export default editSelect;