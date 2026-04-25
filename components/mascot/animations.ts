import type { Variants, Transition } from "framer-motion";

const idleTransition: Transition = {
  duration: 2.4,
  ease: "easeInOut",
  repeat: Infinity,
};

const celebratingTransition: Transition = {
  duration: 0.6,
  ease: "easeInOut",
  repeat: Infinity,
};

const encouragingTransition: Transition = {
  duration: 2.8,
  ease: "easeInOut",
  repeat: Infinity,
};

export const mascotVariants: Record<"idle" | "celebrating" | "encouraging", Variants> = {
  idle: {
    animate: {
      y: [0, -4, 0],
      rotate: 0,
      scale: 1,
      transition: idleTransition,
    },
  },
  celebrating: {
    animate: {
      rotate: [-8, 8, -8],
      scale: [1, 1.1, 1],
      y: 0,
      transition: celebratingTransition,
    },
  },
  encouraging: {
    animate: {
      rotate: 6,
      scale: [1, 1.02, 1],
      y: 0,
      transition: encouragingTransition,
    },
  },
};

export const sparkleTransition: Transition = {
  duration: 1.2,
  ease: "easeInOut",
  repeat: Infinity,
};

export const sparkleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0.6, 1, 0.6],
    transition: {
      ...sparkleTransition,
      delay: i * 0.18,
    },
  }),
};
