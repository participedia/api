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
    const addressComponents = this.parseAddressComponents(place);

    // insert hidden fields for the addressComponents keys
    const keys = Object.keys(addressComponents);
    keys.forEach(key => {
      const hiddenInputEl = document.createElement("input");
      hiddenInputEl.setAttribute("type", "hidden");
      hiddenInputEl.setAttribute("name", key);
      hiddenInputEl.setAttribute("value", addressComponents[key]);
      this.inputEl.insertAdjacentElement("afterend", hiddenInputEl);
    });
  },

  parseAddressComponents(place) {
    const addressComponents = {};
    place.address_components.forEach(component => {
      if (component.types.includes("street_number")) {
       addressComponents.address1 = component.long_name;
      }

      if (component.types.includes("route")) {
        if (addressComponents.address1) {
          addressComponents.address1 = `${addressComponents.address1} ${component.long_name}`;
        } else {
          addressComponents.address1 = component.long_name;
        }
      }

      if (component.types.includes("locality")) {
        addressComponents.city = component.long_name;
      }

      if (component.types.includes("administrative_area_level_1")) {
        addressComponents.province = component.long_name;
      }

      if (component.types.includes("country")) {
        addressComponents.country = component.long_name;
      }

      if (component.types.includes("postal_code")) {
        addressComponents.postal_code = component.long_name;
      }
    });
    addressComponents.latitude = place.geometry.location.lat();
    addressComponents.longitude = place.geometry.location.lng();
    return addressComponents;
  }
};

export default editLocation;
