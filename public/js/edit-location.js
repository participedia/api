// there is no official google maps api npm module so
// global google var is loaded via script tag in main.html

const editLocation = {
  init() {
    this.inputEl = document.querySelector("[name=location_name]");
    this.autocomplete = new google.maps.places.Autocomplete(this.inputEl);
    this.autocomplete.setFields(["address_components", "geometry", "formatted_address"]);
    this.autocomplete.addListener("place_changed", () => this.handlePlaceChange());
  },

  handlePlaceChange() {
    const place = this.autocomplete.getPlace();

    const addressComponents = {
      city: place.address_components[0].long_name,
      province: place.address_components[2].short_name,
      country: place.address_components[3].long_name,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    };

    // insert hidden fields for the addressComponents values
    const keys = Object.keys(addressComponents);
    keys.forEach(key => {
      const hiddenInputEl = document.createElement("input");
      hiddenInputEl.setAttribute("type", "hidden");
      hiddenInputEl.setAttribute("name", key);
      hiddenInputEl.setAttribute("value", addressComponents[key]);
      this.inputEl.insertAdjacentElement("afterend", hiddenInputEl);
    });
  }
};

export default editLocation;
