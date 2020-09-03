document.addEventListener("DOMContentLoaded", () => {
  // if supporters hash is present, open supporters accordion
  // and scroll section into view
  if (location.hash === "#supporters") {
    const supportersSection = document.querySelector(".js-supporters");
    const inputEl = supportersSection.querySelector('.js-accordion input');
    inputEl.checked = true;
    supportersSection.scrollIntoView({
      block: 'center'
    });
  }
});
