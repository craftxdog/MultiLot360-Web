"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
}: MotionRevealProps) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 6, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay, duration: 0.35 }}>
      {children}
    </motion.div>
  );
}
