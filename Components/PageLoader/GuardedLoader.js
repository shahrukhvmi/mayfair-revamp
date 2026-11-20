"use client";

import { useEffect, useState } from "react";
import Router from "next/router";
import PageLoader from "./PageLoader";

const SLOW_AFTER_MS = 5000;
const SLOW_MESSAGE = "Please wait, this may take a few moments…";

/**
 * Full-screen loader:
 * - blocks the browser back button while loading
 * - after 5s swaps in a "please wait" message
 * Callers may still pass onRetry / onCancel; no buttons are shown any more.
 */
export default function GuardedLoader({ show, message = "" }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsSlow(false);
      return;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(slowTimer);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    Router.beforePopState(() => false);
    return () => Router.beforePopState(() => true);
  }, [show]);

  if (!show) return null;

  return <PageLoader message={isSlow ? SLOW_MESSAGE : message} />;
}
