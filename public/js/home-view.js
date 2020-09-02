import map from "./map.js";
import bannerNotice from "./banner-notice.js";
import editSelect from "./edit-select.js";

document.addEventListener("DOMContentLoaded", () => {
  map.init();
  editSelect.init();
  initSearchForm();
  getBlogPosts();
});

function getBlogPosts() {
  const xhr = new XMLHttpRequest();
    xhr.open("GET", "/blog-post", true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== xhr.DONE) return;

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        console.log("response")
        console.log(response)
      }
    };
    xhr.send();
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
    
    let searchUrl = '/search';
    if (category) {
      searchUrl = `${searchUrl}?selectedCategory=${category}`
    }
    if (category && query) {
      searchUrl = `${searchUrl}&query=${query}`
    } else if (query) {
      searchUrl = `${searchUrl}?query=${query}`
    }
  
    location.href = searchUrl;
  });
}
