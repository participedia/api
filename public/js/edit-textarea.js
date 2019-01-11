const editTextarea = {
  init() {
    // get all textarea elements with a maxlength attr
    const textAreaEls = document.querySelectorAll("textarea[maxlength]");

    if (textAreaEls.length < 1) return;

    textAreaEls.forEach(el => {
      const limit = el.getAttribute("maxlength");

      // create and insert counter element
      const counterEl = document.createElement("div");
      counterEl.innerText = `0/${limit}`;
      counterEl.className = "textarea-counter";
      el.insertAdjacentElement("afterend", counterEl);

      // update count on every character change
      el.addEventListener("keyup", e => {
        counterEl.innerText = `${e.target.value.length}/${limit}`;
      });
    });
  }
}

export default editTextarea;
