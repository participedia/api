import "lazysizes";

const lazyLoadImages = {
  init() {
    document.addEventListener("lazybeforeunveil", e => {
      const bgUrl = e.target.getAttribute("data-bg");
      if (bgUrl) {
        e.target.style.backgroundImage = `url(${bgUrl})`;
      }
    });    
  }
}

export default lazyLoadImages;
