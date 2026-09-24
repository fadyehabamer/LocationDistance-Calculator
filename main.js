// Public Mapbox token (pk.*). It is visible to anyone who loads the page, so
// restrict it to this site's URL(s) in the Mapbox dashboard
// (https://account.mapbox.com/access-tokens/) and rotate it if it was ever
// used without restrictions.
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZmFkeWVoYWJhbWVyIiwiYSI6ImNsYTJ5aTZxbTBpc20zcm8zaW9qMXY3ZXoifQ.E5qFMdxa2A2wvBQCxRpKCw";

navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const { latitude, longitude } = position.coords;
  intializeMap([longitude, latitude]);
}
function error() {
  swal.fire({
    title: "Error",
    text: "Please allow location access",
    icon: "error",
    confirmButtonText: "OK",
  });
}

function intializeMap(coords) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: coords, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: "globe", // display the map as a 3D globe
  });
  map.on("style.load", () => {
    map.setFog({}); // Set the default atmosphere style
  });
  map.addControl(new mapboxgl.NavigationControl());
  // display driving directions using the Mapbox Directions plugin
  map.addControl(
    new MapboxDirections({
      accessToken: MAPBOX_ACCESS_TOKEN,
    }),
    "top-left"
  );


}
