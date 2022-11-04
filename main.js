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
    button: "OK",
  });
}

function intializeMap(coords) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZmFkeWVoYWJhbWVyIiwiYSI6ImNsYTJ5aTZxbTBpc20zcm8zaW9qMXY3ZXoifQ.E5qFMdxa2A2wvBQCxRpKCw";
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
      accessToken: "pk.eyJ1IjoiZmFkeWVoYWJhbWVyIiwiYSI6ImNsYTJ5aTZxbTBpc20zcm8zaW9qMXY3ZXoifQ.E5qFMdxa2A2wvBQCxRpKCw",
    }),
    "top-left"
  );


}
