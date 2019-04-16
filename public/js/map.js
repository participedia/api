import mapStyle from "./map-style.js";
import PopOver from "./GoogleMapsPopOver.js";

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

    if (!mapEl) return;

    this.map = new google.maps.Map(mapEl, {
      center: { lat: 24.6207595, lng: -40.2706411 },
      zoom: 1.75,
      disableDefaultUI: true,
      zoomControl: false,
      styles: mapStyle,
    });

    this.initZoomControls(this.map);

    this.renderMarkers();
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

  renderMarkers() {
    // markers are for cases and organizations, show no markers for methods
    // red markers are featured articles, black for everything else

    const currentCardEls = document.querySelectorAll(
      "[role='tabpanel']:not([hidden]) .js-cards-container li"
    );

    const markers = Array.prototype.slice.call(currentCardEls).map(el => {
      const latLng = el.getAttribute("data-lat-lng");
      console.log("latLng", latLng)
      // if cards don't have lat,lng coords, don't render markers
      if (!latLng) return;

      const latitude = latLng.split(",")[0];
      const longitude = latLng.split(",")[1];

      return {
        featured: el.getAttribute("data-featured"),
        position: new google.maps.LatLng(latitude, longitude),
        content: el,
      };
    });

    // render markers
    markers.filter(m => m !== undefined).forEach(marker => {
      const markerEl = new google.maps.Marker({
        position: marker.position,
        map: this.map,
        icon: marker.featured === "true" ? featuredMarkerIcon : markerIcon,
      });

      // on marker click, show article card in popover on map
      markerEl.addListener("click", event => {
        const popOverContentEl = document.createElement("div");
        // get card content from marker and set on content element
        popOverContentEl.classList = "article-card";
        popOverContentEl.innerHTML = marker.content.innerHTML;

        // truncate article title to 45 chars
        const articleTitleEl = popOverContentEl.querySelector(".article-card-title");
        articleTitleEl.innerText = articleTitleEl.innerText.substring(0, 45) + "...";

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
