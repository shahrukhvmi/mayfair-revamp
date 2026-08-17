import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const OrderSummaryHeader = ({
  stepNumber,
  title,
  description,
  isCompleted,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] transition-all duration-300 ${
            isCompleted
              ? "bg-[#47317c] text-white"
              : "border-2 border-[#47317c] text-[#47317c] inter-semibold-font"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCompleted ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.3 }}>
                <FiCheck className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div key="number" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.3 }}>
                {stepNumber}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="inter-semibold-font text-[15px] text-slate-900">{title}</h2>
      </div>

      <hr className="border-slate-100 my-4" />

      {description && (
        <p className="inter-reg-font text-[13px] text-slate-500 mb-4">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default OrderSummaryHeader;
