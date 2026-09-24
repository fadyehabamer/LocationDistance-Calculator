# Location Distance Calculator
> Get the distance between map locations using mapbox

**Live demo:** https://location-distance-calculator.vercel.app

## Features

- Interactive 3D globe map powered by [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) v2.10
- Driving / walking / cycling routes with distance and travel time via the
  [Mapbox GL Directions](https://github.com/mapbox/mapbox-gl-directions) plugin
- Trip summary card with the route distance and travel time (for the selected
  driving, walking or cycling profile)
- km/mi toggle for the summary; your choice is remembered. The directions
  panel's step-by-step instructions use the unit that was selected when the
  page loaded
- Shareable links: the URL keeps the origin and destination as `lng,lat` query
  parameters (plus the unit), e.g.
  `?origin=31.2357,30.0444&destination=29.9187,31.2001&unit=km`, and
  **Copy share link** copies it. `origin` and `destination` also accept a place
  name, which is geocoded when the link is opened
- Centers the map on your current location when you allow location access;
  falls back to a world view otherwise (skipped when a shared route is opened)

## Run locally

This is a static site with no build step. `main.js` is loaded as an ES module,
so serve the folder over HTTP instead of opening `index.html` from disk:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Browsers only expose geolocation on secure origins (HTTPS or `localhost`).

## Project structure

| File         | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `index.html` | Page shell; loads Mapbox GL JS, Directions, SweetAlert2 from CDNs |
| `main.js`    | Map setup, geolocation, directions control         |
| `style.css`  | Full-screen map layout                             |

## Mapbox access token

The token in `main.js` (`MAPBOX_ACCESS_TOKEN`) is a **public** (`pk.`) token.
Public tokens are meant to ship in browser code, but anyone can copy them, so:

1. In the [Mapbox account dashboard](https://account.mapbox.com/access-tokens/),
   add **URL restrictions** so the token only works on the deployed site
   (e.g. `https://location-distance-calculator.vercel.app`) and `http://localhost`.
2. If the current token has been used without restrictions, **rotate it**
   (create a new restricted token, update `MAPBOX_ACCESS_TOKEN`, then delete the old one).
3. Never put a secret (`sk.`) token in this repository.

If you fork the project, replace the token with your own.

## License

[MIT](LICENSE)
