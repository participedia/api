const toArray = nodeList => Array.prototype.slice.call(nodeList);

const blogPosts = {
  init(tracking) {
    this.fetch();
    this.tracking = tracking;
  },

  fetch() { 
    const xhr = new XMLHttpRequest();
     xhr.open("GET", "/blog-post", true);
     xhr.onreadystatechange = () => {
      if (xhr.readyState !== xhr.DONE) return;

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        console.log('response ', response);
        this.render(response.blogPosts ?? []);
      }
    };
    xhr.send(null);
  },

  render(posts) {
    const template = document.querySelector("#js-blog-post-card-template")
      .innerHTML;

    const columns = toArray(document.querySelectorAll(".js-blog-post-column"));
    columns.forEach((c, i) => {
      if(posts[i]){
        const columnEl = c.parentElement;
        let postHTML = document.createElement("div");
        postHTML.innerHTML = template;
  
        const imgDivEl = postHTML.querySelector(".js-blog-post-card__image");
        const titleEl = postHTML.querySelector(".js-blog-post-card__title");
        const descriptionEl = postHTML.querySelector(
          ".js-blog-post-card__description"
        );
        const linkEl = postHTML.querySelector(".js-blog-post-card__link");
  
        imgDivEl.style.backgroundImage = `url(${posts[i].imageUrl})`;
        titleEl.innerHTML = posts[i].title;
        titleEl.setAttribute("data-title", posts[i].title);
        titleEl.href = posts[i].url;
        descriptionEl.innerHTML = posts[i].description + "...";
        linkEl.setAttribute("href", posts[i].url);
  
        columnEl.innerHTML = postHTML.innerHTML;
      }
    });

    // Track article clicks
    const titleEls = toArray(document.querySelectorAll(".js-blog-post-card__title"));
    if(titleEls) {
      titleEls.forEach(el => {
        el.addEventListener("click", e => {
          e.preventDefault();
          // let title = el.getAttribute("data-title");
          // this.tracking.sendWithCallback("home.news", "blog_article_click", title, () => {
            window.open(e.target.href);
          // });
        });
      });
    }
  },
};

export default blogPosts;
