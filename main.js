// Public Mapbox token (pk.*). It is visible to anyone who loads the page, so
// restrict it to this site's URL(s) in the Mapbox dashboard
// (https://account.mapbox.com/access-tokens/) and rotate it if it was ever
// used without restrictions.
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZmFkeWVoYWJhbWVyIiwiYSI6ImNsYTJ5aTZxbTBpc20zcm8zaW9qMXY3ZXoifQ.E5qFMdxa2A2wvBQCxRpKCw";

// Fallback view used until (or instead of) the user's position: whole world.
const DEFAULT_CENTER = [0, 20]; // [lng, lat]
const DEFAULT_ZOOM = 1.5;
const USER_ZOOM = 9;

// Render the map immediately so the app is usable even if location access is
// denied, unavailable (e.g. non-HTTPS origin) or the permission prompt is ignored.
const map = initializeMap(DEFAULT_CENTER, DEFAULT_ZOOM);

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000 });
} else {
  error();
}

function success(position) {
  const { latitude, longitude } = position.coords;
  map.jumpTo({ center: [longitude, latitude], zoom: USER_ZOOM });
}

function error() {
  swal.fire({
    title: "Location unavailable",
    text: "Allow location access to center the map on you, or search for places in the directions panel.",
    icon: "info",
    confirmButtonText: "OK",
  });
}

function initializeMap(center, zoom) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center, // starting position [lng, lat]
    zoom, // starting zoom
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

  return map;
}
