import moment from "moment";
import mapStyle from "./map-style.js";
import PopOver from "./GoogleMapsPopOver.js";
import { xhrReq } from "./utils/utils.js";

const markerIcon = {
  path: "M14.1,7.1C14.1,3.2,11,0,7.1,0S0,3.2,0,7.1C0,12.4,7.1,20,7.1,20S14.1,12.4,14.1,7.1z M4.7,7.1 c0-1.3,1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4s-1,2.4-2.4,2.4C5.8,9.4,4.7,8.4,4.7,7.1z",
  fillColor: "#000",
  strokeColor: "#000",
  fillOpacity: 1,
  scale: 1,
  anchor: new google.maps.Point(7, 20),
};

const featuredMarkerIcon = Object.assign({}, markerIcon, {
  fillColor: "#ec2024",
  strokeColor: "#ec2024",
});

const map = {
  init() {
    const mapEl = document.querySelector(".js-map-container");
    const isMethodTab = document.getElementById("method").checked;

    if (!mapEl) return;

    this.map = new google.maps.Map(mapEl, {
      center: { lat: 24.6207595, lng: -40.2706411 },
      zoom: 1.75,
      disableDefaultUI: true,
      zoomControl: false,
      styles: mapStyle,
    });

    this.initZoomControls(this.map);

    if (!isMethodTab) {
      // don't fetch results if we are on the methods tab
      this.fetchMapResults();
    }
  },

  initZoomControls(map) {
    document.querySelector('.js-map-zoom-control-in').addEventListener("click", () => {
      map.setZoom(map.getZoom() + 1);
    });
    document.querySelector('.js-map-zoom-control-out').addEventListener("click", () => {
      map.setZoom(map.getZoom() - 1);
    });
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      document.querySelector('.js-map-controls')
    );
  },

  getQueryParam() {
    if (!window.location.search) return;

    const paramObj = {};
    window.location.search.split("?")[1].split("&").forEach(param => {
     paramObj[param.split("=")[0]] = param.split("=")[1];
    });

    return paramObj.query;
  },

  fetchMapResults() {
    let url = `/?resultType=map`;
    const query = this.getQueryParam();
    if (query) {
      url = `${url}&query=${query}`;
    }

    const successCB = (response) => {
      const results = JSON.parse(response.response).results;
      this.cacheResults(response.responseURL, results);
      this.renderMarkers(results);
    };
    const errorCB = (response) => {
      //console.log("err", response)
    };

    const cachedResults = this.getCachedResults(window.location.origin + url);
    if (cachedResults) {
      // if we have cached results, render the markers with those
      this.renderMarkers(cachedResults);
    } else {
      // if we don't have cached results, make the request
      xhrReq("GET", url, {}, successCB, errorCB);
    }
  },

  cacheResults(key, results) {
    // save to session storage
    const data = {
      updatedAt: Date.now(),
      results: results,
    };
    window.sessionStorage.setItem(key, JSON.stringify(data));
  },

  getCachedResults(key) {
    const CACHE_TIMEOUT = Date.now() - 3600000; // 1 hour
    const data = window.sessionStorage.getItem(key);

    if(!data) return null;
    const { updatedAt, results } = JSON.parse(data);
    if (updatedAt < CACHE_TIMEOUT) {
      return null;
    } else {
      return results;
    }
  },

  filterResultsForTab(results) {
    const currentTab = document.querySelector(".js-tab-container input:checked").id;

    // return filtered results for cases and organizations, otherwise return all results
    if (currentTab === "organizations") {
      // NOTE: currentTab for organizations is plural, but article type is singular
      return results.filter(article => article.type === "organization");
    } else if (currentTab === "case"){
      return results.filter(article => article.type === "case");
    } else {
      return results;
    }
  },

  renderMarkers(results) {
    const articleCardsContainer = document.querySelector(".js-cards-container");
    const filteredResults = this.filterResultsForTab(results);

    const markers = filteredResults.map(article => {
      const { latitude, longitude } = article;

      // if article doesn't have lat,lng coords, don't render markers
      if (!latitude || !longitude) return;

      return {
        id: article.id,
        type: article.type,
        photo: article.photos && article.photos[0].url,
        submittedDate: article.updated_date,
        title: article.title,
        featured: article.featured,
        position: new google.maps.LatLng(latitude, longitude),
        content: articleCardsContainer.querySelector("li"),
      };
    });

    // render markers
    markers.filter(m => m !== undefined).forEach(marker => {
      const markerEl = new google.maps.Marker({
        position: marker.position,
        map: this.map,
        icon: marker.featured === true ? featuredMarkerIcon : markerIcon,
      });

      // on marker click, show article card in popover on map
      markerEl.addListener("click", event => {
        const popOverContentEl = document.createElement("div");
        // get card content from marker and set on content element
        popOverContentEl.classList = "article-card";
        popOverContentEl.innerHTML = marker.content.innerHTML;

        // update type
        const articleTypeEl = popOverContentEl.querySelector(".article-card-meta h5");
        articleTypeEl.innerHTML = marker.content.getAttribute("data-i18n-type");

        // update image
        const articleImageEl = popOverContentEl.querySelector(".article-card-img");
        articleImageEl.style.backgroundImage = `url("${marker.photo}")`;

        // update title & truncate to 45 chars
        const articleTitleEl = popOverContentEl.querySelector(".article-card-title");
        if (marker.title.length < 46) {
          articleTitleEl.innerText = marker.title;
        } else {
          articleTitleEl.innerText = marker.title.substring(0, 45) + "...";
        }

        // update submitted at
        const articleSubmittedDate = popOverContentEl.querySelector(".js-article-date");
        articleSubmittedDate.innerHtml = moment(marker.submittedDate).format("MMMM M, YYYY");

        // update links
        const articleLinks = Array.prototype.slice.call(
          popOverContentEl.querySelectorAll(".js-article-link")
        );
        articleLinks.forEach(el => {
          el.setAttribute("href", `/${marker.type}/${marker.id}`);
        });

        // if there is already a current pop over, remove it
        if (this.popOver) {
          this.popOver.setMap(null);
        }

        // insert pop over
        this.popOver = new PopOver(marker.position, popOverContentEl);
        this.popOver.setMap(this.map);
      });
    });
  },
};

export default map;
