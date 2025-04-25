// components/PageTransitionEvent.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const variants = {
  initial: {
    x: 100, // coming from right
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    x: -100, // moving left
    opacity: 0,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

export default function PageAnimationWrapper({ children }) {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState(router.asPath);

  useEffect(() => {
    setCurrentRoute(router.asPath);
  }, [router.asPath]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentRoute} initial="initial" animate="animate" exit="exit" variants={variants} className="w-full">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
