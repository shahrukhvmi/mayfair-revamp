// Mayfair Analytics – connection to the WordPress plugin's tracker
// (plugin: Journey Attribution Analytics).
//
// The consultation app does not run its own attribution. It loads the same
// tracker file the WordPress site and the ads landing pages load, so it shares
// the visitor ID, the session, the first/last touch cookies and the exact
// attribution rules, and sends everything to the same plugin endpoints.
//
// Everything here is fire-and-forget: if the tracker is blocked or offline,
// calls are dropped and the consultation keeps working.

const DEFAULT_SRC =
  "/wp-content/plugins/journey-attribution-analytics/assets/js/journey-attribution-analytics.js";

// Root-relative: WordPress and /start-consultation share one origin in
// production and staging. Override for local development, e.g.
// NEXT_PUBLIC_MAYFAIR_ANALYTICS_SRC=http://localhost/mayfair-cpanel/public_html/wp-content/plugins/journey-attribution-analytics/assets/js/journey-attribution-analytics.js
export const TRACKER_SRC =
  process.env.NEXT_PUBLIC_MAYFAIR_ANALYTICS_SRC || DEFAULT_SRC;

// e.g. NEXT_PUBLIC_MAYFAIR_ANALYTICS_PREFIX=mayfair on a site upgraded from plugin 1.0.
export const TRACKER_PREFIX = process.env.NEXT_PUBLIC_MAYFAIR_ANALYTICS_PREFIX || "";

let loader = null;
let chain = Promise.resolve();

/** Injects the tracker once. Resolves with window.JourneyAnalytics, or null if it failed to load. */
export function loadTracker() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.JourneyAnalytics) return Promise.resolve(window.JourneyAnalytics);
  if (!loader) {
    loader = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = TRACKER_SRC;
      script.async = true;
      // Tells the tracker which part of the site this is ("consultation" in reports).
      script.dataset.section = "consultation";
      // Cookie prefix of the WordPress install (Settings > Tracking names). The
      // tracker also reads it from WordPress; setting it here keeps the names
      // fixed even if that request is slow.
      if (TRACKER_PREFIX) script.dataset.prefix = TRACKER_PREFIX;
      script.onload = () => resolve(window.JourneyAnalytics || null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }
  return loader;
}

/**
 * Runs fn(api, state) after the tracker has started, in call order. The order
 * matters for the visitor journey (e.g. "consultation opened" before a step).
 */
export function run(fn) {
  chain = chain
    .then(loadTracker)
    .then((api) => (api ? new Promise((resolve) => api.ready((state) => resolve([api, state]))) : null))
    .then((ready) => {
      if (ready) fn(ready[0], ready[1]);
    })
    .catch(() => {});
  return chain;
}

/** Custom event on the current visitor/session. Props must not contain personal data. */
export function track(name, props = {}) {
  return run((api) => api.track(name, props));
}

/** Links the visitor to a patient / order / payment record, with that record's state. */
export function identify(type, id, meta = {}) {
  if (id === undefined || id === null || id === "") return Promise.resolve();
  return run((api) => api.identify(type, String(id), meta));
}

/**
 * Like identify(), but resolves true only once the server has stored the link
 * (the tracker retries while the visitor's first hit is still on its way).
 * Resolves false on failure, if the tracker is unavailable, or after 30 s
 * (e.g. an older tracker that does not report back).
 */
export function identifyConfirmed(type, id, meta = {}) {
  if (id === undefined || id === null || id === "") return Promise.resolve(false);
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve(Boolean(ok));
    };
    const timer = setTimeout(() => done(false), 30000);
    run((api) => api.identify(type, String(id), meta, (ok) => { clearTimeout(timer); done(ok); }));
    // The tracker could not load at all: run() never calls fn.
    loadTracker().then((api) => { if (!api) { clearTimeout(timer); done(false); } });
  });
}

/** Page view for in-app (client-side) navigation. The first page view is sent by the tracker itself. */
export function pageView() {
  return run((api) => api.page());
}

/** Runs fn once per tracker session (per browser tab), e.g. "consultation started". */
export function oncePerSession(key, fn) {
  return run((api) => {
    const state = api.getState();
    const storageKey = `mfa:${state?.session_id}:${key}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch (e) {
      // Storage unavailable: send anyway rather than lose the event.
    }
    fn(api, state);
  });
}

/** Runs fn once per browser for a given key (e.g. "payment succeeded for order 123"). */
export function oncePerBrowser(key, fn) {
  return run((api, state) => {
    const storageKey = `mfa:once:${key}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, "1");
    } catch (e) {
      // Storage unavailable: send anyway rather than lose the event.
    }
    fn(api, state);
  });
}
