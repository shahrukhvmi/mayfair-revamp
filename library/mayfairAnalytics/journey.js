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

function chosenFlow() {
  try {
    return window.sessionStorage.getItem(FLOW_KEY) || "";
  } catch (e) {
    return "";
  }
}

function trackRoute(pathname, initial) {
  if (!initial) pageView();

  oncePerSession("consultation_opened", () =>
    track("consultation_opened", { path: pathname }),
  );

  const entry = ENTRIES[pathname];
  if (entry) {
    rememberFlow(entry);
    oncePerSession(`consultation_entry:${entry}`, () =>
      track("consultation_entry", { type: entry, path: pathname }),
    );
  }

  const step = STEPS[pathname];
  const round = roundState();
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
    track("checkout_started", { path: pathname });
  }

  if (step) {
    track("consultation_step", { ...step, path: pathname });
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
