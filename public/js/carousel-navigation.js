var getParents = function (elem) {

	// Set up a parent array
	var parents = [];

	// Push each parent element to the array
	for ( ; elem && elem !== document; elem = elem.parentNode ) {
		parents.push(elem);
	}

	// Return our parent array
	return parents;

};

const carouselNavigation = {
  init({ numItems, el, onChange = index => {}}) {
    this.items = Array.from({ length: numItems });
    this.el = el;
    this.dotNavContainerEl = this.el.querySelector(".js-carousel-navigation__dots-nav");
    this.onChange = onChange;
    this.currentIndex = 0;

    this.render();
  },

  render(){
    this.initDotNav();
    this.initArrows()
  },

  initArrows() {
    const leftArrow = this.el.querySelector(
      ".js-carousel-navigation__left-arrow"
    );
    const rightArrow = this.el.querySelector(
      ".js-carousel-navigation__right-arrow"
    );

    leftArrow.addEventListener("click", e => {
      e.preventDefault();
      this.onArrowClick('previous');
      this.onChange(this.currentIndex);
      this.updateDotNav();
    });
    rightArrow.addEventListener("click", e => {
      e.preventDefault();
      this.onArrowClick('next');
      this.onChange(this.currentIndex);
      this.updateDotNav();
    });
  },

  onArrowClick(direction) {
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
  },

  initDotNav() {
    //set up dot nav
    const dotNavItemClasses = [
      "carousel-navigation__dots-nav-item",
      "js-carousel-navigation__dots-nav-item",
    ];
    const dotNavItemCurrentClass = "carousel-navigation__dots-nav-item--current";
    console.log("this.dotNavContainerEl.classList", this.dotNavContainerEl.classList)
    // for each entry, render a dotNavItem
    console.log("this.items.length", this.items.length)
    this.items.forEach((item, index) => {
      const dotNavItem = document.createElement("a");
      dotNavItem.setAttribute("href", "#");
      dotNavItem.setAttribute("data-index", index);
      // set current class
      if (index === this.currentIndex) {
        dotNavItem.classList.add(dotNavItemCurrentClass);
      }

      dotNavItemClasses.forEach(c => dotNavItem.classList.add(c));
      this.dotNavContainerEl.appendChild(dotNavItem);
    });
    console.log("this.dotNavContainerEl.parentNode", this.dotNavContainerEl.parentNode)

    // set click handlers
    this.el.addEventListener("click", e => {
      const dotNavEl = e.target;
      if (
        dotNavEl.classList.contains("js-carousel-navigation__dots-nav-item")
      ) {
        console.log("e", e)
        console.log("getParents(dotNavEl)", getParents(dotNavEl))
        e.preventDefault();
        // update index
        this.currentIndex = parseInt(dotNavEl.getAttribute("data-index"), 10);
        console.log("on click this.currentIndex", this.currentIndex)
        // on change callback
        this.onChange(this.currentIndex);
        this.updateDotNav();
      }
    });
  },

  updateDotNav() {
    // set current class for current index
    const currentClassName ="carousel-navigation__dots-nav-item--current";
    console.log("this.dotNavContainerEl", this.dotNavContainerEl)
    console.log("updateDotNav this.currentIndex", this.currentIndex)
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