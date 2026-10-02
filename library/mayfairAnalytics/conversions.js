// Mayfair Analytics – signup, patient, order and payment tracking.
//
// Identifying a visitor links records to them; it never changes their first
// or last touch, so "Google Ads -> WordPress -> Consultation -> Signup" keeps
// Google Ads as the acquisition source.

import useUserDataStore from "@/store/userDataStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useAuthStore from "@/store/authStore";
import useImpersonate from "@/store/useImpersonateStore";
import getOrderByIdApi from "@/api/getOrderByIdApi";
import { identify, identifyConfirmed, oncePerBrowser, oncePerSession, run, track } from "./tracker";
import { crmTime, fetchPatientOrders } from "./patientOrders";

/* ------------------------------------------------------------ attribution */

/**
 * First/last touch for the app's own backend calls (/PatientSources). The
 * tracker keeps localStorage "mayfair_attribution" in the format this app has
 * always used, so this returns the plugin's attribution in that same shape.
 */
export function getStoredAttribution() {
  if (typeof window === "undefined") return null;
  const api = window.JourneyAnalytics;
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

// Links being sent in this page load, so the same one is never sent twice at once.
const sending = new Set();

// How each patient seen in this page load signed in (already_logged_in / logged_in).
const signedInHow = {};

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

/**
 * The signed-in patient, or null. Every sign-in path (login page, header login
 * modal, signup, impersonation) sets authUserDetail and/or userData; a patient
 * only counts as signed in while the app holds their token.
 */
function signedInPatient() {
  if (!useAuthStore.getState().token) return null;
  const detail = useAuthUserDetailStore.getState().authUserDetail;
  const user = detail?.id ? detail : useUserDataStore.getState().userData;
  return user?.id ? user : null;
}

/** Staff signed in as a patient (impersonation) must never be linked to that patient. */
function impersonating() {
  return Boolean(useImpersonate.getState().impersonate);
}

function sessionFlag(key) {
  try {
    return Boolean(window.sessionStorage.getItem(key));
  } catch (e) {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch (e) {
    // Storage unavailable: the link is simply sent again next time.
  }
}

/**
 * Links this visitor to the signed-in patient, once per tracker session.
 * how: "already_logged_in" (signed in when the app loaded) or "logged_in"
 * (signed in during this visit). The server keeps whichever it saw first.
 * Then reads the patient's order history once per session, so the plugin can
 * mark them as a returning patient (a paid order before this visitor was
 * first seen) or a new one.
 *
 * Marked as done only after the server confirms, so a failed send is retried
 * on the next page or event instead of being lost.
 */
function linkPatient(how) {
  run((api, state) => {
    const user = signedInPatient();
    if (!user || impersonating()) return;
    const id = String(user.id);
    // The signup handler reports this patient itself, with signup_status "signed_up".
    if (signingUp.has(id)) return;

    const base = `mfa:patient:${state?.session_id}:${state?.visitor_id}:${id}`;
    const meta = { email: user.email || "", signup_status: how };
    if (user.isReturning !== undefined && user.isReturning !== null) {
      meta.returning_patient = Boolean(user.isReturning);
    }

    if (!sessionFlag(base) && !sending.has(base)) {
      sending.add(base);
      identifyConfirmed("patient", id, meta).then((ok) => {
        sending.delete(base);
        if (ok) setSessionFlag(base);
      });
    }

    const ordersKey = `${base}:orders`;
    if (!sessionFlag(ordersKey) && !sending.has(ordersKey)) {
      sending.add(ordersKey);
      fetchPatientOrders(useAuthStore.getState().token)
        .then((orders) => {
          if (!orders || signedInPatient()?.id !== user.id) return false;
          return identifyConfirmed("patient", id, {
            ...meta,
            orders_checked: true,
            orders_complete: orders.complete,
            orders_total: orders.total,
            orders_first_on: orders.firstOn,
            orders_last_on: orders.lastOn,
            paid_orders: orders.paid,
          });
        })
        .then((ok) => {
          sending.delete(ordersKey);
          if (ok) setSessionFlag(ordersKey);
        })
        .catch(() => sending.delete(ordersKey));
    }
  });
}

/**
 * Links the visitor to the patient whenever someone is signed in, wherever
 * that happens: already signed in when the app loads, or signing in later
 * through the login page, the header login modal or signup. Watches the
 * patient stores and the token, since each path sets a different mix of them.
 */
export function watchPatient() {
  const patientId = () => signedInPatient()?.id ?? null;
  let current = patientId();
  if (current) {
    signedInHow[current] = "already_logged_in";
    linkPatient("already_logged_in");
  }

  const check = () => {
    const next = patientId();
    if (next && next !== current) {
      signedInHow[next] = signedInHow[next] || "logged_in";
      linkPatient(signedInHow[next]);
    }
    current = next;
  };
  const stops = [
    useAuthStore.subscribe(check),
    useAuthUserDetailStore.subscribe(check),
    useUserDataStore.subscribe(check),
  ];
  return () => stops.forEach((stop) => stop());
}

/** Before an order or payment is reported, make sure the visitor is linked to the patient. */
function ensurePatientLinked() {
  const user = signedInPatient();
  if (user) linkPatient(signedInHow[user.id] || "logged_in");
}

/* ---------------------------------------------------------- orders/payments */

const PAYMENT_STATUS = [
  ["refunded", /refund/],
  ["cancelled", /cancel|void|abandon/],
  ["failed", /fail|declin|error|reject|denied/],
  ["paid", /^(paid|success|successful|succeeded|captured|complete|completed|approved|settled)$/],
  // "Not attempted" (order created, no payment yet) is unconfirmed, not unknown.
  ["pending", /pend|process|await|incomplete|initiat|hold|unpaid|not attempt/],
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
  ensurePatientLinked();
  const amount = toNumber(value);
  identify("order", orderId, {
    context: "checkout",
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
  ensurePatientLinked();
  const value = toNumber(paymentData?.chargetotal);
  const currency = toCurrency(paymentData?.currency);
  identify("order", orderId, {
    context: "checkout",
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
 * payment status, total, method, and the order system's own order and payment
 * times). Used on the thank-you page and whenever an order is viewed, so later
 * cancellations and refunds are picked up too.
 *
 * Viewing an order is reported as "order_viewed", never as a checkout or a
 * payment: the plugin keeps an order the person only looked at apart from the
 * orders placed in this visit, with its real dates.
 */
export function syncOrderStatus(order, { thankYou = false } = {}) {
  if (!order?.id) return;
  ensurePatientLinked();
  const payment = latestPayment(order);
  const rawPayment = payment?.status || order?.payment_status || "";
  const paymentStatus = normalizePaymentStatus(rawPayment);
  const orderId = String(order.id);

  const meta = {
    context: thankYou ? "thank_you" : "view",
    order_status: order?.status || "",
    payment_status: paymentStatus,
    payment_status_raw: rawPayment,
    value: toNumber(order?.total_price ?? order?.consultation?.fields?.checkout?.total),
    currency: "GBP",
    payment_method: payment?.payment_method || payment?.method || payment?.card_brand || "",
  };
  const createdAt = crmTime(order?.created_at, order?.created_at_time);
  if (createdAt) meta.order_created_at = createdAt;
  const paidAt = paymentStatus === "paid" ? crmTime(payment?.paid_at || payment?.updated_at || payment?.created_at) : "";
  if (paidAt) meta.paid_at = paidAt;
  if (thankYou) meta.thank_you_at = new Date().toISOString();
  identify("order", orderId, meta);

  if (!thankYou) {
    oncePerSession(`order_viewed:${orderId}`, () =>
      track("order_viewed", { order_id: orderId, payment_status: paymentStatus }),
    );
    return;
  }

  oncePerSession(`thank_you:${orderId}`, () =>
    track("thank_you", { order_id: orderId, payment_status: paymentStatus }),
  );

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
  ensurePatientLinked();
  track("payment_failed", { order_id: orderId ? String(orderId) : "", source: "gateway_redirect" });
  if (orderId) {
    identify("order", orderId, { context: "checkout", payment_status: "failed", evidence: "gateway_fail_redirect" });
  }
}
