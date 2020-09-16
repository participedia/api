const featuredEntriesCarousel = {
  init() {
    const carouselEls = document.querySelectorAll(
      ".js-featured-entries-carousel"
    );
    for (let index = 0; index < carouselEls.length; index++) {
      this.initCarousel(carouselEls[index]);
    }
  },

  preloadImage(url) {
    const img = new Image();
    img.src = url;
  },

  initCarousel(carouselEl) {
    const entries = JSON.parse(carouselEl.getAttribute("data-entries"));
    
    // preload entry images
    entries.forEach(entry => this.preloadImage(entry.photos[0].url));

    const leftArrow = carouselEl.querySelector(
      ".js-featured-entries-carousel__navigation-left-arrow"
    );
    const rightArrow = carouselEl.querySelector(
      ".js-featured-entries-carousel__navigation-right-arrow"
    );

    leftArrow.addEventListener("click", e => {
      e.preventDefault();
      const currentIndex = parseInt(carouselEl.getAttribute("data-index"), 10);
      let nextIndex = null;
      if (currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else {
        nextIndex = entries.length - 1;
      }
      this.updateEntry(carouselEl, entries[nextIndex], nextIndex);
    });
    rightArrow.addEventListener("click", e => {
      e.preventDefault();
      const currentIndex = parseInt(carouselEl.getAttribute("data-index"), 10);
      let nextIndex = null;
      if (currentIndex < entries.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        nextIndex = 0;
      }
      this.updateEntry(carouselEl, entries[nextIndex], nextIndex);
    });
  },

  updateEntry(carouselEl, entry, nextIndex) {
    const entryContentEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__entry-content"
    );

    const entryUrl = entry => `/${entry.type}/${entry.id}`;

    const imageEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__image"
    );
    const titleEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__title"
    );
    const descriptionEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__description"
    );
    const entryLinkEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__view-entry-link"
    );
  
    imageEl.style.backgroundImage = `url(${entry.photos[0].url})`;
    titleEl.innerText = entry.title;
    descriptionEl.innerText = entry.description;
    entryLinkEl.setAttribute("href", entryUrl(entry));
    carouselEl.setAttribute("data-index", nextIndex);    
  },
};

export default featuredEntriesCarousel;
