"use client";

import { useEffect, useState } from "react";
import Router from "next/router";
import PageLoader from "./PageLoader";

const SLOW_AFTER_MS = 5000;
const STUCK_AFTER_MS = 15000;

/**
 * Full-screen loader that never traps the user:
 * - blocks the browser back button while loading
 * - after 5s tells the user their internet is slow
 * - after 15s offers "Try again" (onRetry) and a way out (onCancel)
 */
export default function GuardedLoader({
  show,
  message = "",
  onRetry,
  onCancel,
  retryLabel = "Try again",
  cancelLabel = "Cancel",
}) {
  const [isSlow, setIsSlow] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!show) {
      setIsSlow(false);
      setIsStuck(false);
      return;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    const stuckTimer = setTimeout(() => setIsStuck(true), STUCK_AFTER_MS);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(stuckTimer);
    };
  }, [show, attempt]);

  useEffect(() => {
    if (!show) return;
    Router.beforePopState(() => false);
    return () => Router.beforePopState(() => true);
  }, [show]);

  if (!show) return null;

  const handleRetry = () => {
    setIsStuck(false);
    setAttempt((n) => n + 1);
    onRetry?.();
  };

  const handleCancel = () => {
    Router.beforePopState(() => true);
    onCancel?.();
  };

  return (
    <PageLoader
      message={
        isSlow ? "Your internet connection seems slow. Please wait…" : message
      }
    >
      {isStuck && (
        <div className="mt-3 flex w-full flex-col gap-2.5">
          {onRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
            >
              {retryLabel}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      )}
    </PageLoader>
  );
}
