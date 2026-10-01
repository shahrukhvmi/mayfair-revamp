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

// Reaching one of these routes marks a stage, once per session.
const STAGES = {
  "/acknowledgment": ["consultation_started", { type: "new_patient" }],
  "/re-order": ["consultation_started", { type: "reorder" }],
  "/steps-information": ["consultation_started", { type: "continue" }],
  "/gathering-data": ["consultation_completed", {}],
  "/checkout": ["checkout_started", {}],
};

function trackRoute(pathname, initial) {
  if (!initial) pageView();

  oncePerSession("consultation_opened", () =>
    track("consultation_opened", { path: pathname }),
  );

  const stage = STAGES[pathname];
  if (stage) {
    oncePerSession(stage[0], () =>
      track(stage[0], { ...stage[1], path: pathname }),
    );
  }

  const step = STEPS[pathname];
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
