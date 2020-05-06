const bannerNotice = {
  init() {
    document.querySelector('.js-banner-notice__close-button').addEventListener("click", e => {
      e.preventDefault();
      // hide banner notice element
      e.target.closest(".js-banner-notice").style.display = "none";
    });
  },
};

export default bannerNotice;
