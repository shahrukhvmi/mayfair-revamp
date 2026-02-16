import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const showClinicalReviewToast = () => {
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1], // smooth cubic-bezier
            }}
            className="
              max-w-xl w-full
              bg-white/95 backdrop-blur-md
              shadow-xl shadow-black/5
              border border-gray-100
              rounded-2xl
              px-6 py-4
              flex items-center justify-between gap-6
            "
          >
            <p className="text-sm text-gray-600 leading-relaxed reg-font">
              <span className="bold-font text-gray-900">Thank you.</span> Your
              information has been submitted for clinical review. Our healthcare
              team will process your order and contact you if any additional
              details are needed.
            </p>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.dismiss(t.id)}
              className="
                px-5 py-2
                rounded-full
                text-sm
                font-medium
                bg-primary
                text-white
                cursor-pointer
                reg-font
              "
            >
              OK
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    {
      duration: Infinity,
    },
  );
};
