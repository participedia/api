import map from "./map.js";
import bannerNotice from "./banner-notice.js";
import editSelect from "./edit-select.js";
import blogPosts from "./blog-posts.js";
import featuredEntriesCarousel from "./featured-entries-carousel.js";
import homeHero from "./home-hero.js";
import easingFunctions from "./utils/easing-functions.js";
import { CountUp } from "countup.js";
import tracking from "./utils/tracking.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  editSelect.init();
  blogPosts.init();
  featuredEntriesCarousel.init();
  homeHero.init();
  initSearchForm();
  initStatsAnimations();
  initTracking();
});

function initTracking() {
  const statsLinkEls = toArray(document.querySelectorAll(".js-stats-link"));
  const browseAllLinkEl = document.querySelector(".js-home-hero-browse-all-link");
  const heroCurrentSlide = document.querySelector(".js-home-hero-image-credit__entry-link");
  
  if (statsLinkEls) {
    statsLinkEls.forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        let type = el.getAttribute("data-stats-tracking-name");
        tracking.sendWithCallback("home.hero", "stat_click", type, () => {
          location.href = el.getAttribute("href");
        });
      });
    });
  }

  if(browseAllLinkEl) {
    browseAllLinkEl.addEventListener("click", e => {
      e.preventDefault();
      console.log(e.target.href);
      tracking.sendWithCallback("home.hero", "browse_all_entries_click", "", () => {
        location.href = e.target.href;
      });
    });
  }

  if(heroCurrentSlide) {
    heroCurrentSlide.addEventListener("click", e => {
      e.preventDefault();
      const link = e.target.href;
      const id = parseInt(link.substring(link.lastIndexOf('/') + 1));

      if(!Number.isInteger(id)) return;

      tracking.sendWithCallback("home.hero", "hero_entry_title_click", id, () => {
        location.href = e.target.href;
      });
    });
  }
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
    if(query) {
      tracking.send("home.hero", "search_submit", query);
    }

    location.href = searchUrl;
  });
}
