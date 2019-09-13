function serialize(form) {
  // Setup our serialized data
  const serialized = [];

  // Loop through each field in the form
  for (let i = 0; i < form.elements.length; i++) {
    const field = form.elements[i];

    // Don't serialize fields without a name, submits, buttons and reset inputs, and disabled fields
    if (
      !field.name ||
      field.disabled ||
      field.type === "reset" ||
      field.type === "submit" ||
      field.type === "button"
    ) {
      continue;
    } else if (field.classList.contains("js-edit-multi-select")) {
      // don't send field value for fields with .js-edit-multi-select
      // since we use hidden fields to track the values of the selected items,
      // and not the value of the select element
      continue;
    } else if (field.name.indexOf("temporary-") === 0) {
      // don't send temporary fields to server
      continue;
    } else if (field.type === "select-multiple") {
      // If a multi-select, get all selections
      for (var n = 0; n < field.options.length; n++) {
        if (!field.options[n].selected) continue;
        serialized.push(
          encodeURIComponent(field.name) +
            "=" +
            encodeURIComponent(field.options[n].value)
        );
      }
    } else if (field.type === "checkbox") {
      serialized.push(
        encodeURIComponent(field.name) + "=" + encodeURIComponent(field.checked)
      );
    } else if (["ongoing", "staff", "volunteers"].includes(field.name)) {
      if (field.value === "yes") {
        serialized.push(encodeURIComponent(field.name) + "=true");
      } else if (field.value === "no"){
        serialized.push(encodeURIComponent(field.name) + "=false");
      }
    } else if (field.getAttribute("data-field-type") === "richtext") {
      // convert rich text fields
      const richtextValue = form.querySelector(
        `[data-name=richtext-${field.name}] [contenteditable="true"]`
      ).innerHTML;
      serialized.push(
        encodeURIComponent(field.name) + "=" + encodeURIComponent(richtextValue)
      );
    } else if (field.type !== "checkbox" && field.type !== "radio") {
      serialized.push(
        encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value)
      );
    }
  }

  return serialized.join("&");
}

export default serialize;
