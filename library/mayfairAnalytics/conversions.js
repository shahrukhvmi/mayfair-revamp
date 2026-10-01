// Mayfair Analytics – signup, patient, order and payment tracking.
//
// Identifying a visitor links records to them; it never changes their first
// or last touch, so "Google Ads -> WordPress -> Consultation -> Signup" keeps
// Google Ads as the acquisition source.

import useUserDataStore from "@/store/userDataStore";
import getOrderByIdApi from "@/api/getOrderByIdApi";
import { identify, oncePerBrowser, oncePerSession, run, track } from "./tracker";

/* ------------------------------------------------------------ attribution */

/**
 * First/last touch for the app's own backend calls (/PatientSources). The
 * tracker keeps localStorage "mayfair_attribution" in the format this app has
 * always used, so this returns the plugin's attribution in that same shape.
 */
export function getStoredAttribution() {
  if (typeof window === "undefined") return null;
  const api = window.MayfairAnalytics;
  const live = api && api.getAttribution ? api.getAttribution() : null;
  if (live && live.first_touch) {
    return { first_touch: live.first_touch, last_touch: live.last_touch };
  }
  try {
    return JSON.parse(localStorage.getItem("mayfair_attribution") || "null");
  } catch (e) {
    return null;
  }
}

/** The first/last touch fields /PatientSources expects (unchanged format and defaults). */
export function toPatientSourceTouches(stored) {
  const pick = (touch) => ({
    channel: touch?.channel || "Direct",
    source: touch?.source || "direct",
    medium: touch?.medium || "none",
    paid_status: touch?.paid_status || "unknown",
  });
  return {
    first_touch: pick(stored?.first_touch),
    last_touch: pick(stored?.last_touch),
  };
}

/**
 * Send-once bookkeeping, so a refreshed thank-you page does not report the
 * same order to the backend twice. (The app used to prevent that by deleting
 * the attribution after sending, which also lost it for every later order.)
 * Marked only after a successful send, so a failed call is retried on refresh.
 */
export function alreadySent(key) {
  try {
    return Boolean(localStorage.getItem(`mfa:sent:${key}`));
  } catch (e) {
    return false;
  }
}

export function markSent(key) {
  try {
    localStorage.setItem(`mfa:sent:${key}`, "1");
  } catch (e) {
    // Storage unavailable: nothing to remember.
  }
}

/* ---------------------------------------------------------------- patient */

// Patients whose signup is being reported right now, so the generic
// "user signed in" link below does not report them as a plain login first.
const signingUp = new Set();

/** A new account was created in the consultation (email confirmation step). */
export function trackSignup(user, email) {
  if (!user?.id) return;
  signingUp.add(String(user.id));
  identify("patient", user.id, {
    email: user.email || email || "",
    signup_status: "signed_up",
    returning_patient: Boolean(user.isReturning),
  });
  track("signup", { returning_patient: user.isReturning ? "yes" : "no" });
}

function linkPatient(user) {
  if (!user?.id) return;
  run((api, state) => {
    // Checked when it runs: the signup handler sets userData just before it
    // reports the signup, so this sees the signup and stands aside.
    if (signingUp.has(String(user.id))) return;
    const key = `mfa:patient:${state?.visitor_id}:${user.id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch (e) {
      // continue
    }
    api.identify("patient", String(user.id), {
      email: user.email || "",
      returning_patient: Boolean(user.isReturning),
    });
  });
}

/**
 * Links the visitor to the patient whenever anyone signs in, wherever that
 * happens (login page, header, login modal) – they all set userData.
 */
export function watchPatient() {
  linkPatient(useUserDataStore.getState().userData);
  return useUserDataStore.subscribe((state, previous) => {
    const user = state.userData;
    if (user?.id && user.id !== previous?.userData?.id) linkPatient(user);
  });
}

/* ---------------------------------------------------------- orders/payments */

const PAYMENT_STATUS = [
  ["refunded", /refund/],
  ["cancelled", /cancel|void|abandon/],
  ["failed", /fail|declin|error|reject|denied/],
  ["paid", /^(paid|success|successful|succeeded|captured|complete|completed|approved|settled)$/],
  ["pending", /pend|process|await|incomplete|initiat|hold|unpaid/],
];

/**
 * Maps a backend payment status to pending / paid / failed / cancelled /
 * refunded. Anything unrecognised (or missing) is "unknown", which never
 * changes the stored status – an order is never marked paid by guesswork.
 */
export function normalizePaymentStatus(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "unknown";
  const match = PAYMENT_STATUS.find(([, pattern]) => pattern.test(value));
  return match ? match[0] : "unknown";
}

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : undefined;
}

// IPG sends ISO 4217 numeric codes; 826 is GBP.
function toCurrency(value) {
  const v = String(value || "").trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(v)) return v;
  return v === "826" || !v ? "GBP" : undefined;
}

/** The order was created by the backend; payment has not been attempted yet. */
export function trackOrderCreated({ orderId, value, currency = "GBP" }) {
  if (!orderId) return;
  const amount = toNumber(value);
  identify("order", orderId, {
    order_status: "created",
    payment_status: "pending",
    value: amount,
    currency: toCurrency(currency),
  });
  track("order_created", { order_id: String(orderId), value: amount, currency: toCurrency(currency) });
}

/** The visitor is being sent to the payment gateway for this order. */
export function trackPaymentAttempt(paymentData) {
  const orderId = paymentData?.order_id || paymentData?.oid;
  if (!orderId) return;
  const value = toNumber(paymentData?.chargetotal);
  const currency = toCurrency(paymentData?.currency);
  identify("order", orderId, {
    payment_status: "pending",
    payment_attempt_at: new Date().toISOString(),
    value,
    currency,
  });
  track("payment_attempt", { order_id: String(orderId), value, currency, gateway: "ipg" });
}

function latestPayment(order) {
  const payments = order?.payments;
  if (Array.isArray(payments)) return payments[payments.length - 1] || null;
  return payments || null;
}

/**
 * Reports an order's real state as the backend returns it (order status,
 * payment status, total, method). Used on the thank-you page and whenever an
 * order is viewed, so later cancellations and refunds are picked up too.
 */
export function syncOrderStatus(order, { thankYou = false } = {}) {
  if (!order?.id) return;
  const payment = latestPayment(order);
  const rawPayment = payment?.status || order?.payment_status || "";
  const paymentStatus = normalizePaymentStatus(rawPayment);
  const orderId = String(order.id);

  const meta = {
    order_status: order?.status || "",
    payment_status: paymentStatus,
    payment_status_raw: rawPayment,
    value: toNumber(order?.total_price ?? order?.consultation?.fields?.checkout?.total),
    currency: "GBP",
    payment_method: payment?.payment_method || payment?.method || payment?.card_brand || "",
  };
  if (thankYou) meta.thank_you_at = new Date().toISOString();
  identify("order", orderId, meta);

  if (thankYou) {
    oncePerSession(`thank_you:${orderId}`, () =>
      track("thank_you", { order_id: orderId, payment_status: paymentStatus }),
    );
  }

  const outcome = {
    paid: "payment_success",
    failed: "payment_failed",
    cancelled: "payment_cancelled",
    refunded: "payment_refunded",
  }[paymentStatus];
  if (outcome) {
    oncePerBrowser(`${outcome}:${orderId}`, () =>
      track(outcome, { order_id: orderId, source: "order_record" }),
    );
  }
}

/**
 * Thank-you page. /GetUserOrder may not include the payment record, in which
 * case the full order is read so the payment status is the backend's, not an
 * assumption that reaching this page means it was paid.
 */
export function recordThankYou(order) {
  if (!order?.id) return;
  if (latestPayment(order)?.status || order?.payment_status) {
    syncOrderStatus(order, { thankYou: true });
    return;
  }
  getOrderByIdApi(order.id)
    .then((res) => syncOrderStatus(res?.data?.data?.order || order, { thankYou: true }))
    .catch(() => syncOrderStatus(order, { thankYou: true }));
}

/**
 * The payment gateway sent the visitor to its failure URL for this order.
 * That redirect is the gateway's own report of the attempt, so it is
 * recorded as a failed payment (a later successful retry replaces it).
 */
export function trackPaymentFailed(orderId) {
  track("payment_failed", { order_id: orderId ? String(orderId) : "", source: "gateway_redirect" });
  if (orderId) {
    identify("order", orderId, { payment_status: "failed", evidence: "gateway_fail_redirect" });
  }
}
