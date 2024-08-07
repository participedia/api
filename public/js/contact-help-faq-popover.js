const contactHelpFaqPopover = {
  init(tracking) {
    this.tracking = tracking;
    const helpLinkEls = document.querySelectorAll("a[href='/help']");
    this.contactHelpFaqPopoverEl = document.querySelector(
      ".js-contact-help-faq-popover"
    );
    const faqListEl = this.contactHelpFaqPopoverEl.querySelector(".js-faq-list");
    const faqLinks = faqListEl.querySelectorAll("a");

    this.contentAreaEl = this.contactHelpFaqPopoverEl.querySelector(
      ".js-content-area"
    );

    this.initialContent = this.contentAreaEl.innerHTML;

    // delegate event listeners
    this.contactHelpFaqPopoverEl.addEventListener("click", e => {
      // close widget
      if (e.target.closest(".js-close")) {
        e.preventDefault();
        this.backToList();
        this.contactHelpFaqPopoverEl.style = "display: none;";
      }

      // return to list of questions
      if (e.target.closest(".js-back")) {
        e.preventDefault();
        this.backToList();
      }

      // question link click
      if (e.target.closest(".js-faq-question")) {
        e.preventDefault();
        this.insertAnswer(e);
      }
    });

    // event listener to open widget, attach to all help links
    for (let i = 0; i < helpLinkEls.length; i++) {
      helpLinkEls[i].addEventListener("click", e => {
        e.preventDefault();
        this.tracking.send("help", "help_contact_click", e.target.getAttribute("data-location"));
        this.contactHelpFaqPopoverEl.style = "display: block;";
      });
    }
  },

  backToList() {
    // insert initial content back into content areas
    this.contactHelpFaqPopoverEl.setAttribute("data-view", "list");
    this.contentAreaEl.innerHTML = this.initialContent;
    this.contentAreaEl.scrollTop = 0;
  },

  insertAnswer(e) {
    const question = e.target.innerText;
    const answer = e.target.closest("li").querySelector(".js-faq-answer")
      .innerHTML;
    const content = `
      <div class="faq-answer-content">
        <h3>${question}</h3>
        ${answer}
      </div>
    `;
    this.contactHelpFaqPopoverEl.setAttribute("data-view", "answer");
    this.contentAreaEl.innerHTML = content;
    this.contentAreaEl.scrollTop = 0;
  },
};

export default contactHelpFaqPopover;
