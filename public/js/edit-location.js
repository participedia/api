// there is no official google maps api npm module so
// global google var is loaded via script tag in main.html

const LOCATION_KEYS = [
  "address1",
  "address2",
  "city",
  "province",
  "postal_code",
  "country",
  "latitude",
  "longitude",
];

const editLocation = {
  init() {
    this.inputEl = document.querySelector("[name=location]");

    if (!this.inputEl) return;

    this.autocomplete = new google.maps.places.Autocomplete(this.inputEl);
    this.autocomplete.setFields([
      "address_components",
      "geometry",
      "formatted_address",
    ]);
    this.autocomplete.addListener("place_changed", () =>
      this.handlePlaceChange()
    );
    this.inputEl.addEventListener("change", ev => this.handleInputElChange(ev));
  },

  handleInputElChange(ev) {
    if (ev.target.value === "") {
      // set hidden fields values to "" when main field value is cleared
      const inputs = ev.target
        .closest("fieldset")
        .querySelectorAll("input[type='hidden']");
      inputs.forEach(el => (el.value = ""));
    }
  },

  handlePlaceChange() {
    const place = this.autocomplete.getPlace();
    const addressComponents = this.parseAddressComponents(place);

    // set hidden fields for the addressComponents key
    LOCATION_KEYS.forEach(key => {
      const hiddenInputEl = document.querySelector(`input[name=${key}]`);
      if (!hiddenInputEl) return;
      hiddenInputEl.value = addressComponents[key]
        ? addressComponents[key]
        : "";
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
          addressComponents.address1 = `${addressComponents.address1} ${
            component.long_name
          }`;
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
  },
};

export default editLocation;
