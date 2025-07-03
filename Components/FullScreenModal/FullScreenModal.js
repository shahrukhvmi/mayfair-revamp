import { motion, AnimatePresence } from "framer-motion";

export default function FullScreenModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white w-full max-w-2xl overflow-y-auto p-6 sm:p-8 shadow-xl !rounded-md"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 80 }}
            style={{
              borderRadius: 0, // No rounded corners
              scrollbarGutter: 'stable',
            }}
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
