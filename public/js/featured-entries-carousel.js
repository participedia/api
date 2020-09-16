const featuredEntriesCarousel = {
  init() {
    const carouselEls = document.querySelectorAll(
      ".js-featured-entries-carousel"
    );

    if (!carouselEls) return null;

    this.i18n = JSON.parse(carouselEls[0].getAttribute("data-phrases"));

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

    // update initial entry
    this.updateEntry(carouselEl, entries[0], 1);

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
    const typeEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__type"
    );
    const viewAllLinkEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__view-all-link"
    );

    const viewEntryText = {
      case: this.i18n.View_Case,
      method: this.i18n.View_Method,
      organization: this.i18n.View_Organization,
      collection: this.i18n.View_Collection,
    };

    const viewAllLink = {
      case: "/search",
      method: "/search",
      organization: "/search",
      collection: "/search?selectedCategory=collections",
    };
  
    imageEl.style.backgroundImage = `url(${entry.photos[0].url})`;
    titleEl.innerText = entry.title;
    descriptionEl.innerText = entry.description;
    entryLinkEl.setAttribute("href", entryUrl(entry));
    viewAllLinkEl.setAttribute("href", viewAllLink[entry.type]);  
    entryLinkEl.innerText = viewEntryText[entry.type] + " ->";
    typeEl.innerText = entry.type;
    carouselEl.setAttribute("data-index", nextIndex);    
  },
};

export default featuredEntriesCarousel;
