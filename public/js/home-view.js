import map from "./map.js";
import bannerNotice from "./banner-notice.js";
import editSelect from "./edit-select.js";
import blogPosts from "./blog-posts.js";
import featuredEntriesCarousel from "./featured-entries-carousel.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  editSelect.init();
  blogPosts.init();
  featuredEntriesCarousel.init();
  initSearchForm();
  initStatsAnimations();
});

function initStatsAnimations() {
  const statsEls = toArray(document.querySelectorAll(".js-home-hero-stats__stat-number"));
  
  if (!statsEls) return;
  
  function startAnimation(el) {
    const number = parseInt(el.innerHTML, 10);
    
    function tick(el, number) {
      el.innerText = number;
    }

    let i = 0;
    setInterval(() => {
      if (i <= number) {
        tick(el, i);
        i++;
      }
    }, 1);
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
