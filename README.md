# PWA Weather App

A Progressive Web App (PWA) built with **Angular 21** and **Ionic 8** that delivers real-time weather data by location. Enter a zip code or use your device's geolocation to retrieve current conditions, an hourly forecast, and a 5-day outlook — all powered by the OpenWeatherMap API. Because it is a PWA, the app can be installed to a device home screen, loads instantly on repeat visits, and continues to display the last known weather data when offline.

## PWA Required Setup

This app uses the [`@angular/pwa`](https://angular.dev/ecosystem/service-workers) package to enable Progressive Web App support. Running the following command scaffolds all the required files and configuration automatically:

```bash
ng add @angular/pwa
```

The table below describes each file or configuration point that the package adds or modifies, and why it matters:

| File | Role | Notes |
|------|------|-------|
| `ngsw-config.json` | Service worker cache configuration | Defines which assets and API responses are cached, for how long, and with which strategy. See the [Service Worker Configuration](#service-worker-configuration-ngsw-configjson) section below for a full breakdown. |
| `public/manifest.webmanifest` | Web App Manifest | Tells the browser how to present the app when installed — name, icons, theme color, display mode, and the identity anchor (`id`) used across installs. |
| `src/index.html` | PWA meta tags | Adds `<link rel="manifest">`, `<meta name="theme-color">`, and iOS-specific tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`) required for home screen installation on iOS. |
| `src/app/app.module.ts` | Service worker registration | Registers `ngsw-worker.js` via `provideServiceWorker()`. Configured with `enabled: !isDevMode()` so the SW is never active during local development (which would cause stale cache issues), and `registrationStrategy: 'registerWhenStable:30000'` so registration doesn't compete with app startup. |
| `angular.json` | Build integration | Adds `"serviceWorker": "ngsw-config.json"` to the production build target, which instructs the Angular CLI to generate `ngsw-worker.js` and a hashed `ngsw.json` asset manifest as part of every production build. |

> **Reference:** [Angular Service Worker Introduction — angular.dev](https://angular.dev/ecosystem/service-workers)

## Service Worker Configuration (`ngsw-config.json`)

Angular's built-in service worker is configured via `ngsw-config.json`. The file controls what gets cached, how it gets cached, and how navigation requests are handled when the user is offline or on a slow connection.

### Asset Groups — App Shell

Asset groups cover static files that make up the app itself. These are versioned alongside the app and updated when a new build is deployed.

| Group | Files | Install Mode | Update Mode | Why |
|-------|-------|-------------|-------------|-----|
| `app` | `index.html`, `manifest.webmanifest`, `*.css`, `*.js` | `prefetch` | *(default)* | Core app shell. Cached immediately on SW install so the app loads instantly and works offline. |
| `assets` | `assets/**`, common image/font extensions | `lazy` | `prefetch` | Downloaded on first use (not upfront), then kept warm on updates — balances install speed with offline availability. |
| `icons` | `/svg/*.svg` | `prefetch` | `prefetch` | Ionicons SVGs used in the tab bar. Glob pattern (`*.svg`) means any new icon added to a template is automatically covered without updating this config. |

### Navigation URLs

```json
"navigationUrls": ["/**"]
```

Tells the service worker to intercept **all** HTML navigation requests (e.g. a user deep-linking to `/weather/hourly` or launching the installed PWA from their home screen) and serve the cached `index.html` app shell. Without this, browser navigation to a deep route while offline would return a network error instead of loading the Angular app and letting the router handle it client-side.

### Data Groups — API Caching

Data groups cover runtime network requests (API calls). Unlike asset groups, these are not versioned with the app — they reflect live data that changes independently.

| Group | URL Pattern | Strategy | Max Age | Timeout | Why |
|-------|------------|----------|---------|---------|-----|
| `current-weather-api` | `api.openweathermap.org/data/2.5/*` | `freshness` | 1 hour | 5s | Weather data changes frequently. **Freshness** hits the network first and only falls back to cache if the network doesn't respond within 5 seconds — ensures users see current conditions, not stale data. |
| `postal-code-api` | `secure.geonames.org/*` | `performance` | 1 hour | 10s | Zip-code-to-coordinates lookups rarely change. **Performance** serves from cache immediately and revalidates in the background — fast lookups with a generous 1-hour TTL are appropriate here. |

#### Cache Strategies Explained

- **`freshness`** — Network first. If the network responds within the timeout, that response is used and cached. If not, the cached response is served as a fallback. Best for data that must be up-to-date.
- **`performance`** — Cache first. The cached response is served immediately if available. A network request is only made if no cached response exists or it has expired. Best for data that changes infrequently.
