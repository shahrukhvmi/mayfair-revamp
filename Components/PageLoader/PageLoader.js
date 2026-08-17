"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function PageLoader() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/65 px-4 backdrop-blur-[5px]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex min-w-[190px] flex-col items-center gap-3 px-5 py-4"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-[#47317c]/10 blur-2xl"
          animate={reduceMotion ? undefined : { scale: [0.88, 1.08, 0.88], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -3, 0], opacity: [0.78, 1, 0.78] }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative overflow-hidden"
        >
          <img
            src="/images/logo.svg"
            alt="Mayfair Weight Loss Clinic"
            className="h-auto w-[138px] select-none drop-shadow-[0_6px_12px_rgba(71,49,124,0.12)] sm:w-[150px]"
          />

          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              initial={{ x: -55 }}
              animate={{ x: 180 }}
              transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.25 }}
            />
          )}
        </motion.div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-[#47317c] shadow-[0_0_6px_rgba(71,49,124,0.28)]"
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }
              }
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.16,
              }}
            />
          ))}
        </div>

        <span className="sr-only">Loading, please wait</span>
      </motion.div>
    </div>
  );
}
