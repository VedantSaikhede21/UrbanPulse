import { type Variants, type Transition } from 'framer-motion';

export const fastTransition: Transition = {
  duration: 0.1,
  ease: 'easeOut',
};

export const normalTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
  mass: 0.6,
};

export const expressiveTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: springTransition },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: 40, transition: { duration: 0.15 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

export const pressScale = {
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};
