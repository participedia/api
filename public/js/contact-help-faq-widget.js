const contactHelpFaqWidget = {
  init() {
    const helpLinkEl = document.querySelector("a[href='/help']");
    const contactHelpFaqWidgetEl = document.querySelector(".js-contact-help-faq-container");
    const faqListEl = contactHelpFaqWidgetEl.querySelector(".js-faq-list");
    const faqLinks = faqListEl.querySelectorAll("a");

    this.contentAreaEl = contactHelpFaqWidgetEl.querySelector(".js-content-area");

    this.initialContent = this.contentAreaEl.innerHTML;

    // delegate event listeners
    contactHelpFaqWidgetEl.addEventListener("click", (e) => {
      // close widget
      if (e.target.closest(".js-close")) {
        e.preventDefault();
        this.backToList();
        contactHelpFaqWidgetEl.style = "display: none;";
      }

      // return to list of questions
      if (e.target.closest(".js-back")) {
        e.preventDefault();
        this.backToList();
      }

      // question link click
      if (e.target.closest("a") && !e.target.closest("a").classList.contains("js-mail-link")) {
        e.preventDefault();
        this.insertAnswer(e);
      }
    });

    // event listener to open widget
    helpLinkEl.addEventListener("click", (e) => {
      e.preventDefault();
      contactHelpFaqWidgetEl.style = "display: block;";
    });
  },

  backToList() {
    // insert initial content back into content areas
    this.contentAreaEl.innerHTML = this.initialContent;
    this.contentAreaEl.scrollTop = 0;
  },

  insertAnswer(e) {
    const question = e.target.innerText;
    const answer = e.target.closest("li").querySelector(".js-faq-answer").innerHTML;
    const content = `
      <div class="faq-answer-content">
        <h3>${question}</h3>
        ${answer}
      </div>
    `;
    this.contentAreaEl.innerHTML = content;
    this.contentAreaEl.scrollTop = 0;
  }
}

export default contactHelpFaqWidget;
