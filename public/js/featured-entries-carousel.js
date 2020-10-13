import carouselNavigation from "./carousel-navigation.js";

const featuredEntriesCarousel = {
  init() {
    const carouselEls = document.querySelectorAll(
      ".js-featured-entries-carousel"
    );

    if (!carouselEls || carouselEls.length === 0) return null;

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
    entries.forEach(entry => {
      if (entry.photos && entry.photos.length > 0) {
        this.preloadImage(entry.photos[0].url);
      }
    });
    
    const carouselNav = Object.create(carouselNavigation);
    carouselNav.init({ 
      numItems: entries.length, 
      el: carouselEl,
      onChange: index => {
        this.updateEntry(carouselEl, entries[index], index);
      }        
    });

    // update initial entry
    this.updateEntry(carouselEl, entries[0], 1);
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

    if (entry.photos && entry.photos.length > 0) {
      imageEl.style.backgroundImage = `url(${entry.photos[0].url})`;
    }
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
