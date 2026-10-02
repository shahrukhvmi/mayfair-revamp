// Mayfair Analytics – the signed-in patient's own order history, used only to
// tell a returning patient (already had a paid order) from a new one.
//
// Read with plain axios, not the app's Fetcher: this background check must
// never trigger the app's own 401 handling (sign-out) or show an error.

import axios from "axios";
import { app_url } from "@/config/constants";

// Order statuses that mean the order was paid (an unpaid order stays "incomplete").
const PAID_ORDER_STATUS = /^(processing|approved|complete|completed|shipped|dispatched|delivered|paid|prescribed)$/;
const PAYMENT_OK = /^(paid|success|successful|succeeded|captured|complete|completed|approved|settled)$/;
const PAYMENT_KNOWN = /refund|cancel|void|fail|declin|error|reject|denied|pend|process|await|incomplete|initiat|hold|unpaid|not attempt/;

// Enough for any patient's history; stops early when the list is complete.
const MAX_PAGES = 5;

function latestPaymentStatus(order) {
  const payments = order?.payments;
  const payment = Array.isArray(payments) ? payments[payments.length - 1] : payments;
  return String(payment?.status || order?.payment_status || "").trim().toLowerCase();
}

/** Paid by the order's payment record when it has one, otherwise by its status. */
export function isPaidOrder(order) {
  const payment = latestPaymentStatus(order);
  if (PAYMENT_OK.test(payment)) return true;
  if (payment && PAYMENT_KNOWN.test(payment)) return false;
  return PAID_ORDER_STATUS.test(String(order?.status || "").trim().toLowerCase());
}

/** The order date as YYYY-MM-DD, or "" when it cannot be read reliably. */
export function orderDay(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  let m = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // UK style: 02-10-2026, 02/10/2026, 2.10.2026
  m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const time = Date.parse(text);
  if (Number.isNaN(time)) return "";
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The order system's times are UK wall-clock times.
function lastSunday(year, monthIndex) {
  const d = new Date(Date.UTC(year, monthIndex + 1, 0));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.getUTCDate();
}

/** "+01:00" during British Summer Time (last Sunday of March to last Sunday of October), else "+00:00". */
function ukOffset(y, m, d, hh) {
  const time = Date.UTC(y, m - 1, d, hh) - 3600000; // as if BST, in UTC
  const start = Date.UTC(y, 2, lastSunday(y, 2), 1);
  const end = Date.UTC(y, 9, lastSunday(y, 9), 1);
  return time >= start && time < end ? "+01:00" : "+00:00";
}

/**
 * An order-system date and optional time as ISO 8601 with the UK offset
 * ("2026-09-30T21:29:02+01:00"), the date alone ("2026-09-30") when there is
 * no usable time, an ISO value with its own offset unchanged, or "".
 */
export function crmTime(date, time) {
  const text = String(date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/.test(text)) return text;
  const day = orderDay(text);
  if (!day) return "";
  // The time may be in the date ("2026-09-30 21:29:02") or separate ("21:29", "09:29 PM").
  const rest = time ? String(time) : text.slice(10);
  const m = String(rest).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?/i);
  if (!m) return day;
  let hh = Number(m[1]);
  const ampm = (m[4] || "").toLowerCase();
  if (ampm === "pm" && hh < 12) hh += 12;
  if (ampm === "am" && hh === 12) hh = 0;
  if (hh > 23 || Number(m[2]) > 59) return day;
  const [y, mo, d] = day.split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  return `${day}T${pad(hh)}:${m[2]}:${m[3] || "00"}${ukOffset(y, mo, d, hh)}`;
}

/**
 * Resolves { paid: [{ id, date }], total, complete, firstOn, lastOn } for the signed-in patient,
 * or null when the history cannot be read (no token, network, API change).
 */
export async function fetchPatientOrders(token) {
  if (!token || !app_url) return null;
  const orders = [];
  let total = 0;
  let complete = false;
  let read = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let list;
    try {
      const res = await axios.get("order/myorders", {
        baseURL: app_url,
        params: { page },
        timeout: 20000,
        headers: { Accept: "application/json", "Company-Id": 1, Authorization: `Bearer ${token}` },
      });
      list = res?.data?.myorders;
    } catch (e) {
      break;
    }
    const rows = Array.isArray(list?.allorders) ? list.allorders : null;
    if (!rows) break;
    read = true;
    total = Number(list?.total) || 0;
    orders.push(...rows);
    if (!rows.length || orders.length >= total) {
      complete = true;
      break;
    }
  }
  if (!read) return null;
  const paid = orders
    .filter((o) => o?.id !== undefined && o?.id !== null && o?.id !== "" && isPaidOrder(o))
    .map((o) => ({ id: String(o.id), date: orderDay(o.created_at) }));
  const days = orders.map((o) => orderDay(o?.created_at)).filter(Boolean).sort();
  return {
    paid,
    total: Math.max(total, orders.length),
    complete,
    // First and last order dates, only when the whole list was read.
    firstOn: complete && days.length ? days[0] : "",
    lastOn: days.length ? days[days.length - 1] : "",
  };
}
