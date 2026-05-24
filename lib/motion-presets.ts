import type { Transition, Variants } from "framer-motion";

/** Smooth, fluid easing — premium SaaS feel */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 22,
  mass: 0.8,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 60,
  damping: 18,
  mass: 1,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_SMOOTH },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_SMOOTH },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

export const floatY = (distance = 10, duration = 5) => ({
  y: [0, -distance, 0],
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});

export const slowRotate = (duration = 28) => ({
  rotate: 360,
  transition: {
    duration,
    repeat: Infinity,
    ease: "linear" as const,
  },
});

export const pulseOpacity = (min = 0.35, max = 1, duration = 2.4) => ({
  opacity: [min, max, min],
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});
