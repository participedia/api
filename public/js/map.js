import mapStyle from "./map-style.js"

const markerIcon = {
  path: 'M14.1,7.1C14.1,3.2,11,0,7.1,0S0,3.2,0,7.1C0,12.4,7.1,20,7.1,20S14.1,12.4,14.1,7.1z M4.7,7.1 c0-1.3,1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4s-1,2.4-2.4,2.4C5.8,9.4,4.7,8.4,4.7,7.1z',
  fillColor: '#000',
  fillOpacity: 1,
  scale: 1,
  anchor: new google.maps.Point(7,20),
};

const featuredMarkerIcon = Object.assign(markerIcon, {
  fillColor: "#ec2024",
  strokeColor: "#ec2024",
});

const map = {
  init() {
    const mapEl = document.querySelector('.js-map-container');

    if (!mapEl) return;

    this.map = new google.maps.Map(mapEl, {
      center: { lat: 24.6207595, lng: -40.2706411 },
      zoom: 1.75,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      styles: mapStyle,
    });

    this.renderMarkers();
  },

  renderMarkers() {
    // markers are for cases and organizations, show no markers for methods
    // red markers are featured articles, black for everything else

    const currentCardEls = document.querySelectorAll("[role='tabpanel']:not([hidden]) .js-cards-container li");

    const markers = Array.prototype.slice.call(currentCardEls).map(el => {
      const latitude = el.getAttribute("data-latitude");
      const longitude = el.getAttribute("data-longitude");
      const featured = el.getAttribute("data-featured");
      if (latitude && longitude) {
        return {
          featured: featured,
          position: new google.maps.LatLng(latitude, longitude),
        };
      }
    });

    const filteredMarkers = markers.filter(m => m !== undefined);
    // Create markers.
    filteredMarkers.forEach(marker => {
      new google.maps.Marker({
        position: marker.position,
        map: this.map,
        icon: marker.featured ? featuredMarkerIcon : markerIcon,
      });
    });
  },
}

export default map;
