// forked from https://developers.google.com/maps/documentation/javascript/examples/overlay-popup

/**
 * A customized popup on the map.
 * @param {!google.maps.LatLng} position
 * @param {!Element} content
 * @constructor
 * @extends {google.maps.OverlayView}
 */

const PopOver = function(position, content) {
  this.position = position;

  // insert pop over
  const pixelOffset = document.createElement("div");
  pixelOffset.classList.add("pop-over-bubble-anchor");
  pixelOffset.appendChild(content);

  this.anchor = document.createElement("div");
  this.anchor.classList.add("pop-over");
  this.anchor.classList.add("js-pop-over");
  this.anchor.classList.add("pop-over-tip-anchor");
  this.anchor.style.position = "absolute";
  this.anchor.appendChild(pixelOffset);

  // remove pop over on close button click
  this.anchor.addEventListener("click", event => {
    const closeButtonEl = event.target.closest(".js-close-card-btn");
    if (!closeButtonEl) return;
    this.setMap(null);
  });

  // Optionally stop clicks, etc., from bubbling up to the map.
  this.stopEventPropagation();
};

PopOver.prototype = Object.create(google.maps.OverlayView.prototype);

/** Called when the PopOver is added to the map. */
PopOver.prototype.onAdd = function() {
  this.getPanes().floatPane.appendChild(this.anchor);
};

/** Called when the PopOver is removed from the map. */
PopOver.prototype.onRemove = function() {
  if (this.anchor.parentElement) {
    this.anchor.parentElement.removeChild(this.anchor);
  }
};

/** Called when the PopOver needs to draw itself. */
PopOver.prototype.draw = function() {
  const divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
  // Hide the PopOver when it is far out of view.
  const display =
    Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
      ? "block"
      : "none";

  if (display === "block") {
    // show marker in center of map
    const popOverWidth = this.anchor.getClientRects()[0].width;
    this.anchor.style.left = `-${popOverWidth/2}px`;
    this.anchor.style.top = "-160px";
  }
  if (this.anchor.style.display !== display) {
    this.anchor.style.display = display;
  }
};

/** Stops clicks/drags from bubbling up to the map. */
PopOver.prototype.stopEventPropagation = function() {
  const anchor = this.anchor;
  anchor.style.cursor = "auto";

  ["click",
   "dblclick",
   "contextmenu",
   "wheel",
   "mousedown",
   "touchstart",
   "pointerdown",
  ].forEach(function(event) {
    anchor.addEventListener(event, function(e) {
      e.stopPropagation();
    });
  });
};

export default PopOver;
