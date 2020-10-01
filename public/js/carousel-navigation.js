const carouselNavigation = {
  init({ numItems, el, shouldShowArrows=true, onChange = index => {}}) {
    this.items = Array.from({ length: numItems });
    this.el = el;
    this.shouldShowArrows = shouldShowArrows;
    this.dotNavContainerEl = this.el.querySelector(".js-carousel-navigation__dots-nav");
    this.onChange = onChange;
    this.currentIndex = 0;

    this.render();
  },

  render(){
    this.initDotNav();
    this.initArrowNav()
  },

  updateCurrentIndex(index) {
    this.currentIndex = index;
    this.updateDotNav();
  },

  initArrowNav() {
    const leftArrow = this.el.querySelector(
      ".js-carousel-navigation__left-arrow"
    );
    const rightArrow = this.el.querySelector(
      ".js-carousel-navigation__right-arrow"
    );

    if (this.shouldShowArrows) {
      leftArrow.addEventListener("click", e => {
        e.preventDefault();
        this.onArrowClick('previous');
      });
      rightArrow.addEventListener("click", e => {
        e.preventDefault();
        this.onArrowClick('next');
      });
    } else {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
    }
  },

  onArrowClick(direction) {
    // update current index
    if (direction === 'next') {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex = this.currentIndex + 1;
      } else {
        this.currentIndex = 0;
      }
    } else if (direction === 'previous') {
      if (this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
      } else {
        this.currentIndex = this.items.length - 1;
      }
    }
    // onchange callback
    this.onChange(this.currentIndex);
    this.updateDotNav();
  },

  initDotNav() {
    //set up dot nav
    const dotNavItemClasses = [
      "carousel-navigation__dots-nav-item",
      "js-carousel-navigation__dots-nav-item",
    ];
    const dotNavItemCurrentClass = "carousel-navigation__dots-nav-item--current";
    // for each entry, render a dotNavItem
    this.items.forEach((item, index) => {
      const dotNavItem = document.createElement("a");
      dotNavItem.setAttribute("href", "#");
      dotNavItem.setAttribute("data-index", index);
      // set current class
      if (index === this.currentIndex) {
        dotNavItem.classList.add(dotNavItemCurrentClass);
      }

      dotNavItem.addEventListener("click", e => {
        e.preventDefault();
        this.onDotClick(index);
      });

      dotNavItemClasses.forEach(c => dotNavItem.classList.add(c));
      this.dotNavContainerEl.appendChild(dotNavItem);
    });
  },

  onDotClick(index) {
    // update index
    this.currentIndex = index;
    // on change callback
    this.onChange(index);
    this.updateDotNav();
  },

  updateDotNav() {
    // set current class for current index
    const currentClassName ="carousel-navigation__dots-nav-item--current";
    const nextIndexDotNavEl = this.dotNavContainerEl.querySelectorAll(
      ".js-carousel-navigation__dots-nav-item"
    )[this.currentIndex];

    this.dotNavContainerEl
      .querySelector(`.${currentClassName}`)
      .classList.remove(currentClassName);
    nextIndexDotNavEl.classList.add(currentClassName);
  },
}

export default carouselNavigation;