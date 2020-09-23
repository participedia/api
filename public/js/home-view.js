import map from "./map.js";
import bannerNotice from "./banner-notice.js";
import editSelect from "./edit-select.js";
import blogPosts from "./blog-posts.js";
import featuredEntriesCarousel from "./featured-entries-carousel.js";
import easingFunctions from "./utils/easing-functions.js";
import { CountUp } from "countup.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  editSelect.init();
  blogPosts.init();
  featuredEntriesCarousel.init();
  initSearchForm();
  initStatsAnimations();
  initHeroUI();
});

function initHeroUI () {
  // hero image should be the 
  // height of the browser window - the height of the header
  const heroEl = document.querySelector(".js-home-hero");
  const heroOverlayEl = document.querySelector(".js-home-hero-overlay");
  const heroImageEl = document.querySelector(".js-home-hero-image");
  const headerEl = document.querySelector(".js-header");
  const height = window.innerHeight - headerEl.offsetHeight;
  heroEl.style.height = `${height}px`;
  heroOverlayEl.style.height = `${height}px`;
  heroImageEl.style.height = `${height}px`;
}

function initStatsAnimations() {
  const statsEls = toArray(
    document.querySelectorAll(".js-home-hero-stats__stat-number")
  );

  if (!statsEls) return;

  function startAnimation(el) {
    const number = parseInt(el.innerHTML, 10);
    const countUpOptions = {
      useEasing: true,
      duration: 3,
      useGrouping: false,
      easingFn: easingFunctions.easeOutExpo,
    };
    const countUp = new CountUp(el.id, number, countUpOptions);
    countUp.start();
  }
  statsEls.forEach(el => startAnimation(el));
}

function initSearchForm() {
  const searchFormEl = document.querySelector(".js-home-hero-search__form");
  searchFormEl.addEventListener("submit", e => {
    e.preventDefault();
    const selectEl = searchFormEl.querySelector(
      "#js-home-hero-search__edit-select"
    );
    const category = selectEl.options[selectEl.selectedIndex].value;
    const query = searchFormEl.querySelector(".js-home-hero-search__form-input")
      .value;

    let searchUrl = "/search";
    if (category) {
      searchUrl = `${searchUrl}?selectedCategory=${category}`;
    }
    if (category && query) {
      searchUrl = `${searchUrl}&query=${query}`;
    } else if (query) {
      searchUrl = `${searchUrl}?query=${query}`;
    }

    location.href = searchUrl;
  });
}
