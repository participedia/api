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

  renderDotNavigation(carouselEl, entries) {
    //set up dot nav
    const dotNavItemClasses = [
      "featured-entries-carousel__dots-nav-item",
      "js-featured-entries-carousel__dots-nav-item",
    ];
    let dotNavContainerEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__dots-nav"
    );

    // for each entry, render a dotNavItem
    entries.forEach((entry, index) => {
      const dotNavItem = document.createElement("a");
      dotNavItem.setAttribute("href", "#");
      dotNavItem.setAttribute("data-index", index);

      // set first item as index initially
      if (index === 0) {
        dotNavItem.classList.add(
          "featured-entries-carousel__dots-nav-item--current"
        );
      }

      dotNavItemClasses.forEach(c => dotNavItem.classList.add(c));
      dotNavContainerEl.appendChild(dotNavItem);
    });

    // set click handlers
    dotNavContainerEl.addEventListener("click", e => {
      const dotNavEl = e.target;
      if (
        dotNavEl.classList.contains(
          "js-featured-entries-carousel__dots-nav-item"
        )
      ) {
        e.preventDefault();
        // navigate to entry in carousel
        const nextIndex = dotNavEl.getAttribute("data-index");
        this.updateEntry(carouselEl, entries[nextIndex], nextIndex);
        this.updateDotNav(carouselEl, nextIndex);
      }
    });
  },

  updateDotNav(carouselEl, nextIndex) {
    // set current index and current class on next index dot
    const currentClassName =
      "featured-entries-carousel__dots-nav-item--current";
    const dotNavContainerEl = carouselEl.querySelector(
      ".js-featured-entries-carousel__dots-nav"
    );
    const nextIndexDotNavEl = dotNavContainerEl.querySelectorAll(
      ".js-featured-entries-carousel__dots-nav-item"
    )[nextIndex];

    dotNavContainerEl
      .querySelector(`.${currentClassName}`)
      .classList.remove(currentClassName);
    nextIndexDotNavEl.classList.add(currentClassName);
  },

  initCarousel(carouselEl) {
    const entries = JSON.parse(carouselEl.getAttribute("data-entries"));

    // preload entry images
    entries.forEach(entry => {
      if (entry.photos && entry.photos.length > 0) {
        this.preloadImage(entry.photos[0].url);
      }
    });

    // render dots and attach click handlers
    this.renderDotNavigation(carouselEl, entries);

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
      this.updateDotNav(carouselEl, nextIndex);
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
      this.updateDotNav(carouselEl, nextIndex);
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
