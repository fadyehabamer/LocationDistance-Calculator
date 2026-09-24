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

const UNIT_KEY = "distanceUnit";
const KM_PER_MILE = 1.609344;

const sharedTrip = readSharedTrip();
const tripPoints = { origin: null, destination: null };

let unit = sharedTrip.unit || readSavedUnit();
let lastRoute = null;
let directionsControl = null;
let profileLabel = "";

const distanceEl = document.getElementById("trip-distance");
const durationEl = document.getElementById("trip-duration");
const modeEl = document.getElementById("trip-mode");
const tripHint = document.getElementById("trip-hint");
const unitButtons = document.querySelectorAll(".unit-toggle button");
const shareBtn = document.getElementById("share-btn");
const shareStatus = document.getElementById("share-status");

// Render the map immediately so the app is usable even if location access is
// denied, unavailable (e.g. non-HTTPS origin) or the permission prompt is ignored.
const map = initializeMap(DEFAULT_CENTER, DEFAULT_ZOOM);

if (sharedTrip.origin || sharedTrip.destination) {
  map.on("load", loadSharedTrip);
} else if ("geolocation" in navigator) {
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
  const directions = new MapboxDirections({
    accessToken: MAPBOX_ACCESS_TOKEN,
    unit: unit === "mi" ? "imperial" : "metric",
  });
  map.addControl(directions, "top-left");

  directions.on("route", (event) => {
    lastRoute = event.route && event.route.length ? event.route[0] : null;
    renderTrip();
  });
  directions.on("profile", (event) => {
    profileLabel = describeProfile(event.profile);
    renderTrip();
  });
  directions.on("origin", (event) => setTripPoint("origin", event.feature));
  directions.on("destination", (event) => setTripPoint("destination", event.feature));
  directions.on("clear", (event) => {
    lastRoute = null;
    if (event && tripPoints[event.type] !== undefined) setTripPoint(event.type, null);
    renderTrip();
  });
  directionsControl = directions;

  return map;
}

function readSavedUnit() {
  try {
    return localStorage.getItem(UNIT_KEY) === "mi" ? "mi" : "km";
  } catch (e) {
    return "km";
  }
}

function formatDistance(meters) {
  const km = meters / 1000;
  const value = unit === "mi" ? km / KM_PER_MILE : km;
  const digits = value < 10 ? 2 : value < 100 ? 1 : 0;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: digits })} ${unit}`;
}

function describeProfile(profile) {
  const labels = {
    "driving-traffic": "driving, with traffic",
    driving: "driving",
    walking: "walking",
    cycling: "cycling",
  };
  return labels[String(profile).replace(/^mapbox\//, "")] || "";
}

function formatDuration(seconds) {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "< 1 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

function renderTrip() {
  unitButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.unit === unit)));
  const hasRoute = Boolean(lastRoute && typeof lastRoute.distance === "number");
  distanceEl.textContent = hasRoute ? formatDistance(lastRoute.distance) : "\u2013";
  const hasDuration = hasRoute && typeof lastRoute.duration === "number";
  durationEl.textContent = hasDuration ? formatDuration(lastRoute.duration) : hasRoute ? "Not available" : "\u2013";
  modeEl.textContent = profileLabel ? ` (${profileLabel})` : "";
  tripHint.hidden = hasRoute;
}

function setUnit(newUnit) {
  unit = newUnit;
  try {
    localStorage.setItem(UNIT_KEY, unit);
  } catch (e) {}
  renderTrip();
  updateShareUrl();
}

function parseLocation(value) {
  if (!value || !value.trim()) return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const lng = Number(match[1]);
    const lat = Number(match[2]);
    return Math.abs(lng) <= 180 && Math.abs(lat) <= 90 ? [lng, lat] : null;
  }
  return value.trim().slice(0, 200);
}

function readSharedTrip() {
  const params = new URLSearchParams(window.location.search);
  const sharedUnit = params.get("unit");
  return {
    origin: parseLocation(params.get("origin")),
    destination: parseLocation(params.get("destination")),
    unit: sharedUnit === "km" || sharedUnit === "mi" ? sharedUnit : null,
  };
}

function loadSharedTrip() {
  const { origin, destination } = sharedTrip;
  if (origin) directionsControl.setOrigin(origin);
  if (destination) directionsControl.setDestination(destination);
  if (Array.isArray(origin) && Array.isArray(destination)) {
    map.fitBounds([origin, destination], { padding: 80, maxZoom: 14 });
  } else if (Array.isArray(origin || destination)) {
    map.jumpTo({ center: origin || destination, zoom: USER_ZOOM });
  }
}

function formatPoint(feature) {
  const coords = feature && feature.geometry && feature.geometry.coordinates;
  if (!coords || coords.length < 2) return null;
  return coords.slice(0, 2).map((n) => Number(n.toFixed(5))).join(",");
}

function setTripPoint(type, feature) {
  tripPoints[type] = feature ? formatPoint(feature) : null;
  updateShareUrl();
}

function updateShareUrl() {
  const params = new URLSearchParams(window.location.search);
  ["origin", "destination"].forEach((key) => {
    if (tripPoints[key]) params.set(key, tripPoints[key]);
    else params.delete(key);
  });
  if (tripPoints.origin || tripPoints.destination) params.set("unit", unit);
  else params.delete("unit");
  const query = params.toString().replace(/%2C/gi, ",");
  history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  shareBtn.disabled = !(tripPoints.origin && tripPoints.destination);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("Copy command was rejected");
}

shareBtn.addEventListener("click", async () => {
  try {
    await copyText(window.location.href);
    shareStatus.textContent = "Link copied. Anyone who opens it will see this route.";
  } catch (e) {
    shareStatus.textContent = `Copy this link: ${window.location.href}`;
  }
});

unitButtons.forEach((btn) => btn.addEventListener("click", () => setUnit(btn.dataset.unit)));
renderTrip();
