import moment from "moment";
import mapStyle from "./map-style.js";
import PopOver from "./GoogleMapsPopOver.js";
import { xhrReq } from "./utils/utils.js";
import tracking from "./utils/tracking.js";

const defaultMarkerIcon = "/images/map-marker-images/single-marker.svg";
const featuredMarkerIcon =
  "/images/map-marker-images/single-marker-featured.svg";

const markerTextColor = "#fff";
const smallMarkerStyle = {
  url: "/images/map-marker-images/m3.svg",
  textColor: markerTextColor,
  width: 20,
  height: 30,
  anchorText: [-3, 0],
  anchorIcon: [30, 10],
  textSize: 11,
};

// the smallest marker (m3) always uses the same styles
// m4 and m5 have different styles if on a smaller device
const markerStylesByMarkerSize = {
  m3: {
    small: smallMarkerStyle,
    large: smallMarkerStyle,
  },
  m4: {
    small: {
      url: "/images/map-marker-images/m4-small.svg",
      textColor: markerTextColor,
      width: 25,
      height: 38,
      anchorText: [-5, 0],
      anchorIcon: [38, 13],
      textSize: 11,
    },
    large: {
      url: "/images/map-marker-images/m4.svg",
      textColor: markerTextColor,
      width: 35,
      height: 53,
      anchorText: [-5, 0],
      anchorIcon: [53, 17],
      textSize: 13,
    },
  },
  m5: {
    small: {
      url: "/images/map-marker-images/m5-small.svg",
      textColor: markerTextColor,
      width: 40,
      height: 60,
      anchorText: [-10, 0],
      anchorIcon: [60, 20],
      textSize: 12,
    },
    large: {
      url: "/images/map-marker-images/m5.svg",
      textColor: markerTextColor,
      width: 50,
      height: 75,
      anchorText: [-10, 0],
      anchorIcon: [75, 25],
      textSize: 14,
    },
  },
};

const markerStyles = markerSize => {
  // markerSize is one of 'm3', 'm4', 'm5'
  const isSmallViewport = window.innerWidth <= 640;

  if (isSmallViewport) {
    return markerStylesByMarkerSize[markerSize].small;
  } else {
    return markerStylesByMarkerSize[markerSize].large;
  }
};

const map = {
  init() {
    this.mapEl = document.querySelector(".js-map-inner");

    if (!this.mapEl) return;
    
    this.headerEl = document.querySelector(".js-header");
    this.mapLegendEl = document.querySelector(".js-map-legend");

    this.map = new google.maps.Map(this.mapEl, {
      center: { lat: 6.1259722, lng: 20.9404108 },
      mapId: "11044b0cfd0d2e66",
      zoom: 2.5,
      disableDefaultUI: true,
      zoomControl: false,
      styles: mapStyle,
    });

    this.initZoomControls();
    this.fetchMapResults();
    this.setMapHeight();
    this.initFullscreenControl();
    window.addEventListener('resize', () => {
      this.setMapHeight();
    });

    this.i18n = JSON.parse(this.mapEl.getAttribute("data-i18n"));
  },

  setMapHeight() {
    const mapHeight = `${window.innerHeight - this.headerEl.offsetHeight}px`;
    this.mapEl.parentNode.style.height = mapHeight;
    this.mapEl.style.height = mapHeight;
  },

  initZoomControls() {
    document
      .querySelector(".js-map-zoom-control-in")
      .addEventListener("click", () => {
        this.map.setZoom(this.map.getZoom() + 1);
      });
    document
      .querySelector(".js-map-zoom-control-out")
      .addEventListener("click", () => {
        this.map.setZoom(this.map.getZoom() - 1);
      });
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      document.querySelector(".js-map-controls")
    );
  },

  fetchMapResults() {
    const url = `/search?resultType=map&returns=json`;

    const successCB = response => {
      const results = JSON.parse(response.response).results;
      this.cacheResults(response.responseURL, results);
      this.prepareMarkers(results);
    };
    const errorCB = response => {
      //console.log("err", response)
    };

    const cachedResults = this.getCachedResults(window.location.origin + url);
    if (cachedResults) {
      // if we have cached results, render the markers with those
      this.prepareMarkers(cachedResults);
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
    try {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(err);
    }
  },

  getCachedResults(key) {
    const CACHE_TIMEOUT = Date.now() - 300000; // 5mins === 300000ms
    const data = window.sessionStorage.getItem(key);

    if (!data) return null;
    const { updatedAt, results } = JSON.parse(data);
    if (updatedAt < CACHE_TIMEOUT) {
      return null;
    } else {
      return results;
    }
  },

  closePopOver() {
    const openMarker = document.querySelector(".js-pop-over");
    if (openMarker) {
      openMarker.parentNode.removeChild(openMarker);
    }
  },

  dropMarkers(markers) {
    const featuredMarkers = markers.filter(m => m.featured);
    const otherMarkers = markers.filter(m => !m.featured);

    const markersForClustering = otherMarkers.map((marker, i) => {
      const markerPopOver = new google.maps.Marker({
        position: marker.position,
        map: this.map,
        icon: defaultMarkerIcon,
      });
      this.bindClickEventForMarker(markerPopOver, marker);
      return markerPopOver;
    });

    // render marker clusters
    const markerCluster = new MarkerClusterer(this.map, markersForClustering, {
      maxZoom: 7,
      gridSize: 65,
      styles: [
        MarkerClusterer.withDefaultStyle(markerStyles("m3")),
        MarkerClusterer.withDefaultStyle(markerStyles("m4")),
        MarkerClusterer.withDefaultStyle(markerStyles("m5")),
      ],
      clusterClass: "custom-clustericon",
    });

    // render featured markers
    for (let i = 0; i < featuredMarkers.length; i++) {
      const markerPopOver = new google.maps.Marker({
        position: featuredMarkers[i].position,
        map: this.map,
        icon: featuredMarkerIcon,
      });
      this.bindClickEventForMarker(markerPopOver, featuredMarkers[i]);
    }
  },

  prepareMarkers(results) {
    const markers = results
      .map(article => {
        const { latitude, longitude } = article;

        // if article doesn't have lat,lng coords, don't render markers
        if (!latitude || !longitude) return;

        return {
          id: article.id,
          type: article.type,
          photo: article.photos && article.photos[0].url,
          submittedDate: article.post_date,
          title: article.title,
          featured: article.featured,
          position: new google.maps.LatLng(latitude, longitude),
          //content: articleCardsContainer.querySelector("li"),
        };
      })
      .filter(m => m !== undefined);

    // render markers
    this.dropMarkers(markers);
  },

  renderMarkerCard(marker) {
    if (!this.cardEl) {
      this.cardEl = document.getElementById("js-map-article-card-template");
    }

    let cardTemplate =  document.createElement("div");
    cardTemplate.innerHTML = this.cardEl.innerHTML;
    cardTemplate = cardTemplate.querySelector("li").innerHTML;
    
    const popOverContentEl = document.createElement("div");
      // get card content from marker and set on content element
      popOverContentEl.classList = "article-card";
      popOverContentEl.innerHTML = cardTemplate;

      // update type
      const articleTypeEl = popOverContentEl.querySelector(
        ".js-article-card-meta h5"
      );
      if (marker.featured) {
        articleTypeEl.innerHTML = {
          case: this.i18n["Featured_Case"],
          method: this.i18n["Featured_Method"],
        }[marker.type];
      } else {
        articleTypeEl.innerHTML = this.i18n[marker.type];
      }

      // update image
      const articleImageEl = popOverContentEl.querySelector(
        ".js-article-card-img"
      );
      // articleImageEl.style.backgroundImage = `url("${marker.photo}")`;
      const imgElement = articleImageEl.querySelector('img'); // Select the img element inside the div
      if (imgElement) {
        imgElement.src = marker.photo;
        imgElement.style.height = '150px';
      } else {
        articleImageEl.style.setProperty('background-image', `url("${marker.photo}")`, 'important');
      }

      // update title & truncate to 45 chars
      const articleTitleEl = popOverContentEl.querySelector(
        ".js-article-card-title"
      );
      if (marker.title.length < 50) {
        articleTitleEl.innerText = marker.title;
      } else {
        articleTitleEl.innerText = marker.title.substring(0, 40) + "...";
      }

      // update submitted at
      const articleSubmittedDate = popOverContentEl.querySelector(
        ".js-article-date"
      );
      articleSubmittedDate.innerHTML = moment(marker.submittedDate).format(
        "MMMM M, YYYY"
      );

      // update links
      const articleLinks = Array.prototype.slice.call(
        popOverContentEl.querySelectorAll(".js-article-link")
      );
      articleLinks.forEach(el => {
        el.setAttribute("href", `/${marker.type}/${marker.id}`);
      });
      return popOverContentEl;
  },

  bindClickEventForMarker(markerEl, marker) {    
    // on marker click, show article card in popover on map
    markerEl.addListener("click", event => {
      // if there is already a current pop over, remove it
      if (this.popOver) {
        this.popOver.setMap(null);
      }

      // insert pop over
      const popOverContentEl = this.renderMarkerCard(marker);
      this.popOver = new PopOver(marker.position, popOverContentEl);
      this.popOver.setMap(this.map);

      // on screen widths less than 1100 the legend overlaps the marker card,
      // so in this case, hide the legend when the marker is shown
      if (window.innerWidth < 1100) {
        this.mapLegendEl.style.display = "none";
      }

      // remove pop over on close button click
      this.popOver.anchor.addEventListener("click", event => {
        const closeButtonEl = event.target.closest(".js-close-card-btn");
        if (!closeButtonEl) return;
        this.popOver.setMap(null);
        // show legend when marker is closed
        this.mapLegendEl.style.display = "flex";
      });

      // Track marker click
      tracking.send("home.map", "marker_click", marker.id);
    });
  },

  isFullscreen(element) {
    return (
      (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) == element
    );
  },

  openAllFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullScreen) {
      element.msRequestFullScreen();
    }
  },

  closeAllFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  },

  requestFullscreen(element) {
    var tabsButtonsContainer = document.querySelector('.tab-buttons-container');
    var jsTabItems = document.querySelector('.js-tab-items');
    var searchMapContainer = document.querySelector('.search-map-container');
    var jsFullscreenControl = document.querySelector('.js-fullscreen-control');
    var tabPanelHeader = document.querySelector('.tab-panel-header');
    var tabSelectContainer = document.querySelector('.tab-select-container');
    var mainContent = document.querySelector('.main-content');

    var screenWidth = window.innerWidth;

    if (screenWidth < 650){
      tabPanelHeader.style.display = 'none';
      tabSelectContainer.style.display = 'none';
    }else{
      
    }

    if (screenWidth < 1000){
      mainContent.style.marginTop = '85px';
    } else {
      mainContent.style.marginTop = '9px';
    }

    tabsButtonsContainer.style.display = 'none';
    jsTabItems.style.display = 'none';
    searchMapContainer.classList.add("search-map-fullwidth");
    jsFullscreenControl.classList.add("is-fullscreen");
  },

  exitFullscreen() {
    var tabsButtonsContainer = document.querySelector('.tab-buttons-container');
    var jsTabItems = document.querySelector('.js-tab-items');
    var searchMapContainer = document.querySelector('.search-map-container');
    var jsFullscreenControl = document.querySelector('.js-fullscreen-control');
    var tabPanelHeader = document.querySelector('.tab-panel-header');
    var tabSelectContainer = document.querySelector('.tab-select-container');
    var mainContent = document.querySelector('.main-content');

    var screenWidth = window.innerWidth;

    if (screenWidth < 650){
      tabsButtonsContainer.style.display = 'none';
      tabPanelHeader.style.display = 'block';
      tabSelectContainer.style.display = 'block';
    }else{
      tabsButtonsContainer.style.display = 'flex';
    }

    if (screenWidth < 1000){
      mainContent.style.marginTop = '115px';
    } else {
      mainContent.style.marginTop = '60px';
    }
  
    jsTabItems.style.display = 'block';
    searchMapContainer.classList.remove("search-map-fullwidth");
    jsFullscreenControl.classList.remove("is-fullscreen");
  },

  
  initFullscreenControl() {
    const elementToSendFullscreen = this.map.getDiv().firstChild;
    const fullscreenControl = document.querySelector(".js-fullscreen-control");
    const tabsButtonsContainer = document.querySelector('.tab-buttons-container');
    var tabSelectContainer = document.querySelector('.tab-select-container');

    var screenWidth = window.innerWidth;

    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(fullscreenControl);
    fullscreenControl.onclick = () => {

      if (screenWidth < 650){
        if (this.isFullscreen(elementToSendFullscreen)) {
          this.closeAllFullscreen();
        } else {
          this.openAllFullscreen(elementToSendFullscreen);
        }
      } else {
        if (tabsButtonsContainer.style.display == 'none') {
          this.exitFullscreen();
        } else {
          this.requestFullscreen(elementToSendFullscreen);
        }
      }

    };
  }
};

export default map;
