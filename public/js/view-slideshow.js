import Flickity from "flickity-as-nav-for";

const viewSlideshow = {
  init() {
    const commonOptions = {
      imagesLoaded: true,
      pageDots: false,
      fullscreen: true,
      lazyLoad: 2,
      wrapAround: true,
      freeScroll: true,
      draggable: false,
    }
    const mainCarousel = new Flickity(".js-carousel-main", commonOptions);
    const navCarousel = new Flickity(".js-carousel-nav", Object.assign(commonOptions, {
      asNavFor: '.js-carousel-main',
    }));
  },
}

export default viewSlideshow;
