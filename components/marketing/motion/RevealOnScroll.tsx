"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { fadeUp } from "@/lib/motion-presets";

type Props = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function RevealOnScroll({
  children,
  delay = 0,
  className,
  ...props
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
