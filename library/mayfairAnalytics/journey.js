// Mayfair Analytics – page views and consultation stages for the Next.js app.
//
// Navigation inside the app is internal Mayfair navigation: it records page
// views and stages but never changes attribution (the tracker only evaluates
// the first/last touch on a full page load, and WordPress -> /start-consultation
// arrives with a Mayfair referrer, which is internal by rule).

import Router from "next/router";
import { loadTracker, oncePerSession, pageView, run, track } from "./tracker";
import { watchPatient } from "./conversions";

// Each consultation page, with the progress its FormWrapper shows.
const STEPS = {
  "/signup": { step: "name", progress: 10 },
  "/email-confirmation": { step: "email_confirmation", progress: 20 },
  "/steps-information": { step: "information" },
  "/personal-details": { step: "personal_details", progress: 30 },
  "/pregnancy-check": { step: "pregnancy_check", progress: 30 },
  "/residential-address": { step: "residential_address", progress: 40 },
  "/preferred-phone-number": { step: "phone_number", progress: 50 },
  "/confirm-ethnicity": { step: "ethnicity", progress: 60 },
  "/calculate-bmi": { step: "bmi", progress: 70 },
  "/bmi-detail": { step: "bmi_detail", progress: 70 },
  "/medical-questions": { step: "medical_questions", progress: 80 },
  "/patient-consent": { step: "patient_consent", progress: 85 },
  "/gp-detail": { step: "gp_detail", progress: 90 },
  "/confirmation-summary": { step: "confirmation_summary", progress: 95 },
  "/review-answers": { step: "review_answers", progress: 95 },
  "/dosage-selection": { step: "dosage_selection" },
};

// The order of the steps, from the map above (used as step_index).
const STEP_ORDER = Object.keys(STEPS);

/**
 * A consultation step was completed: its form passed validation and its
 * answers were saved (to the app's own store, or to the server when the page
 * saves them there – saved: "server"). Called by each step page at the point
 * its save succeeded, never on a bare "Next" click. The step comes from the
 * current page, so the pages only say *when*, never *which*.
 */
export function completeStep({ saved = "app", path } = {}) {
  const pathname = String(path || Router.pathname || "").replace(/\/$/, "") || "/";
  const step = STEPS[pathname];
  if (!step) return;
  track("consultation_step_completed", {
    // "step", like the step views: property names containing "key" are dropped by the
    // plugin's privacy filter (it treats them as secrets).
    step: step.step,
    step_index: STEP_ORDER.indexOf(pathname) + 1,
    ...(step.progress ? { progress: step.progress } : {}),
    saved,
    path: pathname,
  });
}

// Pages where the patient chooses how to go on. Reaching one is not starting
// the consultation; the flow chosen is remembered for when they really start.
const ENTRIES = {
  "/acknowledgment": "new_patient",
  "/re-order": "reorder",
  "/steps-information": "continue",
};

const FLOW_KEY = "mfa:consultation_flow";

// Where this tab is in the current consultation round: "" (not started),
// "started" (answering questions), "completed" (submitted) or "checkout".
// A patient can answer, submit and check out more than once in one visit;
// each round is reported once, and refreshing a page never repeats it.
const ROUND_KEY = "mfa:consultation_round";

function roundState() {
  try {
    return window.sessionStorage.getItem(ROUND_KEY) || "";
  } catch (e) {
    return "";
  }
}

function setRoundState(state) {
  try {
    window.sessionStorage.setItem(ROUND_KEY, state);
  } catch (e) {
    // Storage unavailable: stages may be repeated on refresh, never lost.
  }
}

function rememberFlow(type) {
  try {
    window.sessionStorage.setItem(FLOW_KEY, type);
  } catch (e) {
    // Storage unavailable: the flow is simply not reported.
  }
}

function forgetFlow() {
  try {
    window.sessionStorage.removeItem(FLOW_KEY);
  } catch (e) {
    // Storage unavailable: nothing was remembered.
  }
}

function chosenFlow() {
  try {
    return window.sessionStorage.getItem(FLOW_KEY) || "";
  } catch (e) {
    return "";
  }
}

// Next.js error pages (a 404 or a crash): the page view is kept, but they are
// not part of the consultation.
const ERROR_PAGES = ["/_error", "/404", "/500"];

function trackRoute(pathname, initial) {
  if (!initial) pageView();
  if (ERROR_PAGES.includes(pathname)) return;

  oncePerSession("consultation_opened", () =>
    track("consultation_opened", { path: pathname }),
  );

  const step = STEPS[pathname];
  const round = roundState();

  // One choice of how to go on per round, made before its first question: a
  // new patient also passes /steps-information (treatment choice), and a
  // re-order goes /re-order -> /steps-information; neither is a second choice.
  const entry = ENTRIES[pathname];
  if (entry && (round === "" || round === "checkout") && !chosenFlow()) {
    rememberFlow(entry);
    oncePerSession(`consultation_entry:${entry}`, () =>
      track("consultation_entry", { type: entry, path: pathname }),
    );
  }
  // The consultation starts at its first question (a step with progress).
  // Going back to a question after submitting is the same round.
  if (step?.progress && (round === "" || round === "checkout")) {
    setRoundState("started");
    const type = chosenFlow();
    track("consultation_started", { ...(type ? { type } : {}), step: step.step, progress: step.progress, path: pathname });
  }

  // Submitted (or a consultation completed earlier, resumed): the plugin tells
  // the two apart by whether questions were answered.
  if (pathname === "/gathering-data" && round !== "completed") {
    setRoundState("completed");
    track("consultation_completed", { path: pathname });
  }

  if (pathname === "/checkout" && round !== "checkout") {
    setRoundState("checkout");
    forgetFlow(); // The next round chooses again.
    track("checkout_started", { path: pathname });
  }

  if (step) {
    track("consultation_step", { ...step, step_index: STEP_ORDER.indexOf(pathname) + 1, path: pathname });
  }
}

/**
 * Starts tracking for the whole app. Called once from _app.js; returns a
 * cleanup function.
 */
export function initMayfairAnalytics() {
  if (typeof window === "undefined") return () => {};

  loadTracker();

  // A known visitor starting a new visit (new session on this full page load).
  run((api, state) => {
    if (state && !state.is_new_visitor && state.is_new_session) {
      oncePerSession("returning_visit", () => track("returning_visit", {}));
    }
  });

  trackRoute(Router.pathname, true);

  const onRouteChange = () => trackRoute(Router.pathname, false);
  Router.events.on("routeChangeComplete", onRouteChange);
  const stopWatchingPatient = watchPatient();

  return () => {
    Router.events.off("routeChangeComplete", onRouteChange);
    stopWatchingPatient();
  };
}
