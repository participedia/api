import carouselNavigation from "./carousel-navigation.js";

const homeHero = {
  init() {
    this.heroEl = document.querySelector(".js-home-hero");
    this.heroFeatures = JSON.parse(this.heroEl.getAttribute("data-hero-features"));
    this.heroOverlayEl = document.querySelector(".js-home-hero-overlay");
    this.heroImageEl = document.querySelector(".js-home-hero-image");
    this.headerEl = document.querySelector(".js-header");
    this.heroEntryLinkEl = document.querySelector(".js-home-hero-image-credit__entry-link"); 
    this.heroCreditEl = document.querySelector(".js-home-hero-image-credit"); 
    this.heroCountryEl = document.querySelector(".js-home-hero-image-credit__country"); 
    this.heroCreditTextEl = document.querySelector(".js-home-hero-image-credit__credit"); 
    
    this.currentIndex = 0;

    window.addEventListener("resize", () => this.adjustHeight());
    
    this.adjustHeight();
    this.preloadImages();
    this.initSlideshow();
  },

  preloadImages() {
    this.heroFeatures.forEach(entry => {
      const img = new Image();
      img.src = entry.imageUrl;
    });
  },

  initSlideshow() {
    const slideshowId = setInterval(() => {
      this.incrementCurrentIndex();
      carouselNavigation.updateCurrentIndex(this.currentIndex);
      this.updateHero(this.currentIndex);
    }, 9000);
    
    const carouselNav = Object.create(carouselNavigation);
    carouselNav.init({ 
      numItems: this.heroFeatures.length, 
      shouldShowArrows: false,
      el: this.heroEl,
      onChange: index => {
        if (slideshowId) {
          clearInterval(slideshowId);
        }
        this.updateHero(index);
      }        
    });
  },

  incrementCurrentIndex() {
    if (this.currentIndex === this.heroFeatures.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = this.currentIndex + 1;
    }
  },

  updateHero(index) {
    this.currentIndex = index;
    // set opacity for transition
    this.heroOverlayEl.style.opacity = 1;
    this.heroCreditEl.style.opacity = 0;
    const newEntry = this.heroFeatures[index];

    setTimeout(() => {
      // update image
      this.heroImageEl.style.backgroundImage = `url(${newEntry.imageUrl})`;
      // update title
      this.heroEntryLinkEl.innerText = newEntry.entryTitle;
      // update credit
      if (newEntry.imageCredit) {
        this.heroCreditTextEl.innerText = `Image Credit: ${newEntry.imageCredit}`;
      } else {
        this.heroCreditTextEl.innerText = "";
      }
      
      // update country
      if (newEntry.country) {
        this.heroCountryEl.innerText = newEntry.country;
      } else {
        this.heroCountryEl.innerText = "";
      }
      
      // update link
      this.heroEntryLinkEl.setAttribute("href", newEntry.entryUrl)
      // fade opacity back up to initial
      this.heroOverlayEl.style.opacity = 0.5;
      this.heroCreditEl.style.opacity = 1;
    }, 250);
  },

  adjustHeight () {
    // hero image should be the 
    // height of the browser window - the height of the header
    const height = window.innerHeight - this.headerEl.offsetHeight;
    this.heroEl.style.height = `${height}px`;
    this.heroOverlayEl.style.height = `${height}px`;
    this.heroImageEl.style.height = `${height}px`;
  }
  
}

export default homeHero;
