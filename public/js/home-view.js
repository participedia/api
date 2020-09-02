import map from "./map.js";
import bannerNotice from "./banner-notice.js";
import editSelect from "./edit-select.js";

const toArray = nodeList => Array.prototype.slice.call(nodeList);

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
      console.log("response");
      console.log(response);
      renderBlogPosts(response.blogPosts);
    }
  };
  xhr.send();
}

function renderBlogPosts(posts) {
  const template = document.querySelector("#js-blog-post-card-template")
    .innerHTML;
  const columns = toArray(document.querySelectorAll(".js-blog-post-column"));
  columns.forEach((c, i) => {
    const columnEl = c.parentElement;
    let postHTML = document.createElement("div");
    postHTML.innerHTML = template;
    
    const imgDivEl = postHTML.querySelector(".js-blog-post-card__image");
    const titleEl = postHTML.querySelector(".js-blog-post-card__title");
    const bylineEl = postHTML.querySelector(".js-blog-post-card__byline");
    const dscrptnEl = postHTML.querySelector(".js-blog-post-card__description");
    const linkEl = postHTML.querySelector(".js-blog-post-card__link");

    imgDivEl.style.backgroundImage = `url(${posts[i].imageUrl})`;
    titleEl.innerHTML = posts[i].title;
    bylineEl.innerHTML = posts[i].author;
    dscrptnEl.innerHTML = posts[i].description;
    linkEl.setAttribute("href", posts[i].url);

    columnEl.innerHTML = postHTML.innerHTML;
  });
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
