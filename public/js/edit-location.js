// there is no official google maps api npm module so
// global google var is loaded via script tag in main.html

const editLocation = {
  init() {
    const inputEl = document.querySelector("[name=location_name]");
    const autocomplete = new google.maps.places.Autocomplete(inputEl);
    autocomplete.setFields(["address_components", "geometry", "formatted_address"]);
    autocomplete.addListener("place_changed", function() {
      // const place = autocomplete.getPlace();
      // do something with place object if needed
    });
  }
};

export default editLocation;
