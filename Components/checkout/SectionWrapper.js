import { motion } from "framer-motion";

const SectionWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      type: "spring",
      stiffness: 50, // ⭐ Softer spring (less tight)
      damping: 15, // ⭐ More bounce, slower stop
      duration: 1.2, // ⭐ Slow graceful feel
    }}
    className="relative mb-6 overflow-hidden rounded-2xl border border-[#47317c]/[0.08] bg-white shadow-[0_8px_32px_rgba(71,49,124,0.10)]"
  >
    {children}
  </motion.div>
);

export default SectionWrapper;
