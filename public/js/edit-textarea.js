const editTextarea = {
  init() {
    // get all textarea elements with a maxlength attr
    const textAreaEls = document.querySelectorAll("textarea[data-max-length]");

    if (textAreaEls.length < 1) return;

    textAreaEls.forEach(el => {
      const limit = el.getAttribute("data-max-length");

      // create and insert counter element
      const counterEl = document.createElement("div");
      counterEl.innerText = `${el.innerHTML.length}/${limit}`;
      counterEl.className = "textarea-counter";
      el.insertAdjacentElement("afterend", counterEl);

      // update count on every character change
      el.addEventListener("keyup", e => {
        const count = e.target.value.length;
        counterEl.innerText = `${count}/${limit}`;
        if (count > limit) {
          counterEl.classList.add("textarea-counter-over-limit");
        } else {
          counterEl.classList.remove("textarea-counter-over-limit");
        }
      });
    });
  },
};

export default editTextarea;
