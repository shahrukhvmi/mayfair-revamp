import { motion } from "framer-motion";

const SectionWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="bg-white rounded-xl shadow-sm p-6 mb-8"
  >
    {children}
  </motion.div>
);

export default SectionWrapper;
