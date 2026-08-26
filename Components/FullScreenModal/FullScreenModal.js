import { motion, AnimatePresence } from "framer-motion";

export default function FullScreenModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-h-[100dvh] min-h-0 w-full max-w-[760px] overflow-y-auto rounded-none border border-white/60 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:max-h-[calc(100dvh-32px)] sm:rounded-2xl sm:p-6"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 80 }}
            style={{ scrollbarGutter: "stable" }}
          >
            {/* Optional Close Button */}
            {/* <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button> */}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
